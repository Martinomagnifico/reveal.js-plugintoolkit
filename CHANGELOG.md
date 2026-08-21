# Changelog

## [1.0.8] - 2026-08-21
### Changed
- Using an observer instead of waiting to check for the load of CSS through the (--cssimported-*) marker. 
- Warning in console only if you (the user) has set an own path.

## [1.0.7] - 2026-08-06
### Fixed
- Environment detection no longer goes through `new Function(...)`. A function body is always parsed in non-module goal, so `Function("return import.meta")` threw a `SyntaxError` at parse time in every environment, not just in UMD. As a result `isDevelopment` was permanently `false`, CSS autoloading never switched itself off in bundler environments, and the "import the CSS manually" warning was unreachable.
- `import.meta` is now referenced directly so each output format can handle it: the ESM build keeps `import.meta.url`, the UMD build has it replaced with `{}` and falls back to `document.currentScript`.
- Each environment probe sits in its own `try` block, so a failing probe can no longer discard the result of another.
- Removing the last `Function()` call also makes detection work under a Content Security Policy without `unsafe-eval`.

### Changed
- CSS autoloading is now decided by whether the plugin was loaded as a file of its own, not by HMR sniffing. Loading via `<script src>`, via `<script type="module">import</script>` and inside an application bundle are all told apart without bundler-specific globals.
- `EnvironmentInfo` gained `isBundled`, and `detectEnvironment` takes an optional plugin id to fill it in.
- The "CSS autoloading is disabled" warning is only shown when the toolkit made that call itself, not when `cssautoload` was explicitly set to `false`.
- `types` in package.json now points at `dist/src/index.d.ts`, which is where the declarations are actually emitted. It pointed at `dist/index.d.ts`, so consumers got no types at all.


## [1.0.6] - 2026-06-19
### Changed
- Update dependencies


## [1.0.5] - 2026-04-01
### Changed
- Make sure that import.meta is not used in UMD


## [1.0.4] - 2026-04-01
### Changed
- Detection of Reveal v5 dist/plugin folder first
- Update dependencies


## [1.0.3] - 2026-03-01
### Changed
- Update dependencies

## [1.0.2] - 2026-01-09
### Changed
- Simplified environment detection logic in plugin-css
  - Removed complex bundler detection checks (Vite, Webpack, AMD, module scripts, etc.)
  - Now relies solely on HMR presence (`module.hot` or `import.meta.hot`) to determine development mode
  - Fixes issue where CSS imports failed in `vite preview` and static file serving

### Fixed  
- CSS now correctly loads in all serving environments (dev, preview, and static)


## [1.0.1] - 2025-12-19
### Changed
- Updated Vite, vite-plugin-dts and types.


## [1.0.0] - 2025-05-21
### Changed
- If a user has specifically set the csspath and cssautoload to true, even in a module environment, the plugin will try to load it anyway.


## [0.2.4] - 2025-05-14
### Changed
- Add separate namespaces for eventTools and sectionTools.


## [0.2.3] - 2025-05-14
### Added
- Added event tools. Fires scrollmode-entry and -exit when entering or exiting scroll mode when resizing the browser window. If you are writing a plugin that needs to know when scroll mode is entered or exited, you can use this event. It will be fired on the deck object. 
- Added section tools: isSection, isStack, isVertical, isHorizontal, getStack (from a child slide), and getSectionType. These are useful for plugins that need to know about the current section or stack.

### Changed
- Renamed addMoreDirectionEvents to addDirectionEvents (the old name will be deprecated later).
- Update Vite


## [0.2.2] - 2025-05-11
### Added
- Added pluginTools.addMoreDirectionEvents(deck). Fires slidechanged-h and -v when slide changes in a certain direction


## [0.2.1] - 2025-05-04
### Added
- Added enhanced version of pluginCSS


## [0.2.0] - 2025-05-03
### Added
- Added an environment checker: plugin.getEnvironmentInfo()
- Added the original user config object to the plugin: plugin.userConfig

### Changed
- Removed some comments
- Update Vite


## [0.1.9] - 2025-04-27
### Changed
- Removed some comments
- Update Vite
- Update Vite-plugin-dts


## [0.1.8] - 2025-04-10
### Changed
- Update Vite


## [0.1.7] - 2025-04-03
### Added
- Changed pluginDebug.error, this will be shown regardless of the debug setting.
- For console tables, allow a custom label for the table header.


## [0.1.6] - 2025-04-03
### Added
- Added debug method


## [0.1.5] - 2025-03-31
### Changed
- Less logging about addition of paths.


## [0.1.4] - 2025-03-28
### Changed
- Change Reveal dependency to be a >= 4 dependency.


## [0.1.3] - 2025-03-26
### Changed
- Remove any failed CSS links from the DOM


## [0.1.2] - 2025-03-26
### Changed
- Changed developer path option into an autoload that finds the script path.

### Fixed
- Fixed the path to the npm script in the package.json file.


## [0.1.1] - 2025-03-26
### Changed
- Let the standard paths be a fallback of npm paths. So if the path to npm fails, it will try the standard path.
- Updated Vite
- Rename from reveal-plugin-toolkit to reveal.js-plugintoolkit


## [0.1.0] - 2025-03-24
### Changed
- First commit