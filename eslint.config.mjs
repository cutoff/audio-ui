import { includeIgnoreFile } from "@eslint/compat";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const gitignorePath = resolve(__dirname, ".gitignore");

export default [
    // Include .gitignore patterns
    includeIgnoreFile(gitignorePath),
    js.configs.recommended,
    // Base TypeScript/JavaScript configuration for all .ts and .js files
    {
        files: ["**/*.{ts,js}"],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
            },
            globals: {
                window: "readonly",
                document: "readonly",
                console: "readonly",
                performance: "readonly",
                EventTarget: "readonly",
                HTMLElement: "readonly",
                MouseEvent: "readonly",
                TouchEvent: "readonly",
                WheelEvent: "readonly",
                KeyboardEvent: "readonly",
                DOMRect: "readonly",
            },
        },
        plugins: {
            "@typescript-eslint": tseslint,
        },
        rules: {
            ...tseslint.configs.recommended.rules,
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                },
            ],
        },
    },
    // TypeScript/JavaScript + React configuration for all .tsx and .jsx files
    {
        files: ["**/*.{tsx,jsx}"],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                window: "readonly",
                document: "readonly",
                console: "readonly",
                performance: "readonly",
                React: "readonly",
                MutationObserver: "readonly",
                SVGSVGElement: "readonly",
                SVGPathElement: "readonly",
                WheelEvent: "readonly",
                JSX: "readonly",
            },
        },
        plugins: {
            "@typescript-eslint": tseslint,
            react,
            "react-hooks": reactHooks,
        },
        settings: {
            react: {
                version: "detect",
            },
        },
        rules: {
            ...tseslint.configs.recommended.rules,
            ...react.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            "react/react-in-jsx-scope": "off", // Not needed in React 17+
            "react/prop-types": "off", // Using TypeScript for prop validation
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                },
            ],
        },
    },
    // More lenient rules for test files
    {
        files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
        rules: {
            "@typescript-eslint/no-explicit-any": "warn", // Allow any in tests, but warn
        },
    },
];
