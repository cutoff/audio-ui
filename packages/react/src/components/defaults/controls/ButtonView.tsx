/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import React, { useMemo } from "react";
import { generateColorVariants } from "@cutoff/audio-ui-core";
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
    /** Corner roundness (normalized 0.0-1.0, maps to 0-50) */
    roundness?: number;
    /** Resolved color string */
    color: string;
    /** Additional CSS class name */
    className?: string;
};

/**
 * Pure SVG presentation component for a button.
 * Renders a rectangle with conditional styling based on normalized value vs threshold.
 *
 * @param normalizedValue - Value between 0 and 1
 * @param threshold - Threshold value (default 0.5), determines "on" state
 * @param roundness - Normalized roundness 0.0-1.0 (default 0.3, maps to 0-50)
 * @param color - Resolved color string
 * @param className - Optional CSS class
 */
function ButtonView({
    normalizedValue,
    threshold = 0.5,
    roundness = DEFAULT_ROUNDNESS,
    color,
    className,
}: ButtonViewProps): JSX.Element {
    // Determine if button is "on" based on threshold
    const isOn = useMemo(() => normalizedValue > threshold, [normalizedValue, threshold]);

    // Generate color variants
    const colorVariants = useMemo(() => generateColorVariants(color, "transparency"), [color]);

    // Translate normalized roundness to legacy range (0-50)
    const cornerRadius = useMemo(() => {
        return translateButtonRoundness(roundness);
    }, [roundness]);

    // Determine button styles based on state
    const buttonStyles = useMemo(
        () => ({
            stroke: isOn ? colorVariants.primary50 : colorVariants.primary20,
            fill: isOn ? colorVariants.primary : colorVariants.primary50,
        }),
        [isOn, colorVariants]
    );

    return (
        <rect
            className={className}
            style={{
                stroke: buttonStyles.stroke,
                fill: buttonStyles.fill,
            }}
            strokeWidth="5"
            x={10}
            y={10}
            width={80}
            height={40}
            rx={cornerRadius}
            ry={cornerRadius}
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
(ButtonViewMemo as any).labelHeightUnits = 30;

export default ButtonViewMemo as unknown as ControlComponent<
    Omit<ButtonViewProps, "normalizedValue" | "className" | "style">
>;
