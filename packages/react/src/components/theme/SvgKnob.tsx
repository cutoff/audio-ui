"use client";

import React, { useMemo } from "react";
import { generateColorVariants } from "../utils/colorUtils";
import { calculateArcPath } from "../utils/svgHelpers";

/**
 * Angular constants for the knob's arc
 */
const MAX_START_ANGLE = 220;
const MAX_END_ANGLE = 500;
const MAX_ARC_ANGLE = MAX_END_ANGLE - MAX_START_ANGLE;
const CENTER_ANGLE = 360;

/**
 * Props for the SvgKnob component
 */
export type SvgKnobProps = {
    /** Normalized value between 0 and 1 */
    normalizedValue: number;
    /** Whether to start the arc from center (bipolar mode) */
    bipolar?: boolean;
    /** Thickness of the knob's stroke */
    thickness?: number;
    /** Roundness for stroke linecap (0 = square, > 0 = round) */
    roundness?: number;
    /** Resolved color string */
    color: string;
    /** Content to display inside the knob */
    children?: React.ReactNode;
    /** Additional CSS class name */
    className?: string;
};

/**
 * Pure SVG presentation component for a knob.
 * Renders background and foreground arcs plus optional content in the center.
 *
 * @param normalizedValue - Value between 0 and 1
 * @param bipolar - Whether to start arc from center (default false)
 * @param thickness - Stroke width (default 12)
 * @param roundness - Linecap style: 0 for square, > 0 for round (default 12)
 * @param color - Resolved color string
 * @param children - Content to display in the center
 * @param className - Optional CSS class
 */
function SvgKnob({
    normalizedValue,
    bipolar = false,
    thickness = 12,
    roundness = 12,
    color,
    children,
    className,
}: SvgKnobProps): JSX.Element {
    // Convert normalized value to angle
    const valueToAngle = useMemo(() => {
        return normalizedValue * MAX_ARC_ANGLE + MAX_START_ANGLE;
    }, [normalizedValue]);

    // Use the thickness prop for stroke width (ensure non-negative)
    const strokeWidth = Math.max(0, thickness);

    // Calculate radius to make stroke expand inward
    // The outer edge stays at radius 50, and the stroke grows inward as thickness increases
    const radius = useMemo(() => {
        return 50 - strokeWidth / 2;
    }, [strokeWidth]);

    // Determine stroke linecap based on roundness (square if 0, round if > 0)
    const strokeLinecap = useMemo(() => {
        const nonNegativeRoundness = Math.max(0, roundness);
        return nonNegativeRoundness === 0 ? "square" : "round";
    }, [roundness]);

    // Generate color variants
    const colorVariants = useMemo(() => generateColorVariants(color, "transparency"), [color]);

    return (
        <g className={className}>
            {/* Background Arc */}
            <path
                style={{ stroke: colorVariants.primary50 }}
                fill="none"
                strokeWidth={strokeWidth}
                strokeLinecap={strokeLinecap}
                d={calculateArcPath(MAX_START_ANGLE, MAX_END_ANGLE, radius)}
            />

            {/* Foreground Arc */}
            <path
                style={{ stroke: colorVariants.primary }}
                fill="none"
                strokeWidth={strokeWidth}
                strokeLinecap={strokeLinecap}
                d={calculateArcPath(bipolar ? CENTER_ANGLE : MAX_START_ANGLE, valueToAngle, radius)}
            />

            {/* Value Display */}
            {children && (
                <foreignObject style={{ cursor: "inherit" }} x="20" y="20" width="60" height="60">
                    {children}
                </foreignObject>
            )}
        </g>
    );
}

/**
 * ViewBox dimensions for the SvgKnob component.
 * The parent component should use these values when setting up the SVG container.
 */
SvgKnob.viewBox = {
    width: 100,
    height: 100,
} as const;

export default SvgKnob;
