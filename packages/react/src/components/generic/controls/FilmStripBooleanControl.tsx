/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import React, { useMemo } from "react";
import classNames from "classnames";
import BooleanControl from "@/primitives/controls/BooleanControl";
import { createFilmstripView } from "./FilmstripView";
import { AdaptiveBoxProps, AdaptiveSizeProps, BooleanControlProps } from "@/types";
import { useAdaptiveSize } from "@/hooks/useAdaptiveSize";
import { FilmstripProps } from "./FilmStripContinuousControl";

/**
 * Props for the FilmStripBooleanControl component
 */
export type FilmStripBooleanControlProps = BooleanControlProps &
    AdaptiveSizeProps &
    AdaptiveBoxProps &
    FilmstripProps & {
        /**
         * If true, inverts the normalized value passed to the view (0.0 -> 1.0 and 1.0 -> 0.0).
         * Useful for filmstrips where frame 0 represents "on" and frame 1 represents "off".
         * @default false
         */
        invertValue?: boolean;
    };

/**
 * A boolean control that displays frames from a filmstrip sprite sheet.
 *
 * This component supports the widely-used industry standard for control representation:
 * bitmap sprite sheets (filmstrips). While bitmap-based visualization is more constrained
 * than SVG (no dynamic theming, fixed visual appearance), this component provides full
 * access to all library features:
 *
 * - Complete layout system: AdaptiveBox with all sizing modes, label positioning, alignment
 * - Full parameter model: BooleanParameter with latch/momentary modes
 * - Complete interaction system: Click, drag-in/drag-out, and keyboard interactions
 * - Full accessibility: ARIA attributes, focus management, keyboard navigation
 *
 * Typically uses 2 frames: frame 0 for false/off, frame 1 for true/on.
 *
 * Supports two modes of operation:
 * 1. Strict Mode (Parameter only): Model provided via parameter prop.
 * 2. Ad-Hoc Mode (Props only): Model created from individual props (label, latch, etc.).
 *
 * Note: This component does NOT support themable props (color, roundness, thickness) as
 * visuals are entirely determined by the image content.
 *
 * @param props - Component props
 * @returns Rendered FilmStripBooleanControl component
 *
 * @example
 * ```tsx
 * <FilmStripBooleanControl
 *   value={isOn}
 *   onChange={(e) => setIsOn(e.value)}
 *   label="Power"
 *   latch={true}
 *   frameWidth={100}
 *   frameHeight={100}
 *   frameCount={2}
 *   imageHref="/button-frames.png"
 * />
 * ```
 */
function FilmStripBooleanControl({
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
    frameCount,
    imageHref,
    orientation = "vertical",
    frameRotation = 0,
    invertValue = false,
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
}: FilmStripBooleanControlProps) {
    const { sizeClassName, sizeStyle } = useAdaptiveSize(adaptiveSize, size, "button");

    // Create the filmstrip view component with invertValue support
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
                undefined, // Boolean controls don't support interaction mode/direction
                undefined
            ),
        [frameWidth, frameHeight, frameCount, imageHref, orientation, frameRotation, invertValue]
    );

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
            view={ViewComponent}
            viewProps={{}}
        />
    );
}

export default React.memo(FilmStripBooleanControl);
