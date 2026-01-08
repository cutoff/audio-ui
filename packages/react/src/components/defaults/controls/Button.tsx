/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";
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

    // Track press state for momentary buttons (needed for global mouseup handling)
    // When a momentary button is pressed, we need to detect mouseup events even if
    // they occur outside the button (e.g., user drags mouse away before releasing)
    const isPressedRef = useRef(false);

    const handleInternalMouseDown = useCallback(
        (_e: React.MouseEvent) => {
            if (onChange) {
                if (derivedParameter.mode === "toggle") {
                    // Toggle mode: flip the value on each press
                    fireChange(!value);
                } else {
                    // Momentary mode: set to true on press, will be set to false on release
                    isPressedRef.current = true;
                    fireChange(true);
                }
            }
        },
        [onChange, derivedParameter.mode, value, fireChange]
    );

    const handleInternalMouseUp = useCallback(
        (_e: React.MouseEvent) => {
            // Only handle release for momentary buttons that are currently pressed
            // This prevents false releases if the button wasn't actually pressed
            if (onChange && derivedParameter.mode === "momentary" && isPressedRef.current) {
                isPressedRef.current = false;
                fireChange(false);
            }
        },
        [onChange, derivedParameter.mode, fireChange]
    );

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            onMouseDown?.(e);
            if (!e.defaultPrevented) {
                handleInternalMouseDown(e);
            }
        },
        [onMouseDown, handleInternalMouseDown]
    );

    const handleMouseUp = useCallback(
        (e: React.MouseEvent) => {
            onMouseUp?.(e);
            if (!e.defaultPrevented) {
                handleInternalMouseUp(e);
            }
        },
        [onMouseUp, handleInternalMouseUp]
    );

    // Global mouseup handler for momentary buttons
    // This ensures the button releases even if the mouse is moved outside the button
    // before the mouse button is released (common in audio applications)
    const handleGlobalMouseUp = useCallback(() => {
        if (isPressedRef.current) {
            isPressedRef.current = false;
            fireChange(false);
        }
    }, [fireChange]);

    // Attach global mouseup listener for momentary buttons
    // This is necessary because users may drag the mouse outside the button before releasing
    useEffect(() => {
        if (derivedParameter.mode === "momentary" && onChange) {
            window.addEventListener("mouseup", handleGlobalMouseUp);
            return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
        }
        return undefined;
    }, [derivedParameter.mode, onChange, handleGlobalMouseUp]);

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
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        if (onChange) {
                            fireChange(latch ? !value : true);
                        }
                    }
                }}
                onKeyUp={(e) => {
                    if (!latch && onChange && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        fireChange(false);
                    }
                }}
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
