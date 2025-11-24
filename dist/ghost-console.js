export class GhostConsole {
    constructor(serverUrl) {
        this.serverUrl = serverUrl;
        this.patchConsole();
    }
    sendToServer(entry) {
        fetch(this.serverUrl + "/log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(entry),
        }).catch(() => { });
    }
    getCaller() {
        const err = new Error();
        const lines = (err.stack ?? "").split("\n").map((l) => l.trim());
        const caller = lines.find((l) => l.includes(".js") || l.includes(".ts")) ??
            lines[3] ??
            lines[2];
        const match = caller?.match(/(.*):(\d+):(\d+)/);
        if (!match)
            return null;
        let file = match[1].replace(/^https?:\/\/[^/]+/, "");
        file = file.replace(/\?.*/, "");
        return {
            file,
            line: Number(match[2]),
            column: Number(match[3]),
        };
    }
    buildEntry(level, args) {
        return {
            ...this.parseStyledMessage(level, ...args),
            timestamp: Date.now(),
        };
    }
    convertStyle(styleStr) {
        const style = {};
        styleStr.split(";").forEach((rule) => {
            const [prop, value] = rule.split(":").map((s) => s.trim());
            if (!prop || !value)
                return;
            const camel = prop.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            style[camel] = value;
        });
        return style;
    }
    parseStyledMessage(level, ...args) {
        const meta = this.getCaller();
        const raw = args.join(" ");
        let segments = [];
        // Si no hay estilos, todo es un solo bloque
        if (typeof args[0] !== "string" || !args[0].includes("%c")) {
            segments.push({ text: raw });
            return { raw, segments, meta, level };
        }
        const fmt = args[0];
        const styles = args.slice(1); // cada argumento después del primero es un style
        // Dividir el string por cada %c
        const parts = fmt.split("%c");
        // Índice de estilo actual
        let styleIndex = 0;
        for (let i = 0; i < parts.length; i++) {
            const text = parts[i].trim();
            if (!text)
                continue;
            let style;
            // El primer texto (antes del primer %c) NO tiene estilo
            if (i > 0) {
                style = this.convertStyle(styles[styleIndex] ?? "");
                styleIndex++;
            }
            segments.push({ text, style });
        }
        return { raw, segments, meta, level };
    }
    patchConsole() {
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
