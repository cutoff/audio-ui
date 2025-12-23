import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
    transpilePackages: ["@cutoff/audio-ui-react", "@cutoff/audio-ui-core"],
    eslint: {
        ignoreDuringBuilds: true, // Ignore ESLint errors during production builds
    },
    webpack: (config) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            "@cutoff/audio-ui-react": path.resolve(__dirname, "../../packages/react/src/index.ts"),
            "@cutoff/audio-ui-core": path.resolve(__dirname, "../../packages/core/src/index.ts"),
        };

        return config;
    },
};

export default nextConfig;
