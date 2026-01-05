"use client";

import React, { useMemo } from "react";
import { generateColorVariants, getAdaptiveDefaultColor } from "@cutoff/audio-ui-core";
import { computeFilledZone, Zone } from "@cutoff/audio-ui-core";
import { translateSliderRoundness, translateSliderThickness } from "@cutoff/audio-ui-core";
import { DEFAULT_ROUNDNESS } from "@cutoff/audio-ui-core";
import { ControlComponent } from "@/types";

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
    /** Thickness of the slider (normalized 0.0-1.0, maps to 1-50) */
    thickness?: number;
    /** Corner roundness (normalized 0.0-1.0, maps to 0-20) */
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
 * @param thickness - Normalized thickness 0.0-1.0 (default 0.4, maps to 1-50)
 * @param roundness - Normalized roundness 0.0-1.0 (default 0.3, maps to 0-20)
 * @param color - Resolved color string
 * @param className - Optional CSS class
 */
function SvgSlider({
    normalizedValue,
    bipolar = false,
    orientation = "vertical",
    thickness = 0.4,
    roundness = DEFAULT_ROUNDNESS,
    color,
    className,
}: SvgSliderProps): JSX.Element {
    // Translate normalized thickness to legacy range (1-50)
    const legacyThickness = useMemo(() => {
        return translateSliderThickness(thickness);
    }, [thickness]);

    // Calculate the dimensions of the slider's main zone based on orientation and thickness
    const mainZone = useMemo<Zone>(() => {
        if (orientation === "vertical") {
            // Center the slider based on its thickness
            const x = 50 - legacyThickness / 2;
            return {
                x,
                y: 20,
                w: legacyThickness,
                h: 260,
            };
        } else {
            // For horizontal orientation
            const y = 50 - legacyThickness / 2;
            return {
                x: 20,
                y,
                w: 260,
                h: legacyThickness,
                maxH: legacyThickness, // Add maxH to match Zone type if needed, or rely on w/h
            };
        }
    }, [legacyThickness, orientation]);

    // Calculate the dimensions of the filled portion based on normalized value and orientation
    const filledZone = useMemo(() => {
        // For bipolar mode, center is at 0.5 of the normalized range
        const normalizedCenter = bipolar ? 0.5 : undefined;
        return computeFilledZone(mainZone, normalizedValue, 0, 1, normalizedCenter, orientation === "horizontal");
    }, [normalizedValue, bipolar, mainZone, orientation]);

    // Translate normalized roundness to legacy range (0-20) and calculate corner radius
    const cornerRadius = useMemo(() => {
        const legacyRoundness = translateSliderRoundness(roundness);

        // If roundness is 0, use square corners
        if (legacyRoundness === 0) {
            return 0;
        }

        // Use the translated roundness value
        return legacyRoundness;
    }, [roundness]);

    // Generate color variants
    const colorVariants = useMemo(
        () => generateColorVariants(color ?? getAdaptiveDefaultColor(), "transparency"),
        [color]
    );

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

const SLIDER_VIEWBOX = {
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
 * ViewBox dimensions for the SvgSlider component.
 * The parent component should use these values when setting up the SVG container.
 * Dimensions vary based on orientation.
 */
SvgSlider.viewBox = SLIDER_VIEWBOX;

/**
 * Props for specialized slider views (without normalizedValue, children, className, style, orientation)
 */
type SpecializedSliderProps = Omit<
    SvgSliderProps,
    "normalizedValue" | "children" | "className" | "style" | "orientation"
>;

/**
 * Specialized Vertical Slider for Generic Control System
 */
function SvgVerticalSliderComponent(
    props: SpecializedSliderProps & {
        normalizedValue: number;
        children?: React.ReactNode;
        className?: string;
        style?: React.CSSProperties;
    }
) {
    return <SvgSlider {...props} orientation="vertical" />;
}

const SvgVerticalSliderMemo = React.memo(SvgVerticalSliderComponent);

(SvgVerticalSliderMemo as any).viewBox = SLIDER_VIEWBOX.vertical;
(SvgVerticalSliderMemo as any).labelHeightUnits = 40;
(SvgVerticalSliderMemo as any).interaction = {
    mode: "both" as const,
    direction: "vertical" as const,
};
(SvgVerticalSliderMemo as any).title = "Vertical Slider";
(SvgVerticalSliderMemo as any).description = "A vertical fader control with linear fill indicator";

// Cast the memoized components to the ControlComponent type which includes the static properties
const SvgVerticalSlider = SvgVerticalSliderMemo as unknown as ControlComponent<SpecializedSliderProps>;

/**
 * Specialized Horizontal Slider for Generic Control System
 */
function SvgHorizontalSliderComponent(
    props: SpecializedSliderProps & {
        normalizedValue: number;
        children?: React.ReactNode;
        className?: string;
        style?: React.CSSProperties;
    }
) {
    return <SvgSlider {...props} orientation="horizontal" />;
}

const SvgHorizontalSliderMemo = React.memo(SvgHorizontalSliderComponent);

(SvgHorizontalSliderMemo as any).viewBox = SLIDER_VIEWBOX.horizontal;
(SvgHorizontalSliderMemo as any).labelHeightUnits = 40;
(SvgHorizontalSliderMemo as any).interaction = {
    mode: "both" as const,
    direction: "horizontal" as const,
};
(SvgHorizontalSliderMemo as any).title = "Horizontal Slider";
(SvgHorizontalSliderMemo as any).description = "A horizontal fader control with linear fill indicator";

const SvgHorizontalSlider = SvgHorizontalSliderMemo as unknown as ControlComponent<SpecializedSliderProps>;

export { SvgVerticalSlider, SvgHorizontalSlider };
export default React.memo(SvgSlider);
