"use client";

import React, { useMemo } from "react";
import { generateColorVariants } from "@cutoff/audio-ui-core";
import { translateButtonRoundness } from "@cutoff/audio-ui-core";
import { DEFAULT_ROUNDNESS } from "@cutoff/audio-ui-core";

/**
 * Props for the SvgButton component
 */
export type SvgButtonProps = {
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
function SvgButton({
    normalizedValue,
    threshold = 0.5,
    roundness = DEFAULT_ROUNDNESS,
    color,
    className,
}: SvgButtonProps): JSX.Element {
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
 * ViewBox dimensions for the SvgButton component.
 * The parent component should use these values when setting up the SVG container.
 */
const VIEW_BOX = {
    width: 100,
    height: 60,
} as const;

const SvgButtonMemo = React.memo(SvgButton);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(SvgButtonMemo as any).viewBox = VIEW_BOX;

export default SvgButtonMemo as unknown as React.MemoExoticComponent<typeof SvgButton> & {
    viewBox: typeof VIEW_BOX;
};
