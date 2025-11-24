export type GhostLogEntry = {
  raw: string;
  parsed: {
    text: string;
    style?: Record<string, string>;
  };
  meta: {
    file: string;
    line: number;
    column: number;
  } | null;
  level: "log" | "warn" | "error" | "info";
  timestamp: number;
};

export class GhostConsole {
  private serverUrl: string;

  constructor(serverUrl: string) {
    this.serverUrl = serverUrl;
    this.patchConsole();
  }

  private sendToServer(entry: GhostLogEntry) {
    fetch(this.serverUrl + "/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    }).catch(() => {});
  }

  private getCaller() {
    const err = new Error();
    const lines = (err.stack ?? "").split("\n").map((l) => l.trim());

    const caller =
      lines.find((l) => l.includes(".js") || l.includes(".ts")) ??
      lines[3] ??
      lines[2];

    const match = caller?.match(/(.*):(\d+):(\d+)/);

    if (!match) return null;

    let file = match[1].replace(/^https?:\/\/[^/]+/, "");
    file = file.replace(/\?.*/, "");

    return {
      file,
      line: Number(match[2]),
      column: Number(match[3]),
    };
  }

  private buildEntry(
    level: GhostLogEntry["level"],
    args: any[]
  ): GhostLogEntry {
    const raw = args.join(" ");

    return {
      raw,
      parsed: { text: raw },
      meta: this.getCaller(),
      level,
      timestamp: Date.now(),
    };
  }

  private patchConsole() {
    const origLog = console.log;
    const origWarn = console.warn;
    const origError = console.error;
    const origInfo = console.info;

    console.log = (...args) => {
      const entry = this.buildEntry("log", args);
      this.sendToServer(entry);
      origLog(...args);
    };

    console.warn = (...args) => {
      const entry = this.buildEntry("warn", args);
      this.sendToServer(entry);
      origWarn(...args);
    };

    console.error = (...args) => {
      const entry = this.buildEntry("error", args);
      this.sendToServer(entry);
      origError(...args);
    };

    console.info = (...args) => {
      const entry = this.buildEntry("info", args);
      this.sendToServer(entry);
      origInfo(...args);
    };
  }
}
