/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import React, { useMemo } from "react";
import classNames from "classnames";
import ContinuousControl from "@/primitives/controls/ContinuousControl";
import { createFilmstripView } from "./FilmstripView";
import { AdaptiveBoxProps, AdaptiveSizeProps, ContinuousControlProps, ValueLabelMode } from "@/types";
import { useAdaptiveSize } from "@/hooks/useAdaptiveSize";

/**
 * Props specific to filmstrip controls
 */
export type FilmstripProps = {
    /** Width of a SINGLE frame in the filmstrip */
    frameWidth: number;
    /** Height of a SINGLE frame in the filmstrip */
    frameHeight: number;
    /** Total number of frames in the strip */
    frameCount: number;
    /** URL to the sprite sheet/filmstrip image */
    imageHref: string;
    /** Orientation of the strip (default: "vertical") */
    orientation?: "vertical" | "horizontal";
    /** Optional frame rotation in degrees (default: 0) */
    frameRotation?: number;
};

/**
 * Props for the FilmStripContinuousControl component
 */
export type FilmStripContinuousControlProps = ContinuousControlProps &
    AdaptiveSizeProps &
    AdaptiveBoxProps &
    FilmstripProps & {
        /**
         * Controls how the label and value are displayed.
         * - "labelOnly": Always shows the label (default)
         * - "valueOnly": Always shows the value
         * - "interactive": Shows label normally, but temporarily swaps to value during interaction
         * @default "labelOnly"
         */
        valueAsLabel?: ValueLabelMode;
        /**
         * If true, inverts the normalized value (0.0 -> 1.0 and 1.0 -> 0.0).
         * Useful for filmstrips where frame 0 represents the maximum value and frame N represents the minimum value.
         * @default false
         */
        invertValue?: boolean;
    };

/**
 * A continuous control that displays frames from a filmstrip sprite sheet.
 *
 * This component supports the widely-used industry standard for control representation:
 * bitmap sprite sheets (filmstrips). While bitmap-based visualization is more constrained
 * than SVG (no dynamic theming, fixed visual appearance), this component provides full
 * access to all library features:
 *
 * - Complete layout system: AdaptiveBox with all sizing modes, label positioning, alignment
 * - Full parameter model: AudioParameter with min/max ranges, scaling functions, units, formatting
 * - Complete interaction system: Drag, wheel, and keyboard with configurable sensitivity and modes
 * - Full accessibility: ARIA attributes, focus management, keyboard navigation
 *
 * The frame displayed is determined by the normalized value (0-1 maps to frame 0 to frameCount-1).
 *
 * Supports two modes of operation:
 * 1. Parameter model mode: Provide `parameter` (ContinuousParameter) - all range/label info comes from the model
 * 2. Ad-hoc mode: Provide `min`, `max`, `step`, `label` directly as props
 *
 * Note: This component does NOT support themable props (color, roundness, thickness) as
 * visuals are entirely determined by the image content.
 *
 * @param props - Component props
 * @returns Rendered FilmStripContinuousControl component
 *
 * @example
 * ```tsx
 * <FilmStripContinuousControl
 *   value={50}
 *   min={0}
 *   max={100}
 *   label="Volume"
 *   frameWidth={100}
 *   frameHeight={100}
 *   frameCount={64}
 *   imageHref="/knob-frames.png"
 * />
 * ```
 */
function FilmStripContinuousControl({
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
    frameWidth,
    frameHeight,
    frameCount,
    imageHref,
    orientation = "vertical",
    frameRotation = 0,
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
    invertValue = false,
    onClick,
    onMouseDown,
    onMouseUp,
    onMouseEnter,
    onMouseLeave,
    className,
    style,
}: FilmStripContinuousControlProps) {
    const { sizeClassName, sizeStyle: adaptiveSizeStyle } = useAdaptiveSize(adaptiveSize, size, "knob");

    // Create a view component with dynamic viewBox based on frame dimensions
    const ViewComponent = useMemo(
        () =>
            createFilmstripView(
                frameWidth,
                frameHeight,
                frameCount,
                imageHref,
                orientation,
                frameRotation,
                invertValue,
                interactionMode,
                interactionDirection
            ),
        [
            frameWidth,
            frameHeight,
            frameCount,
            imageHref,
            orientation,
            frameRotation,
            invertValue,
            interactionMode,
            interactionDirection,
        ]
    );

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
            className={classNames(sizeClassName, className)}
            style={{ ...adaptiveSizeStyle, ...style }}
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
            view={ViewComponent}
            viewProps={{}}
        />
    );
}

export default React.memo(FilmStripContinuousControl);
