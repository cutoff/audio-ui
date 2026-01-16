/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import React from "react";
import classNames from "classnames";
import BooleanControl from "@/primitives/controls/BooleanControl";
import ImageView from "./ImageView";
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
    /** Radius for the image (typically min(frameWidth, frameHeight) / 2) */
    radius: number;
    /** URL to the image for false/off state */
    imageHrefFalse: string;
    /** URL to the image for true/on state */
    imageHrefTrue: string;
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
 * - `false` (normalized 0.0) displays `imageHrefFalse`
 * - `true` (normalized 1.0) displays `imageHrefTrue`
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
 *   radius={45}
 *   imageHrefFalse="/star-off.png"
 *   imageHrefTrue="/star-on.png"
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
    frameWidth,
    frameHeight,
    radius,
    imageHrefFalse,
    imageHrefTrue,
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
    const { sizeClassName, sizeStyle } = useAdaptiveSize(adaptiveSize, size, "button");

    return (
        <BooleanControl
            value={value}
            onChange={onChange}
            label={label}
            displayMode={displayMode}
            labelMode={labelMode}
            labelPosition={labelPosition}
            labelAlign={labelAlign}
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
            view={ImageView}
            viewProps={{
                frameWidth,
                frameHeight,
                radius,
                imageHrefFalse,
                imageHrefTrue,
            }}
        />
    );
}

export default React.memo(ImageSwitch);
