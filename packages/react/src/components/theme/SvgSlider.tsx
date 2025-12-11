"use client";

import React, { useMemo } from "react";
import { generateColorVariants } from "../utils/colorUtils";
import { computeFilledZone, Zone } from "../utils/svgHelpers";

/**
 * Props for the SvgSlider component
 */
export type SvgSliderProps = {
    /** Normalized value between 0 and 1 */
    normalizedValue: number;
    /** Whether to start fill from center (bipolar mode) */
    bipolar?: boolean;
    /** Orientation of the slider */
    orientation?: "horizontal" | "vertical";
    /** Thickness of the slider in pixels */
    thickness?: number;
    /** Corner roundness (0 = square, > 0 = rounded) */
    roundness?: number;
    /** Resolved color string */
    color?: string;
    /** Additional CSS class name */
    className?: string;
    /** Content to render (unused in default slider but required by generic props) */
    children?: React.ReactNode;
};

/**
 * Pure SVG presentation component for a slider.
 * Renders background and filled rectangles based on normalized value.
 *
 * @param normalizedValue - Value between 0 and 1
 * @param bipolar - Whether to fill from center (default false)
 * @param orientation - Horizontal or vertical (default 'vertical')
 * @param thickness - Slider thickness in pixels (default 20)
 * @param roundness - Corner radius (default half thickness for rounded, 0 for square)
 * @param color - Resolved color string
 * @param className - Optional CSS class
 */
function SvgSlider({
    normalizedValue,
    bipolar = false,
    orientation = "vertical",
    thickness = 20,
    roundness,
    color,
    className,
}: SvgSliderProps): JSX.Element {
    // Ensure thickness is non-negative
    const nonNegativeThickness = Math.max(0, thickness);

    // Calculate the dimensions of the slider's main zone based on orientation and thickness
    const mainZone = useMemo<Zone>(() => {
        if (orientation === "vertical") {
            // Center the slider based on its thickness
            const x = 50 - nonNegativeThickness / 2;
            return {
                x,
                y: 20,
                w: nonNegativeThickness,
                h: 260,
            };
        } else {
            // For horizontal orientation
            const y = 50 - nonNegativeThickness / 2;
            return {
                x: 20,
                y,
                w: 260,
                h: nonNegativeThickness,
                maxH: nonNegativeThickness, // Add maxH to match Zone type if needed, or rely on w/h
            };
        }
    }, [nonNegativeThickness, orientation]);

    // Calculate the dimensions of the filled portion based on normalized value and orientation
    const filledZone = useMemo(() => {
        // For bipolar mode, center is at 0.5 of the normalized range
        const normalizedCenter = bipolar ? 0.5 : undefined;
        return computeFilledZone(mainZone, normalizedValue, 0, 1, normalizedCenter, orientation === "horizontal");
    }, [normalizedValue, bipolar, mainZone, orientation]);

    // Calculate corner radius based on roundness
    const cornerRadius = useMemo(() => {
        // Ensure roundness is non-negative if provided
        const nonNegativeRoundness = roundness !== undefined ? Math.max(0, roundness) : undefined;

        // If roundness is 0, use square caps (cornerRadius = 0)
        if (nonNegativeRoundness === 0) {
            return 0;
        }

        // Use provided roundness or fall back to half the thickness for fully rounded corners
        const dimension = orientation === "vertical" ? mainZone.w : mainZone.h;
        return nonNegativeRoundness !== undefined ? nonNegativeRoundness : dimension / 2;
    }, [mainZone, roundness, orientation]);

    // Generate color variants
    const colorVariants = useMemo(() => generateColorVariants(color ?? "var(--audioui-primary-color)", "transparency"), [color]);

    return (
        <g className={className}>
            {/* Background Rectangle */}
            <rect
                style={{ fill: colorVariants.primary50 }}
                x={mainZone.x}
                y={mainZone.y}
                width={mainZone.w}
                height={mainZone.h}
                rx={cornerRadius}
                ry={cornerRadius}
            />

            {/* Foreground Rectangle */}
            <rect
                style={{ fill: colorVariants.primary }}
                x={orientation === "horizontal" ? filledZone.x : mainZone.x}
                y={orientation === "vertical" ? filledZone.y : mainZone.y}
                width={orientation === "horizontal" ? filledZone.w : mainZone.w}
                height={orientation === "vertical" ? filledZone.h : mainZone.h}
                rx={cornerRadius}
                ry={cornerRadius}
            />
        </g>
    );
}

/**
 * ViewBox dimensions for the SvgSlider component.
 * The parent component should use these values when setting up the SVG container.
 * Dimensions vary based on orientation.
 */
SvgSlider.viewBox = {
    vertical: {
        width: 100,
        height: 300,
    },
    horizontal: {
        width: 300,
        height: 100,
    },
} as const;

/**
 * Props for specialized slider views (without normalizedValue, children, className, style, orientation)
 */
type SpecializedSliderProps = Omit<SvgSliderProps, "normalizedValue" | "children" | "className" | "style" | "orientation">;

/**
 * Specialized Vertical Slider for Generic Control System
 */
function SvgVerticalSlider(props: SpecializedSliderProps & { normalizedValue: number; children?: React.ReactNode; className?: string; style?: React.CSSProperties }) {
    return <SvgSlider {...props} orientation="vertical" />;
}

SvgVerticalSlider.viewBox = SvgSlider.viewBox.vertical;
SvgVerticalSlider.labelHeightUnits = 40;
SvgVerticalSlider.interaction = {
    mode: "both" as const,
    direction: "vertical" as const,
};

/**
 * Specialized Horizontal Slider for Generic Control System
 */
function SvgHorizontalSlider(props: SpecializedSliderProps & { normalizedValue: number; children?: React.ReactNode; className?: string; style?: React.CSSProperties }) {
    return <SvgSlider {...props} orientation="horizontal" />;
}

SvgHorizontalSlider.viewBox = SvgSlider.viewBox.horizontal;
SvgHorizontalSlider.labelHeightUnits = 40;
SvgHorizontalSlider.interaction = {
    mode: "both" as const,
    direction: "horizontal" as const,
};

export { SvgVerticalSlider, SvgHorizontalSlider };
export default SvgSlider;
