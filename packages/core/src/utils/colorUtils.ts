/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

import { CSS_VARS } from "../constants/cssVars";

/**
 * Utility functions for color manipulation
 *
 * This module provides simplified color manipulation functions that leverage
 * modern CSS capabilities instead of reimplementing color parsing logic.
 */

/**
 * Named colors mapping to their HSL values.
 * Keys are lowercase for O(1) lookup performance.
 */
const namedColors: Record<string, string> = {
    blue: "hsl(204, 88%, 53%)",
    orange: "hsl(29, 100%, 50%)",
    pink: "hsl(332, 95%, 54%)",
    green: "hsl(160, 98%, 37%)",
    purple: "hsl(252, 100%, 67%)",
    yellow: "hsl(50, 100%, 50%)",
    white: "hsl(0, 0%, 100%)",
};

const HSL_REGEX = /hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/;

/**
 * Detects if the current document is in dark mode.
 *
 * Checks both the document's class list (for `.dark` class) and the system preference
 * via `prefers-color-scheme` media query. This ensures compatibility with frameworks
 * like Tailwind CSS that use class-based dark mode.
 *
 * @returns true if dark mode is active, false otherwise
 */
export function isDarkMode(): boolean {
    if (typeof window === "undefined") return false;
    return (
        document.documentElement.classList.contains("dark") || window.matchMedia("(prefers-color-scheme: dark)").matches
    );
}

/**
 * Gets the adaptive default color (white in dark mode, black in light mode).
 *
 * Uses a CSS variable to ensure SSR and client render the same value, avoiding hydration mismatches.
 * The actual color value is resolved by the browser based on the `.dark` class or system preference.
 *
 * @returns A CSS color value that adapts to the current color scheme
 */
export function getAdaptiveDefaultColor(): string {
    return `var(${CSS_VARS.adaptiveDefaultColor})`;
}

/**
 * Generates a luminosity-based variant of a color.
 *
 * For named colors (blue, orange, pink, etc.), this function uses pre-computed HSL values
 * for precise control. For other colors, it uses CSS `color-mix()` with black to darken.
 *
 * This is useful for creating visual hierarchies (e.g., primary50, primary20 variants)
 * where you want progressively darker versions of a color.
 *
 * @param baseColor The base color (any valid CSS color value)
 * @param luminosityPercentage The percentage of the original luminosity (0-100)
 * @returns A CSS color value with adjusted luminosity
 *
 * @example
 * ```ts
 * generateLuminosityVariant("blue", 50); // 50% darker blue
 * generateLuminosityVariant("#ff0000", 20); // Much darker red
 * ```
 */
export function generateLuminosityVariant(baseColor: string, luminosityPercentage: number): string {
    const namedColor = namedColors[baseColor.toLowerCase()];
    if (namedColor) {
        const hslMatch = namedColor.match(HSL_REGEX);
        if (hslMatch) {
            const h = hslMatch[1];
            const s = hslMatch[2];
            const l = parseInt(hslMatch[3], 10);
            const newL = Math.max(0, Math.min(100, l * (luminosityPercentage / 100)));
            return `hsl(${h}, ${s}%, ${newL}%)`;
        }
    }

    // Use color-mix with black to darken (works for any valid CSS color)
    const darkening = 100 - luminosityPercentage;
    return `color-mix(in srgb, ${baseColor}, black ${darkening}%)`;
}

/**
 * Generates a transparency-based variant of a color.
 *
 * Uses CSS `color-mix()` to blend the color with transparent, creating a semi-transparent
 * version. This is useful for hover states, disabled states, or layered visual effects.
 *
 * @param baseColor The base color (any valid CSS color value)
 * @param opacityPercentage The opacity percentage (0-100, where 100 is fully opaque)
 * @returns A CSS color value with adjusted opacity
 *
 * @example
 * ```ts
 * generateTransparencyVariant("blue", 50); // 50% transparent blue
 * ```
 */
export function generateTransparencyVariant(baseColor: string, opacityPercentage: number): string {
    return `color-mix(in srgb, ${baseColor} ${opacityPercentage}%, transparent)`;
}

/**
 * Generates a highlight color variant suitable for drop-shadow and glow effects.
 *
 * For HSL colors, this increases both saturation and lightness to create a brighter,
 * more vibrant version. For other color formats, it blends with white.
 *
 * This is typically used for focus states, active states, or visual feedback effects.
 *
 * @param baseColor The base color (any valid CSS color value)
 * @returns A CSS color value optimized for highlight effects
 *
 * @example
 * ```ts
 * generateHighlightColor("blue"); // Brighter, more saturated blue for highlights
 * ```
 */
export function generateHighlightColor(baseColor: string): string {
    const namedColor = namedColors[baseColor.toLowerCase()];
    if (namedColor) {
        baseColor = namedColor;
    }

    // For highlight effects: slightly brighter and more saturated
    const hslMatch = baseColor.match(HSL_REGEX);
    if (hslMatch) {
        const h = parseInt(hslMatch[1], 10);
        const s = Math.min(100, parseInt(hslMatch[2], 10) + 10); // Increase saturation
        const l = Math.min(70, parseInt(hslMatch[3], 10) + 10); // Increase lightness but cap at 70%
        return `hsl(${h}, ${s}%, ${l}%)`;
    }

    return `color-mix(in srgb, ${baseColor} 80%, white 20%)`;
}

/**
 * Generates a complete set of color variants for a component.
 *
 * This is the main utility for creating theme color palettes. It generates:
 * - `primary`: The base color
 * - `primary50`: A 50% variant (luminosity or transparency based on `variant` parameter)
 * - `primary20`: A 20% variant (luminosity or transparency based on `variant` parameter)
 * - `highlight`: A brighter variant optimized for focus/active states
 *
 * The `variant` parameter determines how `primary50` and `primary20` are calculated:
 * - `"luminosity"`: Darker versions of the base color (good for backgrounds, tracks)
 * - `"transparency"`: Semi-transparent versions (good for overlays, disabled states)
 *
 * @param baseColor The base color (any valid CSS color value)
 * @param variant The variant type ('luminosity' or 'transparency')
 * @returns An object with primary, primary50, primary20, and highlight color values
 *
 * @example
 * ```ts
 * const colors = generateColorVariants("blue", "luminosity");
 * // { primary: "hsl(204, 88%, 53%)", primary50: "...", primary20: "...", highlight: "..." }
 * ```
 */
export function generateColorVariants(
    baseColor: string,
    variant: "luminosity" | "transparency" = "luminosity"
): {
    primary: string;
    primary50: string;
    primary20: string;
    highlight: string;
} {
    const namedColor = namedColors[baseColor.toLowerCase()];
    const normalizedColor = namedColor ?? baseColor;

    const highlight = generateHighlightColor(normalizedColor);

    if (variant === "luminosity") {
        return {
            primary: normalizedColor,
            primary50: generateLuminosityVariant(normalizedColor, 50),
            primary20: generateLuminosityVariant(normalizedColor, 20),
            highlight,
        };
    } else {
        return {
            primary: normalizedColor,
            primary50: generateTransparencyVariant(normalizedColor, 50),
            primary20: generateTransparencyVariant(normalizedColor, 20),
            highlight,
        };
    }
}
