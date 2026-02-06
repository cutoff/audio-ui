import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
import dts from "vite-plugin-dts";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
    plugins: [
        react(),
        dts({ include: ["src"] }),
        visualizer({
            filename: "dist/stats.html",
            open: false,
            gzipSize: true,
            brotliSize: true,
        }),
    ],
    resolve: {
        alias: {
            "@/primitives": resolve(__dirname, "src/components/primitives"),
            "@/hooks": resolve(__dirname, "src/hooks"),
            "@/defaults": resolve(__dirname, "src/components/defaults"),
            "@/utils": resolve(__dirname, "src/utils"),
            "@/types": resolve(__dirname, "src/components/types"),
        },
    },
    build: {
        lib: {
            entry: {
                index: resolve(__dirname, "src/index.ts"),
                "style-no-font": resolve(__dirname, "src/style-no-font.entry.ts"),
            },
            formats: ["es"],
        },
        rollupOptions: {
            external: [
                "react",
                "react-dom",
                "react/jsx-runtime",
                "classnames",
                "fast-deep-equal",
                "@cutoff/audio-ui-core",
            ],
            output: {
                /* Predictable names: main bundle → style.css (with font), second entry → style-no-font.css. */
                entryFileNames: (chunkInfo) => (chunkInfo.name === "style-no-font" ? "style-no-font.js" : "index.js"),
                assetFileNames: (assetInfo) => {
                    const name = assetInfo.name || "";
                    if (name.endsWith(".css")) {
                        return name.startsWith("style-no-font") ? "style-no-font.css" : "style.css";
                    }
                    return "assets/[name]-[hash][extname]";
                },
                globals: {
                    react: "React",
                    "react-dom": "ReactDOM",
                    "react/jsx-runtime": "jsxRuntime",
                },
            },
        },
        sourcemap: true,
        cssCodeSplit: true,
        minify: "esbuild",
        target: "es2020",
    },
});
