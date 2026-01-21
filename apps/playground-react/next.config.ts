/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
    transpilePackages: ["@cutoff/audio-ui-react", "@cutoff/audio-ui-core"],
    eslint: {
        ignoreDuringBuilds: true, // Ignore ESLint errors during production builds
    },
    devIndicators: false,
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
