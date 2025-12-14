"use client";

import React, { useMemo } from "react";
import { generateColorVariants } from "@cutoff/audio-ui-core";
import { calculateArcPath } from "@cutoff/audio-ui-core";
import { ControlComponent } from "../types";
import { translateKnobRoundness, translateKnobThickness } from "@cutoff/audio-ui-core";
import { DEFAULT_ROUNDNESS } from "@cutoff/audio-ui-core";

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
    /** Thickness of the knob's stroke (normalized 0.0-1.0, maps to 1-20) */
    thickness?: number;
    /** Roundness for stroke linecap (normalized 0.0-1.0, 0.0 = square, >0.0 = round) */
    roundness?: number;
    /** Resolved color string */
    color?: string;
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
 * @param thickness - Normalized thickness 0.0-1.0 (default 0.4, maps to 1-20)
 * @param roundness - Normalized roundness 0.0-1.0 (default 0.3, 0.0 = square, >0.0 = round)
 * @param color - Resolved color string
 * @param children - Content to display in the center
 * @param className - Optional CSS class
 */
function SvgKnob({
    normalizedValue,
    bipolar = false,
    thickness = 0.4,
    roundness = DEFAULT_ROUNDNESS,
    color,
    children,
    className,
}: SvgKnobProps) {
    // Convert normalized value to angle
    const valueToAngle = useMemo(() => {
        return normalizedValue * MAX_ARC_ANGLE + MAX_START_ANGLE;
    }, [normalizedValue]);

    // Translate normalized thickness to legacy range (1-20)
    const legacyThickness = useMemo(() => {
        return translateKnobThickness(thickness);
    }, [thickness]);

    // Use the translated thickness for stroke width
    const strokeWidth = legacyThickness;

    // Calculate radius to make stroke expand inward
    // The outer edge stays at radius 50, and the stroke grows inward as thickness increases
    const radius = useMemo(() => {
        return 50 - strokeWidth / 2;
    }, [strokeWidth]);

    // Translate normalized roundness to legacy value and determine stroke linecap
    const strokeLinecap = useMemo(() => {
        const legacyRoundness = translateKnobRoundness(roundness);
        return legacyRoundness === 0 ? "square" : "round";
    }, [roundness]);

    // Generate color variants
    const colorVariants = useMemo(
        () => generateColorVariants(color ?? "var(--audioui-primary-color)", "transparency"),
        [color]
    );

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
};

/**
 * Label height for the SvgKnob component.
 */
SvgKnob.labelHeightUnits = 20;

/**
 * Interaction contract for the SvgKnob component.
 */
SvgKnob.interaction = {
    mode: "both",
    direction: "vertical", // Knobs are typically adjusted via vertical drag
};

export default SvgKnob as ControlComponent<Omit<SvgKnobProps, "normalizedValue" | "children" | "className" | "style">>;
