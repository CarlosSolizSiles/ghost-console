# GhostConsole

**GhostConsole** is a TypeScript utility that enhances the standard JavaScript `console` by capturing logs, warnings, errors, and info messages, and sending them to a remote server in real-time. It also tracks metadata about the caller file, line, and column, making debugging and monitoring more effective.

---

## Features

- Overrides standard `console` methods (`log`, `warn`, `error`, `info`) without affecting their default behavior.
- Sends structured log entries to a remote server endpoint (`POST /log`).
- Captures caller metadata: file, line, and column number.
- Supports timestamped log entries.
- Provides structured `GhostLogEntry` objects with optional styling information.

---

## Installation

Install via npm:

```bash
npm install ghost-console
```
