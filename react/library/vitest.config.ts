import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            globals: true,
            environment: "jsdom",
            setupFiles: ["./vitest.setup.ts"],
            coverage: {
                provider: "v8",
                reporter: ["text", "json", "html"],
                include: ["src/**/*.{ts,tsx}"],
                exclude: ["src/**/*.d.ts", "src/main.tsx", "src/vite-env.d.ts"],
            },
        },
    })
);
