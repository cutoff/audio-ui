/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import React from "react";
import classNames from "classnames";
import { useThemableProps } from "@/defaults/AudioUiProvider";
import { SvgVerticalSlider, SvgHorizontalSlider } from "./SvgSlider";
import ContinuousControl from "@/primitives/controls/ContinuousControl";
import { useAdaptiveSize } from "@/hooks/useAdaptiveSize";
import { AdaptiveBoxProps, AdaptiveSizeProps, ContinuousControlProps, ThemableProps } from "@/types";
import { clampNormalized } from "@cutoff/audio-ui-core";
import { DEFAULT_ROUNDNESS } from "@cutoff/audio-ui-core";

/**
 * Props for the Slider component (built-in control with theming support)
 */
export type SliderProps = ContinuousControlProps &
    AdaptiveSizeProps &
    AdaptiveBoxProps &
    ThemableProps & {
        /** Orientation of the slider
         * @default 'vertical' */
        orientation?: "horizontal" | "vertical";
        /** Thickness of the slider (normalized 0.0-1.0, maps to 1-50)
         * @default 0.4 */
        thickness?: number;
        /**
         * When true, displays the formatted value as the label instead of the provided label.
         * When false (default), uses the provided label or falls back to the parameter definition's label.
         * @default false
         */
        valueAsLabel?: boolean;
    };

/**
 * A slider component for audio applications.
 * Supports both horizontal and vertical orientations with continuous value adjustment.
 *
 * Features:
 * - Configurable orientation (horizontal or vertical)
 * - Bipolar mode support (centered at zero, grows in both directions)
 * - Customizable thickness and roundness
 * - Full theming support via AudioUiProvider
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
    color,
    roundness,
    thickness = 0.4,
    parameter,
    unit,
    scale,
    paramId,
    interactionMode,
    interactionDirection,
    interactionSensitivity,
    valueAsLabel = false,
    onClick,
    onMouseDown,
    onMouseUp,
    onMouseEnter,
    onMouseLeave,
    className,
    style,
}: SliderProps) {
    const clampedRoundness = roundness !== undefined ? clampNormalized(roundness) : undefined;
    const clampedThickness = clampNormalized(thickness);
    const { resolvedColor, resolvedRoundness } = useThemableProps(
        { color, roundness: clampedRoundness },
        { color: undefined, roundness: DEFAULT_ROUNDNESS }
    );

    const { sizeClassName, sizeStyle } = useAdaptiveSize(adaptiveSize, size, "slider", orientation);

    const mergedClassName = classNames(sizeClassName, className);

    // Select view component based on orientation (different SVG implementations for optimal rendering)
    const ViewComponent = orientation === "vertical" ? SvgVerticalSlider : SvgHorizontalSlider;

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
            className={mergedClassName}
            style={{ ...sizeStyle, ...style }}
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
            interactionMode={interactionMode}
            interactionDirection={interactionDirection}
            interactionSensitivity={interactionSensitivity}
            valueFormatter={valueFormatter}
            valueAsLabel={valueAsLabel}
            view={ViewComponent}
            viewProps={{
                color: resolvedColor,
                thickness: clampedThickness,
                roundness: resolvedRoundness ?? DEFAULT_ROUNDNESS,
                bipolar: bipolar,
            }}
        />
    );
}

export default React.memo(Slider);
