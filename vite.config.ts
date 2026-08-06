import { defineConfig } from "vite";
import { resolve } from "node:path";
import dts from "vite-plugin-dts";
import pkg from './package.json'

const pluginName = pkg.name.replace('reveal.js-', '');

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: 'RevealPluginToolkit',
			formats: ['es', 'umd'],
			fileName: (format) => `${pluginName}.${format === 'es' ? 'mjs' : 'js'}`
		},
		rollupOptions: {
			// `import.meta` is referenced on purpose, and the UMD build is meant to
			// have it replaced with `{}` — `document.currentScript` takes over there.
			// See the comment on `selfUrl` in src/utils/plugin-css/path-finder.ts.
			checks: {
				emptyImportMeta: false,
			},
			external: ["reveal.js", "deepmerge"],
			output: {
				globals: {
					"reveal.js": "Reveal",
					deepmerge: "deepmerge",
				},
			},
		},
		outDir: "dist",
	},
	// Declarations keep their src/ prefix, so they land at dist/src/index.d.ts.
	// package.json "types" points there.
	plugins: [dts()],
});
