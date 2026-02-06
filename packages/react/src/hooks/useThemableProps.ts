/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

import React, { useMemo } from "react";
import { clampNormalized } from "@cutoff/audio-ui-core";

/**
 * Options for useThemableProps hook
 */
export interface UseThemablePropsOptions {
    /** Component primary color - any valid CSS color value */
    color?: string;
    /** Roundness for component corners/caps (normalized 0.0-1.0) */
    roundness?: number;
    /** User-provided style object (takes precedence over generated CSS variables) */
    style?: React.CSSProperties;
}

/**
 * Return value from useThemableProps hook
 */
export interface UseThemablePropsResult {
    /** Merged style object with CSS variables and user styles */
    style: React.CSSProperties;
    /** Clamped roundness value (undefined if not provided) */
    clampedRoundness?: number;
}

/**
 * Hook that encapsulates CSS variable computation for themable components.
 *
 * This hook handles:
 * - Clamping normalized roundness values to valid ranges
 * - Setting CSS variables from themable props (color, roundness)
 * - Automatically inferring linecap from roundness (0.0 = square, >0.0 = round)
 * - Merging with user-provided style (user style takes precedence)
 *
 * **Color Cascade:** When a color is set, only `--audioui-primary-color` is written.
 * Derived variants (primary-50, primary-20, primary-lighter, primary-darker) are defined
 * in themes.css and automatically recompute via CSS `color-mix()` expressions.
 *
 * **Roundness and Linecap Relationship:**
 * The roundness attribute serves as a single source of truth for the overall "feeling" of the UI.
 * For arc-based components (like knobs), the roundness value automatically determines the stroke-linecap:
 * - `roundness = 0.0` → `stroke-linecap: square` (sharp, technical look)
 * - `roundness > 0.0` → `stroke-linecap: round` (smooth, rounded look)
 *
 * This hook sets both `--audioui-roundness-base` and `--audioui-linecap-base` CSS variables
 * when a roundness prop is provided, ensuring consistent visual styling across all components.
 *
 * The hook returns a style object that can be spread directly onto component elements,
 * along with clamped values that can be used for viewProps.
 * CSS variables are set on the element, allowing child components to read them via `var(--audioui-*)`.
 *
 * @param options - Configuration object with color, roundness, and style
 * @returns Object containing style and clamped roundness value
 *
 * @example
 * ```tsx
 * function MyComponent({ color, roundness, style }: ThemableProps & BaseProps) {
 *   const { style: themableStyle } = useThemableProps({
 *     color,
 *     roundness,
 *     style,
 *   });
 *
 *   return (
 *     <div style={themableStyle}>
 *       {/* Child components can read CSS variables via var(--audioui-primary-color) *\/}
 *       <ViewComponent roundness={roundness ?? "var(--audioui-roundness-button)"} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useThemableProps({ color, roundness, style }: UseThemablePropsOptions): UseThemablePropsResult {
    return useMemo(() => {
        const vars: Record<string, string> = {};
        let clampedRoundness: number | undefined;

        // Handle roundness - clamp and store for return
        // Automatically infer linecap from roundness: this ensures arc-based components
        // (like knobs) have consistent visual styling. The linecap is a derived property
        // that should not be set independently - it's always inferred from roundness.
        if (roundness !== undefined) {
            clampedRoundness = clampNormalized(roundness);
            vars["--audioui-roundness-base"] = clampedRoundness.toString();
            // Automatically infer linecap: 0.0 = square (sharp), >0.0 = round (smooth)
            vars["--audioui-linecap-base"] = clampedRoundness === 0 ? "square" : "round";
        }

        // Handle color - only set the base color, let CSS cascade handle derived variants
        // The derived variants (primary-50, primary-20, primary-lighter, primary-darker) are defined
        // in themes.css in terms of var(--audioui-primary-color), so they will automatically
        // recompute when we override the base color here.
        if (color !== undefined) {
            vars["--audioui-primary-color"] = color;
        }

        // Merge CSS variables with user style (user style takes precedence)
        return {
            style: { ...vars, ...style } as React.CSSProperties,
            clampedRoundness,
        };
    }, [color, roundness, style]);
}
