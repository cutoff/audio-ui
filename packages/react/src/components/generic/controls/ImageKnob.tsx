/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import React from "react";
import classNames from "classnames";
import ContinuousControl from "@/primitives/controls/ContinuousControl";
import ImageRotarySwitchView from "./ImageRotarySwitchView";
import { AdaptiveBoxProps, AdaptiveSizeProps, ContinuousControlProps, ValueLabelMode } from "@/types";
import { useAdaptiveSize } from "@/hooks/useAdaptiveSize";

/**
 * Props specific to rotary image controls
 */
export type RotaryImageProps = {
    /** Width of the viewBox (determines viewBox width) */
    frameWidth: number;
    /** Height of the viewBox (determines viewBox height) */
    frameHeight: number;
    /** URL to the image to rotate */
    imageHref: string;
    /** Optional rotation angle offset in degrees (default: 0) */
    rotation?: number;
    /** Openness of the arc in degrees (value between 0-360º; 0º: closed; 90º: 3/4 open; 180º: half-circle;)
     * @default 90
     */
    openness?: number;
};

/**
 * Props for the ImageKnob component
 */
export type ImageKnobProps = ContinuousControlProps &
    AdaptiveSizeProps &
    AdaptiveBoxProps &
    RotaryImageProps & {
        /**
         * Controls how the label and value are displayed.
         * - "labelOnly": Always shows the label (default)
         * - "valueOnly": Always shows the value
         * - "interactive": Shows label normally, but temporarily swaps to value during interaction
         * @default "labelOnly"
         */
        valueAsLabel?: ValueLabelMode;
    };

/**
 * A continuous control that rotates an image based on a normalized value.
 *
 * This component provides full access to all library features:
 *
 * - Complete layout system: AdaptiveBox with all sizing modes, label positioning, alignment
 * - Full parameter model: AudioParameter with min/max ranges, scaling functions, units, formatting
 * - Complete interaction system: Drag, wheel, and keyboard with configurable sensitivity and modes
 * - Full accessibility: ARIA attributes, focus management, keyboard navigation
 *
 * The image rotation is determined by the normalized value (0-1 maps to rotation based on openness and rotation offset).
 *
 * Supports two modes of operation:
 * 1. Parameter model mode: Provide `parameter` (ContinuousParameter) - all range/label info comes from the model
 * 2. Ad-hoc mode: Provide `min`, `max`, `step`, `label` directly as props
 *
 * Note: This component does NOT support themable props (color, roundness, thickness) as
 * visuals are entirely determined by the image content.
 *
 * @param props - Component props
 * @returns Rendered ImageKnob component
 *
 * @example
 * ```tsx
 * <ImageKnob
 *   value={50}
 *   min={0}
 *   max={100}
 *   label="Volume"
 *   frameWidth={100}
 *   frameHeight={100}
 *   imageHref="/knob-image.png"
 *   openness={90}
 *   rotation={0}
 * />
 * ```
 */
function ImageKnob({
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
    imageHref,
    rotation = 0,
    openness = 90,
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
}: ImageKnobProps) {
    const { sizeClassName, sizeStyle: adaptiveSizeStyle } = useAdaptiveSize(adaptiveSize, size, "knob");

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
            viewBoxWidthUnits={frameWidth}
            viewBoxHeightUnits={frameHeight}
            view={ImageRotarySwitchView}
            viewProps={{
                frameWidth,
                frameHeight,
                imageHref,
                rotation,
                openness,
                bipolar,
            }}
        />
    );
}

export default React.memo(ImageKnob);
