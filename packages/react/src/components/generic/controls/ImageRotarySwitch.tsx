/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import React, { useMemo } from "react";
import classNames from "classnames";
import DiscreteControl from "@/primitives/controls/DiscreteControl";
import ImageKnobView from "./ImageKnobView";
import { AdaptiveBoxProps, AdaptiveSizeProps, DiscreteControlProps } from "@/types";
import { useAdaptiveSize } from "@/hooks/useAdaptiveSize";
import { useDiscreteParameterResolution } from "@/hooks/useDiscreteParameterResolution";
import { RotaryImageProps } from "./ImageKnob";

/**
 * Props for the ImageRotarySwitch component
 */
export type ImageRotarySwitchProps = DiscreteControlProps & AdaptiveSizeProps & AdaptiveBoxProps & RotaryImageProps;

/**
 * A discrete control that rotates an image based on discrete option values.
 *
 * This component provides full access to all library features:
 *
 * - Complete layout system: AdaptiveBox with all sizing modes, label positioning, alignment
 * - Full parameter model: DiscreteParameter with options, labels, value mapping
 * - Complete interaction system: Click and keyboard interactions for cycling/stepping
 * - Full accessibility: ARIA attributes, focus management, keyboard navigation
 *
 * The image rotation is determined by mapping the current value to a normalized position,
 * with snapping to discrete positions based on the number of options.
 *
 * Supports optional dark mode images via imageDarkHref. When provided, CSS automatically
 * switches between light and dark images based on the .dark class or prefers-color-scheme.
 *
 * Supports three modes of operation:
 * 1. Ad-Hoc Mode (Children only): Model inferred from OptionView children.
 * 2. Strict Mode (Parameter only): Model provided via parameter prop. View via renderOption.
 * 3. Hybrid Mode (Parameter + Children): Model from parameter, View from children (matched by value).
 *
 * Note: This component does NOT support themable props (color, roundness, thickness) as
 * visuals are entirely determined by the image content.
 *
 * @param props - Component props
 * @returns Rendered ImageRotarySwitch component
 *
 * @example
 * ```tsx
 * <ImageRotarySwitch
 *   value="sine"
 *   onChange={(e) => setValue(e.value)}
 *   frameWidth={100}
 *   frameHeight={100}
 *   imageHref="/waveform-knob.png"
 *   imageDarkHref="/waveform-knob-dark.png"
 *   openness={90}
 *   rotation={0}
 * >
 *   <Option value="sine">Sine</Option>
 *   <Option value="square">Square</Option>
 *   <Option value="triangle">Triangle</Option>
 *   <Option value="sawtooth">Sawtooth</Option>
 * </ImageRotarySwitch>
 * ```
 */
function ImageRotarySwitch({
    value,
    defaultValue,
    onChange,
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
    imageDarkHref,
    rotation = 0,
    openness = 90,
    parameter,
    paramId,
    options,
    midiResolution,
    midiMapping,
    children,
    onClick,
    onMouseDown,
    onMouseUp,
    onMouseEnter,
    onMouseLeave,
    className,
    style,
}: ImageRotarySwitchProps) {
    const { sizeClassName, sizeStyle } = useAdaptiveSize(adaptiveSize, size, "square");

    // Get derivedParameter to determine the number of options for positions
    const { derivedParameter } = useDiscreteParameterResolution({
        children,
        options,
        paramId,
        parameter,
        defaultValue,
        label,
        midiResolution,
        midiMapping,
    });

    // Calculate positions from the number of options
    const positions = useMemo(() => derivedParameter.options.length, [derivedParameter.options.length]);

    return (
        <DiscreteControl
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            label={label}
            paramId={paramId}
            parameter={parameter}
            options={options}
            midiResolution={midiResolution}
            midiMapping={midiMapping}
            displayMode={displayMode}
            labelMode={labelMode}
            labelPosition={labelPosition}
            labelAlign={labelAlign}
            className={classNames(sizeClassName, className)}
            style={{ ...sizeStyle, ...style }}
            onClick={onClick}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            viewBoxWidthUnits={frameWidth}
            viewBoxHeightUnits={frameHeight}
            view={ImageKnobView}
            viewProps={{
                frameWidth,
                frameHeight,
                imageHref,
                imageDarkHref,
                rotation,
                openness,
                positions,
            }}
        >
            {children}
        </DiscreteControl>
    );
}

export default React.memo(ImageRotarySwitch);
