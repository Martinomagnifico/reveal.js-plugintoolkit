// Type definition for console.table method to ensure proper typing, Extended to optionally include a message before the table
type TableMethod = {
	(tabularData: unknown, properties?: readonly string[]): void;
	(message: string, tabularData: unknown, properties?: readonly string[]): void;
};

// Type definition mapping all console methods to a simplified function signature. This creates a type with all the same method names as the Console interface but with a consistent parameter and return type.
type ConsoleMethods = {
	[K in keyof Console]: K extends 'table' 
		? TableMethod  // Use our explicit TableMethod type for 'table'
		: Console[K] extends ((...args: unknown[]) => unknown) 
			? (...args: unknown[]) => void 
			: never;
};

// Combined type that includes both the Debug class methods and all console methods. This allows TypeScript to recognize dynamically added console methods.
export type DebugWithConsoleMethods = PluginDebug & ConsoleMethods;


// Debug utility class that provides enhanced console logging capabilities. 
// Features: 
// - Global on/off toggle for all debug output, 
// - Custom label prefixing for messages, 
// - Dynamic access to all console methods, 
// - Smart handling of console groups

/** What `emit` can be asked to call: a console method by name, or the function itself. */
type ConsoleTarget = keyof Console | ((...args: unknown[]) => void);

class PluginDebug {
	// Flag to enable/disable all debugging output
	debugMode = false;
	
	// Label to prefix all debug messages with
	label = "DEBUG";
	
	// Tracks the current depth of console groups for proper formatting
	groupDepth = 0;

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
	private pending: Array<[ConsoleTarget, unknown[]]> | null = null;

	/** Every console call goes through here, so it can be buffered or written. */
	private emit(target: ConsoleTarget, args: unknown[]): void {
		if (this.pending) {
			this.pending.push([target, args]);
			return;
		}
		const method = typeof target === 'function' ? target : console[target];
		if (typeof method === 'function') (method as (...a: unknown[]) => void).call(console, ...args);
	}

	/** Write the held lines out together, group header and all. */
	private flush(): void {
		const entries = this.pending;
		this.pending = null;
		if (!entries) return;
		for (const [target, args] of entries) this.emit(target, args);
	}

	// Initializes the debug utility with custom settings.
	initialize(isDebug: boolean, label = "DEBUG"): void {
		this.debugMode = isDebug;
		this.label = label;
	}

	// Creates a new console group and tracks the group depth. 
	// Groups will always display the label prefix in their header.

	group = (...args: unknown[]): void => {
		if (this.debugMode && this.groupDepth === 0 && !this.pending) this.pending = [];
		this.debugLog('group', ...args);
		this.groupDepth++;
	};

	// Creates a new collapsed console group and tracks the group depth.
	groupCollapsed = (...args: unknown[]): void => {
		if (this.debugMode && this.groupDepth === 0 && !this.pending) this.pending = [];
		this.debugLog('groupCollapsed', ...args);
		this.groupDepth++;
	};

	// Ends the current console group and updates the group depth tracker.
	groupEnd = (): void => {
		if (this.groupDepth > 0) {
			this.groupDepth--;
			this.debugLog('groupEnd');
			if (this.groupDepth === 0) this.flush();
		}
	};


	// Formats and logs an error message with the debug label. 
	// Error messages are always shown, even when debug mode is disabled.
	error = (...args: unknown[]): void => {
		// Always show errors, regardless of debug mode
		// Save the current debug mode
		const currentDebugMode = this.debugMode;
		
		// Temporarily enable debug mode for this error
		this.debugMode = true;
		
		// Log the error
		this.formatAndLog(console.error, args);
		
		// Restore the original debug mode
		this.debugMode = currentDebugMode;
	};

	// Displays a table in the console with the pluginDebug label.
	// Special implementation for console.table to handle tabular data properly.
	// @param messageOrData - Either a message string or the tabular data
	// @param propertiesOrData - Either property names or tabular data (if first param was message)
	// @param optionalProperties - Optional property names (if first param was message)

	table: TableMethod = (
		messageOrData: unknown,
		propertiesOrData?: unknown | readonly string[],
		optionalProperties?: readonly string[]
	): void => {
		if (!this.debugMode) return;
		
		try {
			// Determine if the first parameter is a message or the data
			if (typeof messageOrData === 'string' && propertiesOrData !== undefined && typeof propertiesOrData !== 'string') {
				// First parameter is a message, second is the data
				if (this.groupDepth === 0) {
					this.emit('log', [`[${this.label}]: ${messageOrData}`]);
				} else {
					this.emit('log', [messageOrData]);
				}
				
				// Display the table with the data
				if (optionalProperties) {
					this.emit('table', [propertiesOrData, optionalProperties as string[]]);
				} else {
					this.emit('table', [propertiesOrData]);
				}
			} else {
				// First parameter is the data
				if (this.groupDepth === 0) {
					this.emit('log', [`[${this.label}]: Table data`]);
				}
				
				// Display the table
				if (typeof propertiesOrData === 'object' && Array.isArray(propertiesOrData)) {
					this.emit('table', [messageOrData, propertiesOrData]);
				} else {
					this.emit('table', [messageOrData]);
				}
			}
		} catch (error) {
			this.emit('error', [`[${this.label}]: Error showing table:`, error]);
			this.emit('log', [`[${this.label}]: Raw data:`, messageOrData]);
		}
	};


	// Helper method that formats and logs messages with the pluginDebug label.
	// @param logMethod - The console method to use for logging
	// @param args - Arguments to pass to the console method

	formatAndLog = (logMethod: (...args: unknown[]) => void, args: unknown[]): void => {
		if (!this.debugMode) return;
		
		try {
			// For logs inside groups, skip the label prefix
			if (this.groupDepth > 0) {
				this.emit(logMethod, args);
			} else {
				// Normal formatting for logs outside groups
				if (args.length > 0 && typeof args[0] === 'string') {
					this.emit(logMethod, [`[${this.label}]: ${args[0]}`, ...args.slice(1)]);
				} else {
					this.emit(logMethod, [`[${this.label}]:`, ...args]);
				}
			}
		} catch (error) {
			// Fallback if the main logging method fails
			this.emit('error', [`[${this.label}]: Error in logging:`, error]);
			this.emit('log', [`[${this.label}]: Original log data:`, ...args]);
		}
	};


	// Core method that handles calling console methods with proper formatting.
	// - Adds label prefix to messages outside of groups
	// - Skips label prefix for messages inside groups to avoid redundancy
	// - Always adds label prefix to group headers
	// - Error messages are always shown regardless of debug mode
	// @param methodName - Name of the console method to call
	// @param args - Arguments to pass to the console method

	debugLog(methodName: keyof Console, ...args: unknown[]): void {
		// Early return if debugging is disabled (except for errors) or method doesn't exist
		const method = console[methodName];
		if ((!this.debugMode && methodName !== 'error') || typeof method !== 'function') return;

		if (methodName === 'group' || methodName === 'groupCollapsed') {
			// For group headers, always include the label prefix
			if (args.length > 0 && typeof args[0] === 'string') {
				this.emit(methodName, [`[${this.label}]: ${args[0]}`, ...args.slice(1)]);
			} else {
				this.emit(methodName, [`[${this.label}]:`, ...args]);
			}
			return;
		}

		if (methodName === 'groupEnd') {
			// For groupEnd, no formatting needed
			this.emit(methodName, []);
			return;
		}

		// Special case for table - call our specialized method
		if (methodName === 'table') {
			// Route to our specialized table method with the correct arguments
			if (args.length === 1) {
				this.table(args[0]);
			} else if (args.length === 2) {
				if (typeof args[0] === 'string') {
					// If first arg is string, treat as message + data
					this.table(args[0] as string, args[1]);
				} else {
					// Otherwise treat as data + columns
					this.table(args[0], args[1] as readonly string[] | undefined);
				}
			} else if (args.length >= 3) {
				// Assume message + data + columns
				this.table(
					args[0] as string, 
					args[1], 
					args[2] as readonly string[] | undefined
				);
			}
			return;
		}

		// For regular logging inside groups, skip the label prefix
		if (this.groupDepth > 0) {
			this.emit(methodName, args);
		} else {
			// Normal formatting for logs outside groups
			if (args.length > 0 && typeof args[0] === 'string') {
				this.emit(methodName, [`[${this.label}]: ${args[0]}`, ...args.slice(1)]);
			} else {
				this.emit(methodName, [`[${this.label}]:`, ...args]);
			}
		}
	}
}


// Creates a proxy-based debug utility instance that dynamically handles console methods.
// @param debugInstance - The Debug instance to wrap with a proxy
// @returns A proxied Debug instance that can handle all console methods


const createDebugProxy = (debugInstance: PluginDebug): DebugWithConsoleMethods =>
	new Proxy(debugInstance, {
		get: (target, prop) => {
			if (prop in target) {
				return target[prop as keyof PluginDebug];
			}
			const propString = prop.toString();
			if (typeof console[propString as keyof Console] === 'function') {
				return (...args: unknown[]) => {
					target.debugLog(propString as keyof Console, ...args);
				};
			}
			return undefined;
		}
	}) as DebugWithConsoleMethods;

export const pluginDebug = createDebugProxy(new PluginDebug());

/**
 * A debug channel of its own, with its own label, group depth and buffer.
 *
 * `pluginDebug` is one object per bundle, so two decks of the same plugin share
 * it: the second to open a group nests inside the first, because a line arriving
 * from either deck looks the same to a shared instance. A channel per deck gives
 * each one its own group, opened and flushed independently of the other.
 */
export const createPluginDebug = (): DebugWithConsoleMethods =>
	createDebugProxy(new PluginDebug());


/**
 * Print a notice to the console once per page, however often it is called.
 *
 * Deliberately `console.warn` and not `pluginDebug.warn`, which is silent unless
 * debugging is switched on: an advisory has to reach the people who never switch
 * it on. Keyed by plugin and message, so two different notices from the same
 * plugin both get through.
 */
const warned = new Set<string>();

export const warnOnce = (pluginId: string, message: string): void => {
	const key = `${pluginId}::${message}`;
	if (warned.has(key)) return;
	warned.add(key);
	console.warn(`[${pluginId}] ${message}`);
};
