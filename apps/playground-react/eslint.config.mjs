import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import rootConfig from "../../eslint.config.mjs";

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
        ignores: ["components/ui/shadcn-io/**/*"],
    },
];

export default eslintConfig;
