/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

import { defineConfig } from "vite";
import { resolve } from "path";
import { mkdir, copyFile } from "fs/promises";
import dts from "vite-plugin-dts";

// Plugin to copy CSS files to dist/styles after build
function copyCSSPlugin() {
    return {
        name: "copy-css",
        async writeBundle() {
            const srcStylesDir = resolve(__dirname, "src/styles");
            const distStylesDir = resolve(__dirname, "dist/styles");
            await mkdir(distStylesDir, { recursive: true });
            await copyFile(resolve(srcStylesDir, "styles.css"), resolve(distStylesDir, "styles.css"));
            await copyFile(resolve(srcStylesDir, "themes.css"), resolve(distStylesDir, "themes.css"));
        },
    };
}

export default defineConfig({
    plugins: [dts({ include: ["src"] }), copyCSSPlugin()],
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            formats: ["es"],
            fileName: "index",
        },
        rollupOptions: {
            external: ["fast-deep-equal"],
            output: {
                preserveModules: false,
            },
        },
        sourcemap: true,
        cssCodeSplit: false,
        copyPublicDir: false,
        minify: "esbuild",
        target: "es2020",
    },
});
