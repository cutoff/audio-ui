/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

/**
 * Set the global theme color.
 * Updates the CSS variable `--audioui-primary-color` on the document root.
 * Color variants (`--audioui-primary-50`, `--audioui-primary-20`) are automatically computed
 * by CSS using `color-mix()`.
 *
 * @param color - Any valid CSS color value (e.g., "blue", "#FF5500", "hsl(200, 100%, 50%)", "var(--my-color)")
 *
 * @example
 * ```ts
 * setThemeColor("blue");
 * setThemeColor("var(--audioui-theme-purple)");
 * setThemeColor("hsl(200, 100%, 50%)");
 * ```
 */
export function setThemeColor(color: string): void {
    if (typeof document !== "undefined") {
        document.documentElement.style.setProperty("--audioui-primary-color", color);
    }
}

/**
 * Set the global theme roundness.
 * Updates the CSS variable `--audioui-roundness-base` on the document root.
 * Component-specific roundness values are automatically calculated from this base value.
 *
 * This function also updates the `--audioui-linecap-base` helper variable:
 * - value = 0.0 results in "square"
 * - value > 0.0 results in "round"
 *
 * @param value - Normalized roundness value between 0.0 and 1.0
 *
 * @example
 * ```ts
 * setThemeRoundness(0.3); // 30% roundness, linecap: round
 * setThemeRoundness(0.0); // Square corners, linecap: square
 * setThemeRoundness(1.0); // Maximum roundness, linecap: round
 * ```
 */
export function setThemeRoundness(value: number): void {
    if (typeof document !== "undefined") {
        document.documentElement.style.setProperty("--audioui-roundness-base", value.toString());
        // Automatically infer linecap from roundness: 0 = square, >0 = round
        const linecap = value === 0 ? "square" : "round";
        document.documentElement.style.setProperty("--audioui-linecap-base", linecap);
    }
}

/**
 * Theme configuration object for setting multiple theme values at once.
 */
export interface ThemeConfig {
    /** Theme color - any valid CSS color value */
    color?: string;
    /** Roundness (normalized 0.0-1.0) */
    roundness?: number;
}

/**
 * Set multiple theme values at once.
 * Convenience function that calls individual setter functions for each provided value.
 *
 * @param theme - Theme configuration object with optional color and roundness values
 *
 * @example
 * ```ts
 * setTheme({ color: "blue", roundness: 0.3 });
 * setTheme({ color: "purple" }); // Only sets color, leaves roundness unchanged
 * ```
 */
export function setTheme(theme: ThemeConfig): void {
    if (typeof document === "undefined") return;

    if (theme.color !== undefined) {
        setThemeColor(theme.color);
    }
    if (theme.roundness !== undefined) {
        setThemeRoundness(theme.roundness);
    }
}

/**
 * Get current theme color from CSS variable.
 * Reads the value of `--audioui-primary-color` from the document root.
 *
 * @returns The current theme color value as a string, or `null` if not set or in SSR context
 *
 * @example
 * ```ts
 * const currentColor = getThemeColor();
 * if (currentColor) {
 *   console.log(`Current theme color: ${currentColor}`);
 * }
 * ```
 */
export function getThemeColor(): string | null {
    if (typeof document === "undefined" || typeof window === "undefined") return null;
    return window.getComputedStyle(document.documentElement).getPropertyValue("--audioui-primary-color").trim() || null;
}

/**
 * Get current theme roundness from CSS variable.
 * Reads the value of `--audioui-roundness-base` from the document root.
 *
 * @returns The current theme roundness value as a number (0.0-1.0), or `null` if not set or in SSR context
 *
 * @example
 * ```ts
 * const roundness = getThemeRoundness();
 * if (roundness !== null) {
 *   console.log(`Current roundness: ${roundness * 100}%`);
 * }
 * ```
 */
export function getThemeRoundness(): number | null {
    if (typeof document === "undefined" || typeof window === "undefined") return null;
    const value = window.getComputedStyle(document.documentElement).getPropertyValue("--audioui-roundness-base").trim();
    return value ? parseFloat(value) : null;
}
