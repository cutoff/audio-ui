/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import React, { useMemo } from "react";
import { translateSliderThickness, CSS_VARS } from "@cutoff/audio-ui-core";
import { DEFAULT_ROUNDNESS } from "@cutoff/audio-ui-core";
import { ControlComponent, SliderVariant, SliderCursorSize } from "@/types";
import LinearStrip from "@/primitives/svg/LinearStrip";
import ValueStrip from "@/primitives/svg/ValueStrip";
import LinearCursor from "@/primitives/svg/LinearCursor";

// Constants for cursor size calculations (future use for Tick and Label sizes)
const TICK_TRACK_SHIFT = 30;
const LABEL_TRACK_SHIFT = 30;

/**
 * Props for the SliderView component
 */
export type SliderViewProps = {
    /** Normalized value between 0 and 1 */
    normalizedValue: number;
    /** Whether to start fill from center (bipolar mode) */
    bipolar?: boolean;
    /** Visual variant of the slider */
    variant?: SliderVariant;
    /** Orientation of the slider */
    orientation?: "horizontal" | "vertical";
    /** Thickness of the slider (normalized 0.0-1.0, maps to 1-50) */
    thickness?: number;
    /** Corner roundness (normalized 0.0-1.0, maps to 0-20, or CSS variable string) */
    roundness?: number | string;
    /** Cursor size option - determines which component's width is used for the cursor */
    cursorSize?: SliderCursorSize;
    /** Aspect ratio of the cursor */
    cursorAspectRatio?: number;
    /** Overrides the roundness factor of the cursor. Defaults to `roundness` */
    cursorRoundness?: number | string;
    /** Optional image URL to display as cursor */
    cursorImageHref?: string;
    /** Optional CSS class name for the cursor */
    cursorClassName?: string;
    /** Optional inline styles for the cursor */
    cursorStyle?: React.CSSProperties;
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
 * which are set by the parent Slider component via useThemableProps from the `color` prop.
 *
 * **Performance Optimizations:**
 * - Memoized calculations: thickness translation, layout coordinates, strip padding, cursor dimensions, style objects
 * - Constants moved outside component to avoid unnecessary dependency array entries
 * - Simple boolean checks and nullish coalescing are not memoized (minimal overhead)
 * - Style objects memoized to prevent unnecessary re-renders of child components
 *
 * @param {number} normalizedValue - Value between 0 and 1
 * @param {boolean} [bipolar=false] - Whether to fill from center (bipolar mode)
 * @param {SliderVariant} [variant="abstract"] - Visual variant of the slider
 * @param {"horizontal" | "vertical"} [orientation="vertical"] - Orientation of the slider
 * @param {number} [thickness=0.4] - Normalized thickness 0.0-1.0 (maps to 1-50)
 * @param {number | string} [roundness] - Normalized roundness 0.0-1.0 (maps to 0-20) or CSS variable string
 * @param {SliderCursorSize} [cursorSize] - Cursor size option (None, Strip, Track, Tick, Label)
 * @param {number} [cursorAspectRatio] - Aspect ratio of the cursor
 * @param {number | string} [cursorRoundness] - Overrides cursor roundness (defaults to roundness prop)
 * @param {string} [cursorImageHref] - Optional image URL for cursor
 * @param {string} [cursorClassName] - Optional CSS class name for cursor
 * @param {React.CSSProperties} [cursorStyle] - Optional inline styles for cursor
 * @param {string} [className] - Optional CSS class name
 * @returns {JSX.Element} SVG group element containing background and foreground strips
 */
function SliderView({
    normalizedValue,
    bipolar = false,
    variant = "abstract",
    orientation = "vertical",
    thickness = 0.4,
    roundness = DEFAULT_ROUNDNESS,
    cursorSize,
    cursorAspectRatio,
    cursorRoundness,
    cursorImageHref,
    cursorClassName,
    cursorStyle,
    className,
}: SliderViewProps): React.JSX.Element {
    // Translate normalized thickness to pixel range (1-50)
    const effectiveThickness = useMemo(() => {
        return translateSliderThickness(thickness);
    }, [thickness]);

    // Determine layout based on orientation
    const { cx, cy, rotation } = useMemo(() => {
        if (orientation === "vertical") {
            return {
                cx: 50,
                cy: 150,
                rotation: 0,
            };
        } else {
            return {
                cx: 150,
                cy: 50,
                rotation: -90,
            };
        }
    }, [orientation]);

    // Calculate strip padding for trackfull variant (thickness-dependent)
    const stripPadding = useMemo(() => {
        return variant === "trackfull" ? 25 * thickness + 5 : 0;
    }, [variant, thickness]);

    // Calculate cursor width based on cursorSize prop
    // If cursorSize is not provided, maintain backward compatibility (old behavior)
    const cursorWidth = useMemo(() => {
        // If cursorSize is explicitly "None", don't render cursor
        if (cursorSize === "None") {
            return undefined;
        }

        // If cursorSize is provided, use it to calculate width
        if (cursorSize) {
            switch (cursorSize) {
                case "Strip":
                    // Width of the ValueStrip (if variant supports it)
                    return variant !== "stripless" ? effectiveThickness - stripPadding : effectiveThickness;
                case "Track":
                    // Width of the LinearStrip (track)
                    return effectiveThickness;
                case "Tick":
                    // Width of the TickStrip (future use - for now, use track width)
                    return effectiveThickness + TICK_TRACK_SHIFT;
                case "Label":
                    // Entire width of the Slider (future use - for now, use track width)
                    return effectiveThickness + TICK_TRACK_SHIFT + LABEL_TRACK_SHIFT;
                default:
                    return undefined;
            }
        }

        // Backward compatibility: if cursorSize is not provided, use old behavior
        // (render cursor when variant !== "abstract" with old width calculation)
        return variant !== "abstract" ? effectiveThickness - stripPadding : undefined;
    }, [cursorSize, effectiveThickness, stripPadding, variant]);

    // Determine if cursor should be rendered
    const shouldRenderCursor = cursorWidth !== undefined;

    // Determine cursor roundness (defaults to roundness prop if not specified)
    const effectiveCursorRoundness = cursorRoundness ?? roundness;

    // Calculate cursor height to adjust the length (prevent cursor from going beyond strip bounds)
    const cursorHeight = useMemo(() => {
        if (!shouldRenderCursor || cursorWidth === undefined) {
            return 0;
        }
        // For images, LinearCursor uses a square bounding box (width x width)
        // TODO: Calculate actual image aspect ratio: (cursorWidth / imageWidth) * imageHeight
        // This requires loading the image to get its dimensions, which would add async complexity
        // Current implementation uses cursorWidth as height (square) as a reasonable approximation
        if (cursorImageHref) {
            return cursorWidth;
        }
        // For non-image cursors, height = width / aspectRatio
        return cursorWidth / (cursorAspectRatio ?? 1);
    }, [shouldRenderCursor, cursorWidth, cursorAspectRatio, cursorImageHref]);

    // Calculate effective length for cursor (subtract cursor height to keep cursor within bounds)
    const cursorLength = useMemo(() => {
        return 260 - cursorHeight;
    }, [cursorHeight]);

    // Calculate ValueStrip length (reduced by padding for trackfull variant)
    const valueStripLength = useMemo(() => {
        return 260 - stripPadding;
    }, [stripPadding]);

    // Memoize styles to prevent unnecessary re-renders of child components
    const bgStripStyle = useMemo(
        () => ({
            fill: variant === "abstract" ? `var(${CSS_VARS.primary20})` : `var(${CSS_VARS.sliderTrackColor})`,
        }),
        [variant]
    );

    const valueStripStyle = useMemo(
        () => ({
            fill: `var(${CSS_VARS.primaryColor})`,
        }),
        []
    );

    const cursorStyleMemo = useMemo(
        () => ({
            fill: `var(${CSS_VARS.primaryColor})`,
            stroke: `var(${CSS_VARS.sliderCursorBorderColor})`,
            strokeWidth: `var(${CSS_VARS.sliderCursorBorderWidth})`,
            ...cursorStyle,
        }),
        [cursorStyle]
    );

    return (
        <g className={className}>
            {/* Background Strip */}
            <LinearStrip
                cx={cx}
                cy={cy}
                length={260}
                thickness={effectiveThickness}
                rotation={rotation}
                roundness={roundness}
                style={bgStripStyle}
            />

            {/* Foreground Value Strip */}
            {variant !== "stripless" ? (
                <ValueStrip
                    cx={cx}
                    cy={cy}
                    length={valueStripLength}
                    thickness={effectiveThickness - stripPadding}
                    rotation={rotation}
                    roundness={roundness}
                    normalizedValue={normalizedValue}
                    bipolar={bipolar}
                    style={valueStripStyle}
                />
            ) : undefined}

            {/* Cursor */}
            {shouldRenderCursor && cursorWidth !== undefined ? (
                <LinearCursor
                    cx={cx}
                    cy={cy}
                    length={cursorLength}
                    rotation={rotation}
                    normalizedValue={normalizedValue}
                    width={cursorWidth}
                    aspectRatio={cursorAspectRatio ?? 1}
                    roundness={effectiveCursorRoundness}
                    imageHref={cursorImageHref}
                    className={cursorClassName}
                    style={cursorStyleMemo}
                />
            ) : undefined}
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
