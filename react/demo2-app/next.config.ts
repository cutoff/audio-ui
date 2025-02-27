import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
    transpilePackages: ["@cutoff/audio-ui-react"],
    webpack: (config) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            "@cutoff/audio-ui-react": path.resolve(__dirname, "../library/dist")
        };

        return config;
    },
};

export default nextConfig;
