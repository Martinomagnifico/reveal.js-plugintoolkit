# Reveal.js Plugin Toolkit

[![Version](https://img.shields.io/npm/v/reveal.js-plugintoolkit)](#) [![Downloads](https://img.shields.io/npm/dt/reveal.js-plugintoolkit)](https://github.com/martinomagnifico/reveal.js-plugintoolkit/archive/refs/heads/master.zip)

A toolkit for creating structured, maintainable Reveal.js plugins with standardized configuration management, CSS loading, and initialization patterns.

There are a few functionalities to the toolkit:

  - [PluginBase](#1-pluginbase)
  - [pluginCSS](#2-plugincss)
  - [pluginDebug](#3-plugindebug)

These will be described in detail below.

Installation

```bash
npm install reveal.js-plugintoolkit
```

---


## 1. PluginBase

PluginBase provides a base class for plugins that has standardized functionality for configuration management, initialization, and data sharing.


### Features

- **Configuration management**: Automatically merges default and user-provided configurations.
- **Initialization**: Provides a standardized way to initialize plugins with access to the Reveal.js API.
- **Data sharing**: Allows plugins to share data and methods with each other.
- **TypeScript support**: Provides TypeScript interfaces for better type safety and autocompletion.
- **JavaScript support**: Can be used in JavaScript projects as well.
- **Plugin interface**: Allows you to define additional methods that can be called from outside the plugin.

Here's a minimal plugin using PluginBase:

```javascript
import { PluginBase } from 'reveal.js-plugintoolkit';

// Minimal default configuration
const defaultConfig = {
  message: 'Hello World',
  display: true
};

// Simple initialization function that just logs config values
const init = (plugin, deck, config) => {
  if (config.display) {
    console.log(config.message);
  }
};

// Export the plugin
export default () => {
  const plugin = new PluginBase('minimal', init, defaultConfig);
  return plugin.createInterface();
};
```

or the same in TypeScript:

```typescript
import { PluginBase } from 'reveal.js-plugintoolkit';
import type { Api } from 'reveal.js';

// Define configuration interface
interface MinimalConfig {
  message: string;
  display: boolean;
}

// Minimal default configuration
const defaultConfig: MinimalConfig = {
  message: 'Hello World',
  display: true
};

// Simple initialization function that just logs config values
const init = (plugin: PluginBase<MinimalConfig>, deck: Api, config: MinimalConfig): void => {
  if (config.display) {
    console.log(config.message);
  }
};

// Export the plugin
export default () => {
  const plugin = new PluginBase<MinimalConfig>('minimal', init, defaultConfig);
  return plugin.createInterface();
};
```



The above code will generate this:

```javascript
import deepmerge from 'deepmerge';

export default () => {
  // Plugin implementation
  const plugin = {
    id: 'minimal',
    
    initializeConfig: function(deck) {
      const defaultConfig = { message: 'Hello World', display: true };
      const revealConfig = deck.getConfig();
      const userConfig = revealConfig['minimal'] || {};
      
      this.mergedConfig = deepmerge(defaultConfig, userConfig, {
        arrayMerge: (_, sourceArray) => sourceArray,
        clone: true
      });
    },
    
    getCurrentConfig: function() {
      if (!this.mergedConfig) {
        throw new Error('Plugin configuration has not been initialized');
      }
      return this.mergedConfig;
    },
    
    init: function(deck) {
      this.initializeConfig(deck);
      
      // Your simple init function
      const config = this.getCurrentConfig();
      if (config.display) {
        console.log(config.message);
      }
    }
  };
  
  // Return the interface
  return {
    id: plugin.id,
    init: (deck) => plugin.init(deck),
    getConfig: () => plugin.getCurrentConfig()
  };
};
```




## 2. pluginCSS

The toolkit provides a flexible CSS loading utility that simplifies plugin styling. The path is derived from the JS path that the plugin is loaded from. It is expected that the CSS is in the same location. If a path is correctly found, it will be inserted in the DOM.

The CSS filename is expected to be the same as the JS filename, and the following locations are checked:

- script-path/myplugin.css (same location as the JS)
- plugin/myplugin/myplugin.css (like other Reveal plugins)

### Usage

```typescript
import { pluginCSS } from 'reveal.js-plugintoolkit';

// Inside your plugin initialization function
await pluginCSS({
    id: 'my-plugin',  // The id of your plugin
    cssautoload: config.cssautoload, // Optional: Enable/disable loading
    csspath: config.csspath, // Optional: User-specified path
    debug: config.debug // Optional: Enable debug logging (default false)
});
```

### Usage, enhanced

If you also use the pluginBase class, you can simplify the above like this:

```typescript
import { pluginCSS } from 'reveal.js-plugintoolkit';

// Inside your plugin initialization function
await pluginCSS(plugin, config);

```

where config is still optional. The enhanced version of pluginCSS also detects if the environment uses script(type="module") or is in a bundler environment, where dynamic linking of CSS might give errors. Dynamic linking is then skipped, because `import` is the way to style your plugin in that case. If that import is also omitted, a console warning will show that. 

To be able to test if the CSS is successfully loaded in any way like `import`, your plugin will need to add a variable to the root, where `pluginid` should be the actual plugin id of your plugin:

```css
:root {
    --cssimported-pluginid: true;
}
```


### Interface for the end user

Now the user, in their own Reveal initialization, may know of an alternative path to the CSS, or an actual changed CSS:

```javascript
Reveal.initialize({
    plugins: [ RevealMyPlugin ],
    'my-plugin': {
        csspath: './custom-themes/my-theme/my-plugin.css',
        // Other plugin options...
    }
});
```

If, by any chance, the end-user wants some other kind of loading mechanism, then he/she can set `cssautoload` in their config to `false` (if you indeed provide that as an option in your plugin). As may be clear from the code, you can always rename that option.

```javascript
Reveal.initialize({
    plugins: [ RevealMyPlugin ],
    'my-plugin': {
       'cssautoload': false, // Disable automatic CSS loading
        // Other plugin options...
    }
});
```







## 3. pluginDebug


When using different Reveal.js plugins, you may want to enable debug output for your plugin, but only if the user has enabled it.
If multiple plugins are active, then it might be useful to have a label for each plugin in the console output.
These two features are provided by this pluginDebug tooling.

The functionality needs to be enabled first. Otherwise, the pluginDebug object will not output anything.
Like this: 

```javascript
pluginDebug.initialize(true, 'MY-PLUGIN');
```
The first parameter enables the pluginDebug output, and the second parameter is the label that will be used in the console output. You will probably pass the first parameter from the config of your plugin when an end user turns logging on.

After initializing, you can use the pluginDebug object to log messages, create groups, and use other console methods.



### Basic logging

```javascript
pluginDebug.log('Application started');
```

Console output: 

```
[MY-PLUGIN]: Application started
```

### Using groups

```javascript
pluginDebug.group('User Authentication');
pluginDebug.log('Checking credentials');
pluginDebug.log('Validating token');
pluginDebug.groupEnd();
```

Console output:

```
▶ [MY-PLUGIN]: User Authentication
    Checking credentials
    Validating token
```


### Using other console methods

```javascript
pluginDebug.table(userData);

Console output: 
[MY-PLUGIN]: (followed by a table of userData)
```

pluginDebug.table(tableData) - Display a table with default header

pluginDebug.table(tableData, columns) - Display a table with specific columns

pluginDebug.table("Tablename:", tableData) - Display a table with a custom message

pluginDebug.table("Tablename:", tableData, columns) - Display a table with custom message and specific columns


--- 

## License

MIT licensed | Copyright © 2025 Martijn De Jongh (Martino)