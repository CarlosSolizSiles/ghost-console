# GhostConsole

GhostConsole is a small TypeScript utility that enhances the native JavaScript console by capturing logs, warnings, errors and info messages and forwarding structured entries to a remote server in real time. It preserves the original console behavior while collecting metadata (file, line, column), timestamps and optional CSS-style segments.

## Features

- Overrides console methods: `log`, `warn`, `error`, `info` without breaking original output.
- Sends structured JSON entries to a remote endpoint (`POST /log`).
- Captures caller metadata: source file, line and column (when available).
- Supports CSS-style segments via `"%c"` in the format string and converts styles to camelCase keys.
- Timestamped and typed entries with level and raw message.

## Installation

This repository contains the source implementation. To add to a project, copy the TypeScript file or import the package if published.

Install via npm:

```bash
npm install github:CarlosSolizSiles/ghost-console
```

Example (local import):

```ts
import { GhostConsole } from "ghost-console";
new GhostConsole("https://your-server.example.com");
```

> Note: GhostConsole uses `fetch` to post log entries. Ensure `fetch` is available in your environment (modern browsers, Node 18+, or polyfill in older Node versions).

## Quick Start

1. Initialize GhostConsole early in your app:

```ts
import { GhostConsole } from "ghost-console";

const gc = new GhostConsole("https://your-server.example.com");
console.log("Hello world");
console.warn("This is a warning");
console.error("This is an error");
```

2. Use styled segments with `%c` (browser console style syntax):

```ts
console.log("%cNormal %cRed Bold", "", "color:red; font-weight:bold;");
```

GhostConsole will produce segments like:

- { text: "Normal", style: undefined }
- { text: "Red Bold", style: { color: "red", fontWeight: "bold" } }

## Log entry schema

Each POST payload sent to `${serverUrl}/log` has the shape:

```json
{
  "raw": "original joined args",
  "segments": [
    { "text": "segment text", "style": { "color": "red" } }
  ],
  "meta": { "file": "/path/to/file.js", "line": 10, "column": 5 } | null,
  "level": "log" | "warn" | "error" | "info",
  "timestamp": 1699999999999
}
```

## Server expectations

- Endpoint: POST {serverUrl}/log
- Content-Type: application/json
- Payload: one JSON object per console call (see schema above)
- Server should be tolerant to occasional duplicate or out-of-order entries.

## Limitations & notes

- Only `%c`-style formatting is parsed for styling. Other console format specifiers (e.g., `%s`, `%d`) are not specially parsed.
- Caller metadata depends on the runtime stack trace format; some environments may not include file/line/column.
- fetch errors are swallowed to avoid breaking the host application.

## Contributing

Contributions are welcome: bug reports, improvements to parsing, and support for more environments.

## License

Specify your preferred license (MIT, Apache-2.0, etc.) in the repository.
