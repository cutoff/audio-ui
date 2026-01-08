/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import React, { useCallback, useMemo } from "react";
import classNames from "classnames";
import AdaptiveBox from "@/primitives/AdaptiveBox";
import "@cutoff/audio-ui-core/styles.css";
import { CLASSNAMES, clampNormalized, DEFAULT_ROUNDNESS } from "@cutoff/audio-ui-core";
import { AdaptiveBoxProps, AdaptiveSizeProps, BooleanControlProps, ThemableProps } from "@/types";
import { useThemableProps } from "@/defaults/AudioUiProvider";
import ButtonView from "./ButtonView";
import { useAudioParameter } from "@/hooks/useAudioParameter";
import { useAdaptiveSize } from "@/hooks/useAdaptiveSize";
import { useBooleanParameterResolution } from "@/hooks/useBooleanParameterResolution";
import { useBooleanInteraction } from "@/hooks/useBooleanInteraction";

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
    parameter,
    paramId,
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
    const clampedRoundness = roundness !== undefined ? clampNormalized(roundness) : undefined;
    const { resolvedColor, resolvedRoundness } = useThemableProps(
        { color, roundness: clampedRoundness },
        { color: undefined, roundness: DEFAULT_ROUNDNESS }
    );

    const { derivedParameter } = useBooleanParameterResolution({
        parameter,
        paramId,
        label,
        latch,
    });

    const { normalizedValue, converter } = useAudioParameter(value, onChange, derivedParameter);

    const fireChange = useCallback(
        (newValue: boolean) => {
            if (!onChange) return;
            const normalized = converter.normalize(newValue);
            const midi = converter.toMidi(newValue);
            onChange({
                value: newValue,
                normalizedValue: normalized,
                midiValue: midi,
                parameter: derivedParameter,
            });
        },
        [onChange, converter, derivedParameter]
    );

    const {
        handleMouseDown: handleBooleanMouseDown,
        handleMouseUp: handleBooleanMouseUp,
        handleKeyDown: handleBooleanKeyDown,
        handleKeyUp: handleBooleanKeyUp,
    } = useBooleanInteraction({
        value,
        mode: derivedParameter.mode ?? (latch ? "toggle" : "momentary"),
        onValueChange: fireChange,
        disabled: !onChange,
    });

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            onMouseDown?.(e);
            if (!e.defaultPrevented) {
                handleBooleanMouseDown(e);
            }
        },
        [onMouseDown, handleBooleanMouseDown]
    );

    const handleMouseUp = useCallback(
        (e: React.MouseEvent) => {
            onMouseUp?.(e);
            if (!e.defaultPrevented) {
                handleBooleanMouseUp(e);
            }
        },
        [onMouseUp, handleBooleanMouseUp]
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (!e.defaultPrevented) {
                handleBooleanKeyDown(e);
            }
        },
        [handleBooleanKeyDown]
    );

    const handleKeyUp = useCallback(
        (e: React.KeyboardEvent) => {
            if (!e.defaultPrevented) {
                handleBooleanKeyUp(e);
            }
        },
        [handleBooleanKeyUp]
    );

    const { sizeClassName, sizeStyle } = useAdaptiveSize(adaptiveSize, size, "button");

    const componentClassNames = useMemo(() => {
        return classNames(sizeClassName, CLASSNAMES.root, CLASSNAMES.container, className);
    }, [sizeClassName, className]);

    const svgClassNames = useMemo(() => {
        return onChange || onClick ? CLASSNAMES.highlight : "";
    }, [onChange, onClick]);

    const effectiveLabel = label ?? (parameter ? derivedParameter.name : undefined);

    const isInteractive = !!(onChange || onClick);

    return (
        <AdaptiveBox
            displayMode={displayMode ?? "scaleToFit"}
            labelMode={labelMode}
            className={componentClassNames}
            style={{ ...sizeStyle, ...style }}
            labelHeightUnits={30}
            viewBoxWidth={ButtonView.viewBox.width}
            viewBoxHeight={ButtonView.viewBox.height}
            minWidth={20}
            minHeight={40}
        >
            <AdaptiveBox.Svg
                className={svgClassNames}
                onClick={onClick}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                tabIndex={0}
                role="button"
                aria-pressed={value}
                aria-label={effectiveLabel}
                style={{
                    cursor: isInteractive ? "pointer" : "default",
                }}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
            >
                <ButtonView
                    normalizedValue={normalizedValue}
                    threshold={0.5}
                    roundness={resolvedRoundness ?? DEFAULT_ROUNDNESS}
                    color={resolvedColor}
                />
            </AdaptiveBox.Svg>
            {effectiveLabel && (
                <AdaptiveBox.Label position={labelPosition} align={labelAlign ?? "center"}>
                    {effectiveLabel}
                </AdaptiveBox.Label>
            )}
        </AdaptiveBox>
    );
}

export default React.memo(Button);
