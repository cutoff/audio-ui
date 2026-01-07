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

// Extend root config and add Next.js specific rules
const eslintConfig = [
    ...rootConfig,
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
