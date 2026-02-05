/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import React from "react";
import classNames from "classnames";
import DiscreteControl from "@/primitives/controls/DiscreteControl";
import FilmstripView from "./FilmstripView";
import { AdaptiveBoxProps, AdaptiveSizeProps, DiscreteControlProps } from "@/types";
import { useAdaptiveSize } from "@/hooks/useAdaptiveSize";
import { FilmstripProps } from "./FilmStripContinuousControl";

/**
 * Props for the FilmStripDiscreteControl component
 */
export type FilmStripDiscreteControlProps = DiscreteControlProps &
    AdaptiveSizeProps &
    AdaptiveBoxProps &
    FilmstripProps;

/**
 * A discrete control that displays frames from a filmstrip sprite sheet.
 *
 * This component supports the widely-used current industry standard for control representation:
 * bitmap sprite sheets (filmstrips). While bitmap-based visualization is more constrained
 * than SVG (no dynamic theming, fixed visual appearance), this component provides full
 * access to all library features:
 *
 * - Complete layout system: AdaptiveBox with all sizing modes, label positioning, alignment
 * - Full parameter model: DiscreteParameter with options, labels, value mapping
 * - Complete interaction system: Click and keyboard interactions for cycling/stepping
 * - Full accessibility: ARIA attributes, focus management, keyboard navigation
 *
 * The frame displayed is determined by mapping the current value to a frame index.
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
 * @returns Rendered FilmStripDiscreteControl component
 *
 * @example
 * ```tsx
 * <FilmStripDiscreteControl
 *   value="sine"
 *   onChange={(e) => setValue(e.value)}
 *   frameWidth={100}
 *   frameHeight={100}
 *   frameCount={4}
 *   imageHref="/waveform-frames.png"
 * >
 *   <Option value="sine">Sine</Option>
 *   <Option value="square">Square</Option>
 *   <Option value="triangle">Triangle</Option>
 *   <Option value="sawtooth">Sawtooth</Option>
 * </FilmStripDiscreteControl>
 * ```
 */
function FilmStripDiscreteControl({
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
    frameCount,
    imageHref,
    orientation = "vertical",
    frameRotation = 0,
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
}: FilmStripDiscreteControlProps) {
    const { sizeClassName, sizeStyle } = useAdaptiveSize(adaptiveSize, size, "square");

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
            view={FilmstripView}
            viewProps={{
                frameWidth,
                frameHeight,
                frameCount,
                imageHref,
                orientation,
                frameRotation,
            }}
        >
            {children}
        </DiscreteControl>
    );
}

export default React.memo(FilmStripDiscreteControl);
