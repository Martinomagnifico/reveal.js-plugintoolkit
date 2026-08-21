import { defineConfig } from "vite";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";
import dts from "vite-plugin-dts";

// Read rather than `import ... from './package.json'`: this config is loaded as
// native ESM, where a JSON import would need an import attribute.
const pkg = JSON.parse(
	readFileSync(new URL("./package.json", import.meta.url), "utf8")
) as { name: string };

const pluginName = pkg.name.replace('reveal.js-', '');

export default defineConfig({
	build: {
		lib: {
			entry: resolve(import.meta.dirname, 'src/index.ts'),
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
	// Declarations are emitted relative to the src/ root, so the entry lands at
	// dist/index.d.ts. package.json "types" points there.
	plugins: [dts()],
});
