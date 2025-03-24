import { defineConfig } from "vite";
import { resolve } from "node:path";
import dts from "vite-plugin-dts";

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: 'RevealPluginToolkit',
			formats: ['es', 'umd'],
			fileName: (format) => {
				if (format === 'es') return 'reveal-plugin-toolkit.mjs';
				return 'reveal-plugin-toolkit.js'; // UMD format
			}
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
