/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import React from "react";
import classNames from "classnames";
import { VerticalSliderView, HorizontalSliderView } from "./SliderView";
import ContinuousControl from "@/primitives/controls/ContinuousControl";
import { useAdaptiveSize } from "@/hooks/useAdaptiveSize";
import {
    AdaptiveBoxProps,
    AdaptiveSizeProps,
    ContinuousControlProps,
    ThemableProps,
    SliderVariant,
    SliderCursorSize,
    ValueLabelMode,
} from "@/types";
import { clampNormalized } from "@cutoff/audio-ui-core";
import { useThemableProps } from "@/hooks/useThemableProps";

/**
 * Props for the Slider component (built-in control with theming support)
 */
export type SliderProps = ContinuousControlProps &
    AdaptiveSizeProps &
    AdaptiveBoxProps &
    ThemableProps & {
        /** Visual variant of the slider
         * @default "abstract"
         */
        variant?: SliderVariant;
        /** Orientation of the slider
         * @default 'vertical' */
        orientation?: "horizontal" | "vertical";
        /** Thickness of the slider (normalized 0.0-1.0, maps to 1-50)
         * @default 0.4 */
        thickness?: number;
        /**
         * Controls how the label and value are displayed.
         * - "labelOnly": Always shows the label (default)
         * - "valueOnly": Always shows the value
         * - "interactive": Shows label normally, but temporarily swaps to value during interaction
         * @default "labelOnly"
         */
        valueAsLabel?: ValueLabelMode;
        /** Cursor size option - determines which component's width is used for the cursor */
        cursorSize?: SliderCursorSize;
        /** Aspect ratio of the cursor */
        cursorAspectRatio?: number;
        /** Overrides the roundness factor of the cursor. Defaults to `roundness` */
        cursorRoundness?: number | string;
        /** Optional image URL to display as cursor */
        cursorImageHref?: string;
        /** Optional dark mode image URL for the cursor (used when dark mode is active) */
        cursorImageDarkHref?: string;
        /** Optional CSS class name for the cursor */
        cursorClassName?: string;
        /** Optional inline styles for the cursor */
        cursorStyle?: React.CSSProperties;
    };

/**
 * A slider component for audio applications.
 * Supports both horizontal and vertical orientations with continuous value adjustment.
 *
 * Features:
 * - Multiple visual variants (abstract, trackless, trackfull, stripless)
 * - Configurable orientation (horizontal or vertical)
 * - Bipolar mode support (centered at zero, grows in both directions)
 * - Customizable thickness and roundness
 * - Full theming support via CSS variables
 * - Adaptive sizing or fixed size variants
 * - Supports drag, wheel, and keyboard interactions
 * - Custom value formatting
 *
 * @example
 * ```tsx
 * // Basic vertical slider
 * <Slider value={50} min={0} max={100} onChange={(e) => setValue(e.value)} />
 *
 * // Horizontal bipolar slider (pan control)
 * <Slider
 *   orientation="horizontal"
 *   bipolar
 *   value={0}
 *   min={-100}
 *   max={100}
 *   label="Pan"
 * />
 *
 * // With parameter model
 * <Slider
 *   parameter={volumeParam}
 *   value={volume}
 *   onChange={handleVolumeChange}
 * />
 * ```
 */
function Slider({
    orientation = "vertical",
    min,
    max,
    step,
    bipolar = false,
    value,
    onChange,
    valueFormatter,
    label,
    adaptiveSize = false,
    size = "normal",
    displayMode,
    labelMode,
    labelPosition,
    labelAlign,
    labelOverflow,
    labelHeightUnits,
    color,
    roundness,
    variant = "abstract",
    thickness = 0.5,
    parameter,
    unit,
    scale,
    paramId,
    interactionMode,
    interactionDirection,
    interactionSensitivity,
    valueAsLabel = "labelOnly",
    midiResolution,
    defaultValue,
    onClick,
    onMouseDown,
    onMouseUp,
    onMouseEnter,
    onMouseLeave,
    className,
    style,
    cursorSize,
    cursorAspectRatio,
    cursorRoundness,
    cursorImageHref,
    cursorImageDarkHref,
    cursorClassName,
    cursorStyle,
}: SliderProps) {
    const { style: themableStyle } = useThemableProps({
        color,
        roundness,
        style,
    });

    // Clamp thickness if provided
    const clampedThickness = thickness !== undefined ? clampNormalized(thickness) : undefined;

    const { sizeClassName, sizeStyle } = useAdaptiveSize(adaptiveSize, size, "slider", orientation);

    const mergedClassName = classNames(sizeClassName, className);

    // Select view component based on orientation (different SVG implementations for optimal rendering)
    const ViewComponent = orientation === "vertical" ? VerticalSliderView : HorizontalSliderView;

    return (
        <ContinuousControl
            min={min}
            max={max}
            step={step}
            bipolar={bipolar}
            value={value}
            label={label}
            displayMode={displayMode}
            labelMode={labelMode}
            labelPosition={labelPosition}
            labelAlign={labelAlign}
            labelOverflow={labelOverflow}
            labelHeightUnits={labelHeightUnits}
            className={mergedClassName}
            style={{ ...sizeStyle, ...themableStyle }}
            onChange={onChange}
            paramId={paramId}
            onClick={onClick}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            parameter={parameter}
            unit={unit}
            scale={scale}
            midiResolution={midiResolution}
            defaultValue={defaultValue}
            interactionMode={interactionMode}
            interactionDirection={interactionDirection}
            interactionSensitivity={interactionSensitivity}
            valueFormatter={valueFormatter}
            valueAsLabel={valueAsLabel}
            ariaOrientation={orientation}
            view={ViewComponent}
            viewProps={{
                variant: variant,
                thickness: clampedThickness,
                roundness: roundness ?? "var(--audioui-roundness-slider)",
                bipolar: bipolar,
                cursorSize: cursorSize,
                cursorAspectRatio: cursorAspectRatio,
                cursorRoundness: cursorRoundness,
                cursorImageHref: cursorImageHref,
                cursorImageDarkHref: cursorImageDarkHref,
                cursorClassName: cursorClassName,
                cursorStyle: cursorStyle,
            }}
        />
    );
}

export default React.memo(Slider);
