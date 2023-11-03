"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = require("node:path");
const vite_1 = require("vite");
exports.default = (0, vite_1.defineConfig)({
    build: {
        emptyOutDir: false,
        minify: true,
        sourcemap: false,
        lib: {
            entry: node_path_1.default.resolve(__dirname, 'src/index.ts'),
            name: 'Slicker',
            formats: ['umd'],
            fileName: () => 'bundle/slickgrid-vanilla-bundle.js'
        },
        rollupOptions: {
            output: {
                minifyInternalExports: false,
                // chunkFileNames: 'dist/bundle/[name].js',
            },
        },
    },
});
//# sourceMappingURL=vite.config.js.map