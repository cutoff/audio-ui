/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import React, { useMemo } from "react";
import classNames from "classnames";
import { CLASSNAMES } from "@cutoff/audio-ui-core";
import {
    AdaptiveBoxProps,
    AdaptiveBoxLogicalSizeProps,
    ContinuousControlPrimitiveProps,
    ControlComponent,
    ValueLabelMode,
} from "@/types";
import AdaptiveBox from "../AdaptiveBox";
import { useAudioParameter } from "@/hooks/useAudioParameter";
import { useContinuousInteraction } from "@/hooks/useContinuousInteraction";
import { useContinuousParameterResolution } from "@/hooks/useContinuousParameterResolution";

export type ContinuousControlComponentProps<P extends object = Record<string, unknown>> =
    // Base Control Props (permissive — accepts any combination of value-channel props,
    // with runtime precedence. A strict ContinuousControlProps is assignable to this.)
    ContinuousControlPrimitiveProps &
        // Layout props that configure AdaptiveBox behavior
        AdaptiveBoxProps &
        // Logical size props that override view component defaults
        AdaptiveBoxLogicalSizeProps & {
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
             * Content overlay (HTML) rendered over the SVG (e.g. text value).
             * Rendered via AdaptiveBox.HtmlOverlay to avoid foreignObject issues.
             */
            htmlOverlay?: React.ReactNode;

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
 * A Generic Continuous Control that connects a Data Model (AudioParameter)
 * to a Visualization View (ControlComponent).
 *
 * This component provides a generic wrapper for continuous controls (Knob, Slider, etc.),
 * decoupling behavior (AudioParameter, interaction logic) from visualization (SVG rendering).
 * It handles parameter resolution, normalization, interaction, and layout automatically.
 *
 * Supports double-click to reset to default value when editable (i.e. at least one of
 * `onValueChange`, `onNormalizedValueChange`, or `onMidiValueChange` is provided).
 * The default value is determined by the parameter's `defaultValue` property, or
 * calculated as 0.0 for unipolar or 0.5 for bipolar parameters when not specified.
 *
 * @param props Component props including parameter configuration, view component, and layout props
 * @returns Rendered continuous control with AdaptiveBox layout
 */
export function ContinuousControl<P extends object = Record<string, unknown>>(
    props: ContinuousControlComponentProps<P>
) {
    const {
        view: View,
        viewProps,
        htmlOverlay,
        min,
        max,
        step,
        value,
        normalizedValue: inputNormalizedValue,
        midiValue: inputMidiValue,
        label,
        displayMode,
        labelMode,
        labelPosition,
        labelAlign,
        labelOverflow,
        viewBoxWidthUnits,
        viewBoxHeightUnits,
        labelHeightUnits,
        className,
        style,
        onValueChange,
        onNormalizedValueChange,
        onMidiValueChange,
        paramId,
        onClick,
        onMouseDown,
        onMouseUp,
        onMouseEnter,
        onMouseLeave,
        parameter,
        interactionMode,
        interactionDirection,
        interactionSensitivity,
        unit,
        scale,
        valueFormatter,
        valueAsLabel = "labelOnly",
        midiResolution,
        defaultValue,
        ariaOrientation,
    } = props;

    const editable = !!(onValueChange || onNormalizedValueChange || onMidiValueChange);

    const bipolar = props.bipolar ?? false;
    const { derivedParameter } = useContinuousParameterResolution({
        parameter,
        paramId,
        label,
        min,
        max,
        step,
        bipolar,
        unit,
        scale,
        midiResolution,
        defaultValue,
    });

    // Interaction state for valueAsLabel="interactive"
    const [isDragging, setIsDragging] = React.useState(false);
    const [isRecentlyActive, setIsRecentlyActive] = React.useState(false);
    const activityTimerRef = React.useRef<number | undefined>(undefined);

    const handleDragStart = React.useCallback(() => {
        setIsDragging(true);
        setIsRecentlyActive(true);
        if (activityTimerRef.current) window.clearTimeout(activityTimerRef.current);
    }, []);

    const handleDragEnd = React.useCallback(() => {
        setIsDragging(false);
        // Start decay timer
        if (activityTimerRef.current) window.clearTimeout(activityTimerRef.current);
        activityTimerRef.current = window.setTimeout(() => {
            setIsRecentlyActive(false);
        }, 1000);
    }, []);

    const handleActivity = React.useCallback(() => {
        setIsRecentlyActive(true);
        if (activityTimerRef.current) window.clearTimeout(activityTimerRef.current);
        // If not dragging, start decay immediately (debounce effect)
        if (!isDragging) {
            activityTimerRef.current = window.setTimeout(() => {
                setIsRecentlyActive(false);
            }, 1000);
        }
    }, [isDragging]);

    const showValueAsLabel =
        valueAsLabel === "valueOnly" || (valueAsLabel === "interactive" && (isDragging || isRecentlyActive));

    const { realValue, normalizedValue, adjustValue, effectiveLabel, resetToDefault } = useAudioParameter({
        value,
        normalizedValue: inputNormalizedValue,
        midiValue: inputMidiValue,
        onValueChange,
        onNormalizedValueChange,
        onMidiValueChange,
        parameter: derivedParameter,
        userValueFormatter: valueFormatter,
        userLabel: label,
        valueAsLabel: showValueAsLabel,
    });

    // Wrap adjustValue to trigger activity on changes (wheel, keyboard)
    const wrappedAdjustValue = React.useCallback(
        (delta: number, sensitivity?: number) => {
            if (valueAsLabel === "interactive" && editable) {
                handleActivity();
            }
            adjustValue(delta, sensitivity);
        },
        [adjustValue, valueAsLabel, handleActivity, editable]
    );

    const effectiveInteractionMode = interactionMode ?? View.interaction.mode ?? "both";
    const effectiveDirection = interactionDirection ?? View.interaction.direction ?? "both";

    // Only editable when at least one paired callback is provided.
    const interactiveProps = useContinuousInteraction({
        adjustValue: wrappedAdjustValue,
        interactionMode: effectiveInteractionMode,
        direction: effectiveDirection,
        sensitivity: interactionSensitivity,
        min: derivedParameter.min,
        max: derivedParameter.max,
        paramStep: derivedParameter.step,
        editable,
        resetToDefault: editable ? resetToDefault : undefined,
        onDragStart: valueAsLabel === "interactive" && editable ? handleDragStart : undefined,
        onDragEnd: valueAsLabel === "interactive" && editable ? handleDragEnd : undefined,
        onMouseDown,
        onTouchStart: undefined, // ContinuousControl doesn't have onTouchStart prop
        onWheel: undefined, // ContinuousControl doesn't have onWheel prop
        onKeyDown: undefined, // ContinuousControl doesn't have onKeyDown prop
    });

    const componentClassNames = useMemo(() => {
        return classNames(className, CLASSNAMES.root, CLASSNAMES.container);
    }, [className]);

    const svgClassNames = useMemo(() => {
        return editable || onClick ? CLASSNAMES.highlight : "";
    }, [editable, onClick]);

    // Add clickable cursor when clickable but not draggable (onClick but no editable callback).
    // Uses CSS variable for customizable cursor type.
    const svgStyle = {
        ...(interactiveProps.style ?? {}),
        ...(onClick && !editable ? { cursor: "var(--audioui-cursor-clickable)" as const } : {}),
    };

    return (
        <AdaptiveBox
            displayMode={displayMode ?? "scaleToFit"}
            labelMode={labelMode}
            labelOverflow={labelOverflow}
            className={componentClassNames}
            style={style}
            labelHeightUnits={labelHeightUnits ?? View.labelHeightUnits ?? 20}
            viewBoxWidth={viewBoxWidthUnits ?? View.viewBox.width}
            viewBoxHeight={viewBoxHeightUnits ?? View.viewBox.height}
        >
            <AdaptiveBox.Svg
                className={svgClassNames}
                style={svgStyle}
                onWheel={interactiveProps.onWheel}
                onClick={onClick}
                onMouseDown={interactiveProps.onMouseDown}
                onTouchStart={interactiveProps.onTouchStart}
                onKeyDown={interactiveProps.onKeyDown}
                onDoubleClick={interactiveProps.onDoubleClick}
                onMouseUp={onMouseUp}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                tabIndex={interactiveProps.tabIndex}
                role={interactiveProps.role}
                aria-valuenow={realValue}
                aria-valuemin={derivedParameter.min}
                aria-valuemax={derivedParameter.max}
                aria-label={effectiveLabel}
                aria-disabled={interactiveProps["aria-disabled"]}
                aria-orientation={ariaOrientation}
            >
                <View normalizedValue={normalizedValue} {...viewProps} />
            </AdaptiveBox.Svg>
            {htmlOverlay && <AdaptiveBox.HtmlOverlay>{htmlOverlay}</AdaptiveBox.HtmlOverlay>}
            {effectiveLabel && (
                <AdaptiveBox.Label position={labelPosition} align={labelAlign}>
                    {effectiveLabel}
                </AdaptiveBox.Label>
            )}
        </AdaptiveBox>
    );
}

export default React.memo(ContinuousControl) as typeof ContinuousControl;
