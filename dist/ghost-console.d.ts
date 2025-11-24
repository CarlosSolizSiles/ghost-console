export type GhostLogSegment = {
    text: string;
    style?: Record<string, string>;
};
export type GhostLogEntry = {
    raw: string;
    segments: GhostLogSegment[];
    meta: {
        file: string;
        line: number;
        column: number;
    } | null;
    level: "log" | "warn" | "error" | "info";
    timestamp: number;
};
export declare class GhostConsole {
    private serverUrl;
    constructor(serverUrl: string);
    private sendToServer;
    private getCaller;
    private buildEntry;
    private convertStyle;
    private parseStyledMessage;
    private patchConsole;
}
