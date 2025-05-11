# Changelog

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