/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Fully prerendered: exported as static files (served as Cloudflare Workers static assets)
    output: "export",
    transpilePackages: ["@cutoff/audio-ui-react", "@cutoff/audio-ui-core"],
    eslint: {
        ignoreDuringBuilds: true, // Ignore ESLint errors during production builds
    },
    devIndicators: false,
};

export default nextConfig;
