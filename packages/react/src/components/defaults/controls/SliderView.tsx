/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import React, { useMemo } from "react";
import { computeFilledZone, Zone } from "@cutoff/audio-ui-core";
import { translateSliderRoundness, translateSliderThickness } from "@cutoff/audio-ui-core";
import { DEFAULT_ROUNDNESS } from "@cutoff/audio-ui-core";
import { ControlComponent } from "@/types";

/**
 * Props for the SliderView component
 */
export type SliderViewProps = {
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
    /** Color prop (kept for API compatibility, but colors are read from CSS variables) */
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
 * Colors are read from CSS variables (`--audioui-primary-color`, `--audioui-primary-50`)
 * which are set by the parent Slider component based on the `color` prop.
 *
 * @param normalizedValue - Value between 0 and 1
 * @param bipolar - Whether to fill from center (default false)
 * @param orientation - Horizontal or vertical (default 'vertical')
 * @param thickness - Normalized thickness 0.0-1.0 (default 0.4, maps to 1-50)
 * @param roundness - Normalized roundness 0.0-1.0 (default 0.3, maps to 0-20)
 * @param color - Color prop (kept for API compatibility, but not used - CSS variables are used instead)
 * @param className - Optional CSS class
 */
function SliderView({
    normalizedValue,
    bipolar = false,
    orientation = "vertical",
    thickness = 0.4,
    roundness = DEFAULT_ROUNDNESS,
    color: _color, // Prefixed with _ to indicate intentionally unused (kept for API compatibility)
    className,
}: SliderViewProps): JSX.Element {
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

    return (
        <g className={className}>
            {/* Background Rectangle */}
            <rect
                style={{ fill: "var(--audioui-primary-50)" }}
                x={mainZone.x}
                y={mainZone.y}
                width={mainZone.w}
                height={mainZone.h}
                rx={cornerRadius}
                ry={cornerRadius}
            />

            {/* Foreground Rectangle */}
            <rect
                style={{ fill: "var(--audioui-primary-color)" }}
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
 * ViewBox dimensions for the SliderView component.
 * The parent component should use these values when setting up the SVG container.
 * Dimensions vary based on orientation.
 */
SliderView.viewBox = SLIDER_VIEWBOX;

/**
 * Props for specialized slider views (without normalizedValue, children, className, style, orientation)
 */
type SpecializedSliderProps = Omit<
    SliderViewProps,
    "normalizedValue" | "children" | "className" | "style" | "orientation"
>;

/**
 * Specialized Vertical Slider for Generic Control System
 */
function VerticalSliderViewComponent(
    props: SpecializedSliderProps & {
        normalizedValue: number;
        children?: React.ReactNode;
        className?: string;
        style?: React.CSSProperties;
    }
) {
    return <SliderView {...props} orientation="vertical" />;
}

const VerticalSliderViewMemo = React.memo(VerticalSliderViewComponent);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(VerticalSliderViewMemo as any).viewBox = SLIDER_VIEWBOX.vertical;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(VerticalSliderViewMemo as any).labelHeightUnits = 40;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(VerticalSliderViewMemo as any).interaction = {
    mode: "both" as const,
    direction: "vertical" as const,
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(VerticalSliderViewMemo as any).title = "Vertical Slider";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(VerticalSliderViewMemo as any).description = "A vertical fader control with linear fill indicator";

// Cast the memoized components to the ControlComponent type which includes the static properties
const VerticalSliderView = VerticalSliderViewMemo as unknown as ControlComponent<SpecializedSliderProps>;

/**
 * Specialized Horizontal Slider for Generic Control System
 */
function HorizontalSliderViewComponent(
    props: SpecializedSliderProps & {
        normalizedValue: number;
        children?: React.ReactNode;
        className?: string;
        style?: React.CSSProperties;
    }
) {
    return <SliderView {...props} orientation="horizontal" />;
}

const HorizontalSliderViewMemo = React.memo(HorizontalSliderViewComponent);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(HorizontalSliderViewMemo as any).viewBox = SLIDER_VIEWBOX.horizontal;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(HorizontalSliderViewMemo as any).labelHeightUnits = 40;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(HorizontalSliderViewMemo as any).interaction = {
    mode: "both" as const,
    direction: "horizontal" as const,
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(HorizontalSliderViewMemo as any).title = "Horizontal Slider";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(HorizontalSliderViewMemo as any).description = "A horizontal fader control with linear fill indicator";

const HorizontalSliderView = HorizontalSliderViewMemo as unknown as ControlComponent<SpecializedSliderProps>;

export { VerticalSliderView, HorizontalSliderView };
export default React.memo(SliderView);
