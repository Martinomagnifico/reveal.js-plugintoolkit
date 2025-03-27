/**
 * Options for the pluginCSS function
 */
export interface PluginCssOptions {
	id: string;                   // Required: Plugin identifier
	cssautoload?: boolean;        // Optional: Enable/disable CSS loading (default true)
	csspath?: string | false;     // Optional: User-specified CSS path
	debug?: boolean;              // Optional: Enable debug logging (default false)
  }