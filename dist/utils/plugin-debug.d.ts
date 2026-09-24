type TableMethod = {
    (tabularData: unknown, properties?: readonly string[]): void;
    (message: string, tabularData: unknown, properties?: readonly string[]): void;
};
type ConsoleMethods = {
    [K in keyof Console]: K extends 'table' ? TableMethod : Console[K] extends ((...args: unknown[]) => unknown) ? (...args: unknown[]) => void : never;
};
export type DebugWithConsoleMethods = PluginDebug & ConsoleMethods;
declare class PluginDebug {
    debugMode: boolean;
    label: string;
    groupDepth: number;
    /**
     * Lines held back while a group is open.
     *
     * `console.group` is one stack shared by the whole page, so a group left open
     * across an `await` catches whatever anyone else logs in the meantime — a
     * second deck starting up, or another plugin entirely, ends up filed inside
     * it. Holding the lines and writing them out in one burst at `groupEnd`
     * means the group is never open while anything else can log, so nothing
     * foreign can fall into it.
     */
    private pending;
    /** Every console call goes through here, so it can be buffered or written. */
    private emit;
    /** Write the held lines out together, group header and all. */
    private flush;
    initialize(isDebug: boolean, label?: string): void;
    group: (...args: unknown[]) => void;
    groupCollapsed: (...args: unknown[]) => void;
    groupEnd: () => void;
    error: (...args: unknown[]) => void;
    table: TableMethod;
    formatAndLog: (logMethod: (...args: unknown[]) => void, args: unknown[]) => void;
    debugLog(methodName: keyof Console, ...args: unknown[]): void;
}
export declare const pluginDebug: DebugWithConsoleMethods;
/**
 * A debug channel of its own, with its own label, group depth and buffer.
 *
 * `pluginDebug` is one object per bundle, so two decks of the same plugin share
 * it: the second to open a group nests inside the first, because a line arriving
 * from either deck looks the same to a shared instance. A channel per deck gives
 * each one its own group, opened and flushed independently of the other.
 */
export declare const createPluginDebug: () => DebugWithConsoleMethods;
export declare const warnOnce: (pluginId: string, message: string) => void;
export {};
