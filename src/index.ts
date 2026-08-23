// Export core functionality
export { PluginBase } from './base/plugin-base';
export { pluginCSS } from './utils/plugin-css';
export { isCssImported, checkCssImported, whenCssImported } from './utils/plugin-css/loader';
export { whenThemeApplied, isThemeApplied } from './utils/plugin-css/theme';
export { hasResolvableSource, findPluginSource } from './utils/plugin-css/path-finder';
export { pluginDebug, warnOnce } from './utils/plugin-debug';

export * as pluginTools from './utils/plugin-tools'; // All of the tools

// The next lines are the plugin tools in separate namespaces
export * as eventTools from './utils/plugin-tools/event-tools';
export * as sectionTools from './utils/plugin-tools/section-tools';
export * as configTools from './utils/plugin-tools/config-tools';
export * as domTools from './utils/plugin-tools/dom-tools';
export * as textTools from './utils/plugin-tools/text-tools';

// Export types
export type { RevealInstance } from './base/plugin-base';
export type {
	PluginCssOptions,
	PluginCssResult,
	PluginCssSettings,
	PluginCssStatus
} from './utils/plugin-css/types';
export type { PluginSource } from './utils/plugin-css/path-finder';
export type { EnvironmentInfo } from './types';
