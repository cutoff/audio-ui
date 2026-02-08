/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import React from "react";
import classNames from "classnames";
import BooleanControl from "@/primitives/controls/BooleanControl";
import ImageSwitchView from "./ImageSwitchView";
import { AdaptiveBoxProps, AdaptiveSizeProps, BooleanControlProps } from "@/types";
import { useAdaptiveSize } from "@/hooks/useAdaptiveSize";

/**
 * Props specific to image switch controls
 */
export type ImageSwitchProps = {
    /** Width of the viewBox (determines viewBox width) */
    frameWidth: number;
    /** Height of the viewBox (determines viewBox height) */
    frameHeight: number;
    /** URL to the image for false/off state */
    imageHrefFalse: string;
    /** URL to the image for true/on state */
    imageHrefTrue: string;
    /** Optional dark mode image URL for false/off state */
    imageHrefFalseDark?: string;
    /** Optional dark mode image URL for true/on state */
    imageHrefTrueDark?: string;
};

/**
 * Props for the ImageSwitch component
 */
export type ImageSwitchComponentProps = BooleanControlProps & AdaptiveSizeProps & AdaptiveBoxProps & ImageSwitchProps;

/**
 * A boolean control that displays one of two images based on the boolean value.
 *
 * This component provides full access to all library features:
 *
 * - Complete layout system: AdaptiveBox with all sizing modes, label positioning, alignment
 * - Full parameter model: BooleanParameter with latch/momentary modes
 * - Complete interaction system: Click, drag-in/drag-out, and keyboard interactions
 * - Full accessibility: ARIA attributes, focus management, keyboard navigation
 *
 * The image displayed is determined by the boolean value:
 * - `false` (normalized 0.0) displays `imageHrefFalse` (or `imageHrefFalseDark` in dark mode)
 * - `true` (normalized 1.0) displays `imageHrefTrue` (or `imageHrefTrueDark` in dark mode)
 *
 * Supports optional dark mode images. When provided, CSS automatically switches
 * between light and dark images based on the .dark class or prefers-color-scheme.
 *
 * Supports two modes of operation:
 * 1. Strict Mode (Parameter only): Model provided via parameter prop.
 * 2. Ad-Hoc Mode (Props only): Model created from individual props (label, latch, etc.).
 *
 * Note: This component does NOT support themable props (color, roundness, thickness) as
 * visuals are entirely determined by the image content.
 *
 * @param props - Component props
 * @returns Rendered ImageSwitch component
 *
 * @example
 * ```tsx
 * <ImageSwitch
 *   value={isFavorite}
 *   onChange={(e) => setIsFavorite(e.value)}
 *   label="Favorite"
 *   latch={true}
 *   frameWidth={100}
 *   frameHeight={100}
 *   imageHrefFalse="/star-off.png"
 *   imageHrefTrue="/star-on.png"
 *   imageHrefFalseDark="/star-off-dark.png"
 *   imageHrefTrueDark="/star-on-dark.png"
 * />
 * ```
 */
function ImageSwitch({
    latch = false,
    value = false,
    onChange,
    label,
    adaptiveSize = false,
    size = "normal",
    displayMode,
    labelMode,
    labelPosition,
    labelAlign,
    labelOverflow,
    labelHeightUnits,
    frameWidth,
    frameHeight,
    imageHrefFalse,
    imageHrefTrue,
    imageHrefFalseDark,
    imageHrefTrueDark,
    parameter,
    paramId,
    midiResolution,
    onClick,
    onMouseDown,
    onMouseUp,
    onMouseEnter,
    onMouseLeave,
    className,
    style,
}: ImageSwitchComponentProps) {
    const { sizeClassName, sizeStyle } = useAdaptiveSize(adaptiveSize, size, "square");

    return (
        <BooleanControl
            value={value}
            onChange={onChange}
            label={label}
            displayMode={displayMode}
            labelMode={labelMode}
            labelPosition={labelPosition}
            labelAlign={labelAlign}
            labelOverflow={labelOverflow}
            labelHeightUnits={labelHeightUnits}
            className={classNames(sizeClassName, className)}
            style={{ ...sizeStyle, ...style }}
            parameter={parameter}
            paramId={paramId}
            latch={latch}
            midiResolution={midiResolution}
            onClick={onClick}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            viewBoxWidthUnits={frameWidth}
            viewBoxHeightUnits={frameHeight}
            view={ImageSwitchView}
            viewProps={{
                frameWidth,
                frameHeight,
                imageHrefFalse,
                imageHrefTrue,
                imageHrefFalseDark,
                imageHrefTrueDark,
            }}
        />
    );
}

export default React.memo(ImageSwitch);
