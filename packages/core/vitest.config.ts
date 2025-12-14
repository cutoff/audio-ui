import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        environment: "node", // Default to node for speed (logic/math), override to jsdom in test files if needed
        include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            include: ["src/**/*.ts"],
            exclude: ["src/**/*.d.ts", "src/**/index.ts", "src/types.ts"],
        },
    },
});
