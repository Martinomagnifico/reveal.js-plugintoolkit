/**
 * Type definition for console.table method to ensure proper typing
 * Extended to optionally include a message before the table
 */
type TableMethod = {
    (tabularData: unknown, properties?: readonly string[]): void;
    (message: string, tabularData: unknown, properties?: readonly string[]): void;
};
/**
 * Type definition mapping all console methods to a simplified function signature.
 * This creates a type with all the same method names as the Console interface
 * but with a consistent parameter and return type.
 */
type ConsoleMethods = {
    [K in keyof Console]: K extends 'table' ? TableMethod : Console[K] extends ((...args: unknown[]) => unknown) ? (...args: unknown[]) => void : never;
};
/**
 * Combined type that includes both the Debug class methods and all console methods.
 * This allows TypeScript to recognize dynamically added console methods.
 */
type DebugWithConsoleMethods = PluginDebug & ConsoleMethods;
/**
 * Debug utility class that provides enhanced console logging capabilities.
 *
 * Features:
 * - Global on/off toggle for all debug output
 * - Custom label prefixing for messages
 * - Dynamic access to all console methods
 * - Smart handling of console groups
 */
declare class PluginDebug {
    /** Flag to enable/disable all debugging output */
    debugMode: boolean;
    /** Label to prefix all debug messages with */
    label: string;
    /** Tracks the current depth of console groups for proper formatting */
    groupDepth: number;
    /**
     * Initializes the debug utility with custom settings.
     *
     * @param isDebug - Whether debug output should be enabled
     * @param label - Custom label to prefix all debug messages with
     */
    initialize(isDebug: boolean, label?: string): void;
    /**
     * Creates a new console group and tracks the group depth.
     * Groups will always display the label prefix in their header.
     *
     * @param args - Arguments to pass to console.group
     */
    group: (...args: unknown[]) => void;
    /**
     * Creates a new collapsed console group and tracks the group depth.
     *
     * @param args - Arguments to pass to console.groupCollapsed
     */
    groupCollapsed: (...args: unknown[]) => void;
    /**
     * Ends the current console group and updates the group depth tracker.
     */
    groupEnd: () => void;
    /**
     * Formats and logs an error message with the debug label.
     * Error messages are always shown, even when debug mode is disabled.
     *
     * @param args - Arguments to pass to console.error
     */
    error: (...args: unknown[]) => void;
    /**
     * Displays a table in the console with the pluginDebug label.
     * Special implementation for console.table to handle tabular data properly.
     *
     * @param messageOrData - Either a message string or the tabular data
     * @param propertiesOrData - Either property names or tabular data (if first param was message)
     * @param optionalProperties - Optional property names (if first param was message)
     */
    table: TableMethod;
    /**
     * Helper method that formats and logs messages with the pluginDebug label.
     *
     * @param logMethod - The console method to use for logging
     * @param args - Arguments to pass to the console method
     */
    formatAndLog: (logMethod: (...args: unknown[]) => void, args: unknown[]) => void;
    /**
     * Core method that handles calling console methods with proper formatting.
     * - Adds label prefix to messages outside of groups
     * - Skips label prefix for messages inside groups to avoid redundancy
     * - Always adds label prefix to group headers
     * - Error messages are always shown regardless of debug mode
     *
     * @param methodName - Name of the console method to call
     * @param args - Arguments to pass to the console method
     */
    debugLog(methodName: keyof Console, ...args: unknown[]): void;
}
export declare const pluginDebug: DebugWithConsoleMethods;
export {};
