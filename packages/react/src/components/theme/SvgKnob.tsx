"use client";

import React, { useMemo } from "react";
import { generateColorVariants, getAdaptiveDefaultColor } from "@cutoff/audio-ui-core";
import { ControlComponent } from "../types";
import { translateKnobRoundness, translateKnobThickness } from "@cutoff/audio-ui-core";
import { DEFAULT_ROUNDNESS } from "@cutoff/audio-ui-core";
import Ring from "../primitives/views/Ring";

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
    // Translate normalized thickness to pixel range (1-20)
    const pixelThickness = useMemo(() => {
        return translateKnobThickness(thickness);
    }, [thickness]);

    // Translate normalized roundness to boolean (0 = square, >0 = round)
    const isRound = useMemo(() => {
        return translateKnobRoundness(roundness) !== 0;
    }, [roundness]);

    // Generate color variants
    const colorVariants = useMemo(
        () => generateColorVariants(color ?? getAdaptiveDefaultColor(), "transparency"),
        [color]
    );

    // SvgKnob uses angles 220-500 (280 degree arc)
    // Ring's openness = 360 - arc_angle = 360 - 280 = 80 degrees
    const OPENNESS = 80;

    // Center and radius for 100x100 viewBox
    const cx = 50;
    const cy = 50;
    const radius = 50;

    return (
        <g className={className}>
            <Ring
                cx={cx}
                cy={cy}
                radius={radius}
                normalizedValue={normalizedValue}
                bipolar={bipolar}
                thickness={pixelThickness}
                roundness={isRound}
                openness={OPENNESS}
                fgArcStyle={{ stroke: colorVariants.primary }}
                bgArcStyle={{ stroke: colorVariants.primary50 }}
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
const VIEW_BOX = {
    width: 100,
    height: 100,
};

/**
 * Label height for the SvgKnob component.
 */
const LABEL_HEIGHT_UNITS = 20;

/**
 * Interaction contract for the SvgKnob component.
 */
const INTERACTION = {
    mode: "both",
    direction: "circular", // Knobs use circular/rotary drag behavior
} as const;

// Create memoized component
const MemoSvgKnob = React.memo(SvgKnob);

// Explicitly attach static properties to the memoized component
(MemoSvgKnob as any).viewBox = VIEW_BOX;
(MemoSvgKnob as any).labelHeightUnits = LABEL_HEIGHT_UNITS;
(MemoSvgKnob as any).interaction = INTERACTION;
(MemoSvgKnob as any).title = "Knob";
(MemoSvgKnob as any).description = "A rotary knob control with circular arc indicator";

export default MemoSvgKnob as unknown as ControlComponent<
    Omit<SvgKnobProps, "normalizedValue" | "children" | "className" | "style">
>;
