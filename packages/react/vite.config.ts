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
            entry: resolve(__dirname, "src/index.ts"),
            formats: ["es"],
            fileName: "index",
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
                globals: {
                    react: "React",
                    "react-dom": "ReactDOM",
                    "react/jsx-runtime": "jsxRuntime",
                },
            },
        },
        sourcemap: true,
        cssCodeSplit: false,
        minify: "esbuild",
        target: "es2020",
    },
});
