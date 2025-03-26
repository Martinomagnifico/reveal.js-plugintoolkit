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
	plugins: [dts()],
});
