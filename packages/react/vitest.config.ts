import codspeedPlugin from "@codspeed/vitest-plugin";
import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
    viteConfig,
    defineConfig({
        // The CodSpeed plugin is a no-op locally and under plain `vitest run` — it only
        // activates when run via `CodSpeedHQ/action` in CI, where it instruments benches
        // for deterministic, hardware-agnostic measurement.
        plugins: [codspeedPlugin()],
        test: {
            globals: true,
            environment: "jsdom",
            setupFiles: ["./vitest.setup.ts"],
            benchmark: {
                include: ["bench/**/*.bench.ts"],
            },
            coverage: {
                provider: "v8",
                reporter: ["text", "json", "html"],
                include: ["src/**/*.{ts,tsx}"],
                exclude: ["src/**/*.d.ts", "src/main.tsx", "src/vite-env.d.ts"],
            },
        },
    })
);
