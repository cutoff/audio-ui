/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import React, { useMemo } from "react";
import { translateButtonRoundness } from "@cutoff/audio-ui-core";
import { DEFAULT_ROUNDNESS } from "@cutoff/audio-ui-core";
import { ControlComponent } from "@/types";

/**
 * Props for the ButtonView component
 */
export type ButtonViewProps = {
    /** Normalized value between 0 and 1 */
    normalizedValue: number;
    /** Threshold for determining "on" state (default 0.5) */
    threshold?: number;
    /** Corner roundness (normalized 0.0-1.0, maps to 0-50, or CSS variable string) */
    roundness?: number | string;
    /** Color prop (kept for API compatibility, but colors are read from CSS variables) */
    color: string;
    /** Additional CSS class name */
    className?: string;
};

/**
 * Pure SVG presentation component for a button.
 * Renders a rectangle with conditional styling based on normalized value vs threshold.
 *
 * Colors are read from CSS variables (`--audioui-primary-color`, `--audioui-primary-50`, `--audioui-primary-20`)
 * which are set by the parent Button component based on the `color` prop.
 *
 * @param normalizedValue - Value between 0 and 1
 * @param threshold - Threshold value (default 0.5), determines "on" state
 * @param roundness - Normalized roundness 0.0-1.0 (default 0.3, maps to 0-50)
 * @param color - Color prop (kept for API compatibility, but not used - CSS variables are used instead)
 * @param className - Optional CSS class
 */
function ButtonView({
    normalizedValue,
    threshold = 0.5,
    roundness,
    color: _color, // Prefixed with _ to indicate intentionally unused (kept for API compatibility)
    className,
}: ButtonViewProps): React.JSX.Element {
    // Determine if button is "on" based on threshold
    const isOn = useMemo(() => normalizedValue > threshold, [normalizedValue, threshold]);

    // Translate normalized roundness to legacy range (0-50) or use CSS variable
    // When roundness is a CSS variable string (from theme), pass it directly to SVG rx/ry attributes.
    // When roundness is a number, translate it to the legacy pixel range.
    const cornerRadius = useMemo(() => {
        if (typeof roundness === "string") {
            // CSS variable - pass directly to SVG (browser will resolve it)
            return roundness;
        }
        // Numeric value - translate to legacy pixel range (0-50)
        return translateButtonRoundness(roundness ?? DEFAULT_ROUNDNESS);
    }, [roundness]);

    // Use CSS variables for colors - CSS handles variant generation via color-mix
    const buttonStyles = useMemo(
        () => ({
            stroke: isOn ? "var(--audioui-primary-50)" : "var(--audioui-primary-20)",
            fill: isOn ? "var(--audioui-primary-color)" : "var(--audioui-primary-50)",
            strokeWidth: "var(--audioui-button-stroke-width, 5px)",
        }),
        [isOn]
    );

    return (
        <rect
            className={className}
            style={{
                stroke: buttonStyles.stroke,
                fill: buttonStyles.fill,
                strokeWidth: buttonStyles.strokeWidth,
                rx: cornerRadius,
                ry: cornerRadius,
            }}
            x={10}
            y={10}
            width={80}
            height={40}
            // Use 0 as fallback for older browsers that don't support CSS rx/ry
            // If cornerRadius is a number, we can use it directly
            rx={typeof cornerRadius === "number" ? cornerRadius : 0}
            ry={typeof cornerRadius === "number" ? cornerRadius : 0}
        />
    );
}

/**
 * ViewBox dimensions for the ButtonView component.
 * The parent component should use these values when setting up the SVG container.
 */
const VIEW_BOX = {
    width: 100,
    height: 60,
} as const;

const ButtonViewMemo = React.memo(ButtonView);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(ButtonViewMemo as any).viewBox = VIEW_BOX;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(ButtonViewMemo as any).labelHeightUnits = 20;

export default ButtonViewMemo as unknown as ControlComponent<
    Omit<ButtonViewProps, "normalizedValue" | "className" | "style">
>;
