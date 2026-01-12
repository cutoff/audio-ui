/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import React, { useMemo } from "react";
import { clampNormalized, generateTransparencyVariant } from "@cutoff/audio-ui-core";

/**
 * Options for useThemableProps hook
 */
export interface UseThemablePropsOptions {
    /** Component primary color - any valid CSS color value */
    color?: string;
    /** Roundness for component corners/caps (normalized 0.0-1.0) */
    roundness?: number;
    /** Thickness for component strokes/widths (normalized 0.0-1.0) */
    thickness?: number;
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
    /** Clamped thickness value (undefined if not provided) */
    clampedThickness?: number;
}

/**
 * Hook that encapsulates CSS variable computation for themable components.
 *
 * This hook handles:
 * - Clamping normalized values (roundness, thickness) to valid ranges
 * - Generating CSS variables from themable props
 * - Computing color variants (primary-50, primary-20) when color is provided
 * - Merging with user-provided style (user style takes precedence)
 *
 * The hook returns a style object that can be spread directly onto component elements,
 * along with clamped values that can be used for viewProps.
 * CSS variables are set on the element, allowing child components to read them via `var(--audioui-*)`.
 *
 * @param options - Configuration object with color, roundness, thickness, and style
 * @returns Object containing style and clamped values
 *
 * @example
 * ```tsx
 * function MyComponent({ color, roundness, thickness, style }: ThemableProps & BaseProps) {
 *   const { style: themableStyle, clampedRoundness, clampedThickness } = useThemableProps({
 *     color,
 *     roundness,
 *     thickness,
 *     style,
 *   });
 *
 *   return (
 *     <div style={themableStyle}>
 *       {/* Child components can read CSS variables via var(--audioui-primary-color) *\/}
 *       <ViewComponent roundness={clampedRoundness ?? DEFAULT_ROUNDNESS} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useThemableProps({
    color,
    roundness,
    thickness,
    style,
}: UseThemablePropsOptions): UseThemablePropsResult {
    return useMemo(() => {
        const vars: Record<string, string> = {};
        let clampedRoundness: number | undefined;
        let clampedThickness: number | undefined;

        // Handle roundness - clamp and store for return
        if (roundness !== undefined) {
            clampedRoundness = clampNormalized(roundness);
            vars["--audioui-roundness-base"] = clampedRoundness.toString();
        }

        // Handle color and generate variants
        if (color !== undefined) {
            vars["--audioui-primary-color"] = color;
            // Compute variants for this component instance
            vars["--audioui-primary-50"] = generateTransparencyVariant(color, 50);
            vars["--audioui-primary-20"] = generateTransparencyVariant(color, 20);
        }

        // Handle thickness - clamp and store for return
        if (thickness !== undefined) {
            clampedThickness = clampNormalized(thickness);
            vars["--audioui-thickness-base"] = clampedThickness.toString();
        }

        // Merge CSS variables with user style (user style takes precedence)
        return {
            style: { ...vars, ...style } as React.CSSProperties,
            clampedRoundness,
            clampedThickness,
        };
    }, [color, roundness, thickness, style]);
}
