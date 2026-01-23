/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import rootConfig from "../../eslint.config.mjs";
import licenseHeader from "eslint-plugin-license-header";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

// Filter root config to exclude plugins that Next.js configs already define
// Next.js configs handle React and TypeScript ESLint plugins
// Keep only non-conflicting configs (test file rules, ignores, etc.)
const filteredRootConfig = rootConfig.filter((config) => {
    // Exclude configs that define plugins that Next.js already provides
    if (config.plugins) {
        // Next.js configs provide React and TypeScript ESLint plugins
        if (config.plugins.react || config.plugins["@typescript-eslint"]) {
            return false;
        }
    }
    // Keep all other configs (test file rules, ignores, etc.)
    return true;
});

// Extend filtered root config and add Next.js specific rules
const eslintConfig = [
    ...filteredRootConfig,
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    {
        ignores: ["components/ui/**/*", "next-env.d.ts", ".next/**/*"],
    },
    // Ensure license-header plugin is available for all files
    {
        files: ["**/*.{ts,tsx,js,jsx,mts,mtsx,mjs,mjsx,cts,ctsx,cjs,cjsx}"],
        plugins: {
            "license-header": licenseHeader,
        },
        rules: {
            "license-header/header": [
                "error",
                [
                    "/*",
                    " * Copyright (c) 2026 Tylium.",
                    " * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0",
                    " * See LICENSE.md for details.",
                    " */",
                ],
            ],
        },
    },
];

export default eslintConfig;
