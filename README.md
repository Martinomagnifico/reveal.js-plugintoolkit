# Reveal.js Plugin Toolkit

A toolkit for creating structured, maintainable Reveal.js plugins with standardized configuration management, CSS loading, and initialization patterns.

There are, for the moment, TWO separate functionalities to the toolkit:

- [Reveal.js Plugin Toolkit](#revealjs-plugin-toolkit)
  - [1. Plugin-base](#1-plugin-base)
  - [2. Plugin-CSS](#2-plugin-css)

Both of them will be described in detail below.

Installation
```bash
npm install reveal-plugin-toolkit
```

## 1. Plugin-base

Pluginbase provides a base class for plugins that has standardized functionality for configuration management, initialization, and data sharing.


### Features

- **Configuration Management**: Automatically merges default and user-provided configurations.
- **Initialization**: Provides a standardized way to initialize plugins with access to the Reveal.js API.
- **Data Sharing**: Allows plugins to share data and methods with each other.
- **TypeScript Support**: Provides TypeScript interfaces for better type safety and autocompletion.
- **JavaScript Support**: Can be used in JavaScript projects as well.
- **Plugin Interface**: Allows you to define additional methods that can be called from outside the plugin.



#### Example (TypeScript)

```typescript
import { PluginBase } from 'reveal-plugin-toolkit';
import type { Api } from 'reveal.js';

// Define your plugin configuration interface
interface MyPluginConfig {
  optionOne: string;
  optionTwo: number;
  cssautoload?: boolean;
  csspath?: string | string[];
}

// Define default configuration
const defaultConfig: MyPluginConfig = {
  optionOne: "default",
  optionTwo: 42,
  cssautoload: true
};

// Plugin initialization function
const init = async (plugin: PluginBase<MyPluginConfig>, deck: Api, config: MyPluginConfig) => {
  // Your initialization code here
  console.log(`Plugin initialized with option: ${config.optionOne}`);
  
  // Store data for later use
  plugin.data.elements = document.querySelectorAll('.my-elements');
};

// Create and export the plugin
export default () => {
  const plugin = new PluginBase<MyPluginConfig>('my-plugin', init, defaultConfig);
  
  return plugin.createInterface({
    // Additional methods
    doSomething: () => {
      // Implementation
      return "result";
    }
  });
};
```

or we can do something similar in JavaScript:

#### Example (JavaScript)

```javascript
import { PluginBase } from 'reveal-plugin-toolkit';
import { Api } from 'reveal.js';
// Define your plugin configuration interface
const defaultConfig = {
  optionOne: "default",
  optionTwo: 42,
  cssautoload: true
};
// Plugin initialization function
const init = async (plugin, deck, config) => {
  // Your initialization code here
  console.log(`Plugin initialized with option: ${config.optionOne}`);
  
  // Store data for later use
  plugin.data.elements = document.querySelectorAll('.my-elements');
};
// Create and export the plugin
export default () => {
  const plugin = new PluginBase('my-plugin', init, defaultConfig);
  
  return plugin.createInterface({
    // Additional methods
    doSomething: () => {
      // Implementation
      return "result";
    }
  });
};
```



## 2. Plugin-CSS

The toolkit provides a flexible CSS loading utility that handles various environments and simplifies plugin styling. Developers can provide environment-specific paths, and fallback mechanisms. If a path is correctly found, it will be inserted in the DOM.

### Basic Usage

```typescript
import { pluginCSS } from 'reveal-plugin-toolkit';

// Inside your plugin initialization function
await pluginCSS({
    id: 'my-plugin',  // The id of your plugin
    enableLoading: config.cssautoload, // Optional: Enable/disable loading
    userPath: config.csspath, // Optional: User-specified path(s)
    developerPaths: myDevPaths, // Optional: Developer-defined path(s)
    debug: config.debug // Optional: Enable debug logging (default false)
});
```

In the example above, the developerPaths are paths that you, as a developer of a plugin, can assign. You can set the paths like this at the beginning of the file (or directly in that config):

```typescript
const myDevPaths = [
  'plugin/my-plugin/my-plugin.css',
  'plugins/my-plugin/my-plugin.css'
];
```

which your plugin will try to load in order.


### Advanced Usage
You can also set the paths in a more complex way, for example, if you want to provide a fallback mechanism for your plugin. You can set the paths like this:

```typescript
const myDevPaths = {
    npm: 'node_modules/reveal.js-my-plugin/dist/my-plugin.css',
    standard: 'plugin/my-plugin/my-plugin.css',
    fallback: './css/my-plugin.css'
};
```
This means that if the user has installed your plugin via npm, the toolkit will try to load the CSS from `node_modules/reveal.js-my-plugin/dist/my-plugin.css` first. If that fails, it will try to load it from `plugin/my-plugin/my-plugin.css`, and finally, if that also fails, it will load it from `./css/my-plugin.css`.
This is useful if you want to provide a default CSS file for your plugin, but also allow users to override it with their own CSS file.

Each of the environments can, itself, also be an array of paths. Imagine that the user moves your plugin folder to some other location, then you may add some other expected path as well, and these will be tried in order: 

```typescript
const myDevPaths = {
    npm: 'node_modules/reveal.js-my-plugin/dist/my-plugin.css',
    standard: [
        'plugin/my-plugin/my-plugin.css',
        'plugins/my-plugin/my-plugin.css'
    ],
    fallback: './css/my-plugin.css'
};
```

### Interface for end users

Now the user, in their own Reveal initialization, may also give paths, this may be a path, or multiple expected paths, that he/she knows:

```typescript
Reveal.initialize({
    plugins: [ RevealMyPlugin ],
    'my-plugin': {
        // Array of paths to try in order
        csspath: [
            './custom-themes/my-theme/my-plugin.css',
            './css/plugins/my-plugin.css',
            '../assets/my-plugin-custom.css'
        ],
        // Other plugin options...
    }
});
```

The toolkit will try user paths first, then developer paths.
If, by any chance, the end-user wants some other kind of loading mechanism, then he/she can set `cssautoload` in their config to `false` (if you indeed provide that as an option in your plugin). As may be clear from the code, you can always rename that option.





