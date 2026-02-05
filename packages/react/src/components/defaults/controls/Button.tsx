/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import React from "react";
import classNames from "classnames";
import { AdaptiveBoxProps, AdaptiveSizeProps, BooleanControlProps, ThemableProps } from "@/types";
import ButtonView from "./ButtonView";
import BooleanControl from "@/primitives/controls/BooleanControl";
import { useAdaptiveSize } from "@/hooks/useAdaptiveSize";
import { useThemableProps } from "@/hooks/useThemableProps";

/**
 * Props for the Button component (built-in control with theming support)
 */
export type ButtonProps = BooleanControlProps & AdaptiveSizeProps & AdaptiveBoxProps & ThemableProps;

/**
 * A button component for audio applications.
 *
 * Supports both toggle (latch) and momentary modes, with proper handling of
 * global mouse events for momentary buttons to ensure reliable release behavior
 * even when the mouse is dragged outside the button before release.
 *
 * Supports two modes of operation:
 * 1. Strict Mode (Parameter only): Model provided via parameter prop.
 * 2. Ad-Hoc Mode (Props only): Model created from individual props (label, latch, etc.).
 *
 * @param props - Component props
 * @returns Rendered Button component
 *
 * @example
 * ```tsx
 * // Ad-Hoc Mode - Toggle button
 * <Button
 *   label="Power"
 *   latch={true}
 *   value={isOn}
 *   onChange={(e) => setIsOn(e.value)}
 * />
 *
 * // Ad-Hoc Mode - Momentary button
 * <Button
 *   label="Record"
 *   latch={false}
 *   value={isRecording}
 *   onChange={(e) => setIsRecording(e.value)}
 * />
 *
 * // Strict Mode with parameter
 * <Button
 *   parameter={powerParam}
 *   value={isOn}
 *   onChange={(e) => setIsOn(e.value)}
 * />
 * ```
 */
function Button({
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
    parameter,
    paramId,
    midiResolution,
    color,
    roundness,
    onClick,
    onMouseDown,
    onMouseUp,
    onMouseEnter,
    onMouseLeave,
    className,
    style,
}: ButtonProps) {
    const { style: themableStyle } = useThemableProps({
        color,
        roundness,
        style,
    });
    const { sizeClassName, sizeStyle: adaptiveSizeStyle } = useAdaptiveSize(adaptiveSize, size, "button");

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
            style={{ ...adaptiveSizeStyle, ...themableStyle }}
            parameter={parameter}
            paramId={paramId}
            latch={latch}
            midiResolution={midiResolution}
            onClick={onClick}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            view={ButtonView}
            viewProps={{
                threshold: 0.5,
                roundness: roundness ?? "var(--audioui-roundness-button)",
                color: color ?? "var(--audioui-primary-color)",
            }}
        />
    );
}

export default React.memo(Button);
