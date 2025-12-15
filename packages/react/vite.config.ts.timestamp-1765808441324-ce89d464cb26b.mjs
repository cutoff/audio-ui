// vite.config.ts
import { defineConfig } from "file:///Users/red/sbx/cutoff.dev/audio-ui/node_modules/.pnpm/vite@5.4.21_@types+node@20.19.25/node_modules/vite/dist/node/index.js";
import react from "file:///Users/red/sbx/cutoff.dev/audio-ui/node_modules/.pnpm/@vitejs+plugin-react-swc@3.11.0_vite@5.4.21_@types+node@20.19.25_/node_modules/@vitejs/plugin-react-swc/index.js";
import { resolve } from "path";
import dts from "file:///Users/red/sbx/cutoff.dev/audio-ui/node_modules/.pnpm/vite-plugin-dts@3.9.1_@types+node@20.19.25_rollup@4.53.3_typescript@5.9.3_vite@5.4.21_@types+node@20.19.25_/node_modules/vite-plugin-dts/dist/index.mjs";
import { visualizer } from "file:///Users/red/sbx/cutoff.dev/audio-ui/node_modules/.pnpm/rollup-plugin-visualizer@5.14.0_rollup@4.53.3/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
var __vite_injected_original_dirname = "/Users/red/sbx/cutoff.dev/audio-ui/packages/react";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    dts({ include: ["src"] }),
    visualizer({
      filename: "dist/stats.html",
      open: false,
      gzipSize: true,
      brotliSize: true
    })
  ],
  build: {
    lib: {
      entry: resolve(__vite_injected_original_dirname, "src/index.ts"),
      formats: ["es"],
      fileName: "index"
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "classnames",
        "fast-deep-equal",
        "@cutoff/audio-ui-core"
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "jsxRuntime"
        }
      }
    },
    sourcemap: true,
    cssCodeSplit: false,
    minify: "esbuild",
    target: "es2020"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvcmVkL3NieC9jdXRvZmYuZGV2L2F1ZGlvLXVpL3BhY2thZ2VzL3JlYWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvcmVkL3NieC9jdXRvZmYuZGV2L2F1ZGlvLXVpL3BhY2thZ2VzL3JlYWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9yZWQvc2J4L2N1dG9mZi5kZXYvYXVkaW8tdWkvcGFja2FnZXMvcmVhY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IGR0cyBmcm9tIFwidml0ZS1wbHVnaW4tZHRzXCI7XG5pbXBvcnQgeyB2aXN1YWxpemVyIH0gZnJvbSBcInJvbGx1cC1wbHVnaW4tdmlzdWFsaXplclwiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICAgIHBsdWdpbnM6IFtcbiAgICAgICAgcmVhY3QoKSxcbiAgICAgICAgZHRzKHsgaW5jbHVkZTogW1wic3JjXCJdIH0pLFxuICAgICAgICB2aXN1YWxpemVyKHtcbiAgICAgICAgICAgIGZpbGVuYW1lOiBcImRpc3Qvc3RhdHMuaHRtbFwiLFxuICAgICAgICAgICAgb3BlbjogZmFsc2UsXG4gICAgICAgICAgICBnemlwU2l6ZTogdHJ1ZSxcbiAgICAgICAgICAgIGJyb3RsaVNpemU6IHRydWUsXG4gICAgICAgIH0pLFxuICAgIF0sXG4gICAgYnVpbGQ6IHtcbiAgICAgICAgbGliOiB7XG4gICAgICAgICAgICBlbnRyeTogcmVzb2x2ZShfX2Rpcm5hbWUsIFwic3JjL2luZGV4LnRzXCIpLFxuICAgICAgICAgICAgZm9ybWF0czogW1wiZXNcIl0sXG4gICAgICAgICAgICBmaWxlTmFtZTogXCJpbmRleFwiLFxuICAgICAgICB9LFxuICAgICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgICAgICBleHRlcm5hbDogW1xuICAgICAgICAgICAgICAgIFwicmVhY3RcIixcbiAgICAgICAgICAgICAgICBcInJlYWN0LWRvbVwiLFxuICAgICAgICAgICAgICAgIFwicmVhY3QvanN4LXJ1bnRpbWVcIixcbiAgICAgICAgICAgICAgICBcImNsYXNzbmFtZXNcIixcbiAgICAgICAgICAgICAgICBcImZhc3QtZGVlcC1lcXVhbFwiLFxuICAgICAgICAgICAgICAgIFwiQGN1dG9mZi9hdWRpby11aS1jb3JlXCIsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgICAgICAgZ2xvYmFsczoge1xuICAgICAgICAgICAgICAgICAgICByZWFjdDogXCJSZWFjdFwiLFxuICAgICAgICAgICAgICAgICAgICBcInJlYWN0LWRvbVwiOiBcIlJlYWN0RE9NXCIsXG4gICAgICAgICAgICAgICAgICAgIFwicmVhY3QvanN4LXJ1bnRpbWVcIjogXCJqc3hSdW50aW1lXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHNvdXJjZW1hcDogdHJ1ZSxcbiAgICAgICAgY3NzQ29kZVNwbGl0OiBmYWxzZSxcbiAgICAgICAgbWluaWZ5OiBcImVzYnVpbGRcIixcbiAgICAgICAgdGFyZ2V0OiBcImVzMjAyMFwiLFxuICAgIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBcVUsU0FBUyxvQkFBb0I7QUFDbFcsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsZUFBZTtBQUN4QixPQUFPLFNBQVM7QUFDaEIsU0FBUyxrQkFBa0I7QUFKM0IsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDeEIsU0FBUztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sSUFBSSxFQUFFLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUFBLElBQ3hCLFdBQVc7QUFBQSxNQUNQLFVBQVU7QUFBQSxNQUNWLE1BQU07QUFBQSxNQUNOLFVBQVU7QUFBQSxNQUNWLFlBQVk7QUFBQSxJQUNoQixDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0gsS0FBSztBQUFBLE1BQ0QsT0FBTyxRQUFRLGtDQUFXLGNBQWM7QUFBQSxNQUN4QyxTQUFTLENBQUMsSUFBSTtBQUFBLE1BQ2QsVUFBVTtBQUFBLElBQ2Q7QUFBQSxJQUNBLGVBQWU7QUFBQSxNQUNYLFVBQVU7QUFBQSxRQUNOO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNKO0FBQUEsTUFDQSxRQUFRO0FBQUEsUUFDSixTQUFTO0FBQUEsVUFDTCxPQUFPO0FBQUEsVUFDUCxhQUFhO0FBQUEsVUFDYixxQkFBcUI7QUFBQSxRQUN6QjtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQUEsSUFDQSxXQUFXO0FBQUEsSUFDWCxjQUFjO0FBQUEsSUFDZCxRQUFRO0FBQUEsSUFDUixRQUFRO0FBQUEsRUFDWjtBQUNKLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
