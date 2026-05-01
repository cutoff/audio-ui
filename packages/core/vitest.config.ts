import codspeedPlugin from "@codspeed/vitest-plugin";
import { defineConfig } from "vitest/config";

export default defineConfig({
    // The CodSpeed plugin is a no-op locally and under plain `vitest run` — it only
    // activates when run via `CodSpeedHQ/action` in CI, where it instruments benches
    // for deterministic, hardware-agnostic measurement.
    plugins: [codspeedPlugin()],
    test: {
        globals: true,
        environment: "node", // Default to node for speed (logic/math), override to jsdom in test files if needed
        include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        benchmark: {
            include: ["bench/**/*.bench.ts"],
        },
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            include: ["src/**/*.ts"],
            exclude: ["src/**/*.d.ts", "src/**/index.ts", "src/types.ts"],
        },
    },
});
