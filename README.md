# Reveal.js Plugin Toolkit

A toolkit for creating structured, maintainable Reveal.js plugins with standardized configuration management, CSS loading, and initialization patterns.

There are, for the moment, TWO separate functionalities to the toolkit:

  - [PluginBase](#1-plugin-base)
  - [PluginCSS](#2-plugin-css)

Both of them will be described in detail below.

Installation
```bash
npm install reveal.js-plugintoolkit
```

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




## 2. Plugin-CSS

The toolkit provides a flexible CSS loading utility that simplifies plugin styling. The path is derived from the JS path that the plugin is loaded from. It is expected that the CSS is in the same location. If a path is correctly found, it will be inserted in the DOM.

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
