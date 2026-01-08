/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import React, { useMemo, useCallback } from "react";
import classNames from "classnames";
import { CLASSNAMES } from "@cutoff/audio-ui-core";
import { AdaptiveBoxProps, BooleanControlProps, ControlComponent } from "@/types";
import AdaptiveBox from "../AdaptiveBox";
import { useAudioParameter } from "@/hooks/useAudioParameter";
import { useBooleanInteraction } from "@/hooks/useBooleanInteraction";
import { useBooleanParameterResolution } from "@/hooks/useBooleanParameterResolution";

export type BooleanControlComponentProps<P extends object = Record<string, unknown>> =
    // Base Control Props (includes all BooleanControlProps)
    BooleanControlProps &
        // Layout props that configure AdaptiveBox behavior
        AdaptiveBoxProps & {
            /**
             * The Visualization Component.
             * Must adhere to ControlComponent contract.
             */
            view: ControlComponent<P>;

            /**
             * Props specific to the Visualization Component.
             */
            viewProps: P;

            /**
             * Content overlay (HTML) rendered over the SVG (e.g. text value, icons).
             * Rendered via AdaptiveBox.HtmlOverlay to avoid foreignObject issues.
             */
            htmlOverlay?: React.ReactNode;
        };

/**
 * A Generic Boolean Control that connects a Data Model (BooleanParameter)
 * to a Visualization View (ControlComponent).
 *
 * This component handles parameter resolution, value management, interaction handling,
 * and layout management for boolean controls (Button, Toggle, etc.).
 *
 * Supports two modes of operation:
 * 1. Strict Mode (Parameter only): Model provided via parameter prop.
 * 2. Ad-Hoc Mode (Props only): Model created from individual props (label, latch, etc.).
 *
 * @param props - Component props including parameter configuration, view component, and layout options
 * @returns Rendered boolean control component
 *
 * @example
 * ```tsx
 * <BooleanControl
 *   value={isOn}
 *   onChange={(e) => setIsOn(e.value)}
 *   view={ButtonView}
 *   viewProps={{ color: "blue", roundness: 0.3 }}
 * />
 * ```
 */
export function BooleanControl<P extends object = Record<string, unknown>>(props: BooleanControlComponentProps<P>) {
    const {
        view: View,
        viewProps,
        htmlOverlay,
        value,
        onChange,
        label,
        paramId,
        parameter,
        latch,
        displayMode,
        labelMode,
        labelPosition,
        labelAlign,
        className,
        style,
        onClick,
        onMouseDown,
        onMouseUp,
        onMouseEnter,
        onMouseLeave,
    } = props;

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
        handleMouseDown,
        handleMouseUp,
        handleMouseEnter,
        handleMouseLeave,
        handleTouchStart,
        handleTouchEnd,
        handleKeyDown,
        handleKeyUp,
    } = useBooleanInteraction({
        value,
        mode: derivedParameter.mode ?? (latch ? "toggle" : "momentary"),
        onValueChange: fireChange,
        disabled: !onChange,
        onMouseDown,
        onMouseUp,
        onKeyDown: undefined, // BooleanControl doesn't have onKeyDown prop, only uses hook handler
        onKeyUp: undefined, // BooleanControl doesn't have onKeyUp prop, only uses hook handler
    });

    const effectiveLabel = label ?? derivedParameter.name;

    const componentClassNames = useMemo(() => {
        return classNames(className, CLASSNAMES.root, CLASSNAMES.container);
    }, [className]);

    const svgClassNames = useMemo(() => {
        return onChange || onClick ? CLASSNAMES.highlight : "";
    }, [onChange, onClick]);

    // Add pointer cursor when interactive (onChange or onClick)
    // Add touchAction: "none" to prevent default touch behaviors (scrolling/zooming)
    const svgStyle = useMemo(
        () => ({
            ...(onClick || onChange ? { cursor: "pointer" as const } : {}),
            touchAction: "none" as const,
        }),
        [onClick, onChange]
    );

    return (
        <AdaptiveBox
            displayMode={displayMode ?? "scaleToFit"}
            labelMode={labelMode}
            className={componentClassNames}
            style={style}
            labelHeightUnits={View.labelHeightUnits ?? 20}
            viewBoxWidth={View.viewBox.width}
            viewBoxHeight={View.viewBox.height}
        >
            <AdaptiveBox.Svg
                className={svgClassNames}
                style={svgStyle}
                onClick={onClick}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseEnter={(e) => {
                    handleMouseEnter(e);
                    onMouseEnter?.(e);
                }}
                onMouseLeave={(e) => {
                    handleMouseLeave(e);
                    onMouseLeave?.(e);
                }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
                tabIndex={0}
                role="button"
                aria-pressed={value}
                aria-label={effectiveLabel}
            >
                <View normalizedValue={normalizedValue} {...viewProps} />
            </AdaptiveBox.Svg>
            {htmlOverlay && <AdaptiveBox.HtmlOverlay>{htmlOverlay}</AdaptiveBox.HtmlOverlay>}
            {effectiveLabel && (
                <AdaptiveBox.Label position={labelPosition} align={labelAlign ?? "center"}>
                    {effectiveLabel}
                </AdaptiveBox.Label>
            )}
        </AdaptiveBox>
    );
}

export default React.memo(BooleanControl) as typeof BooleanControl;
