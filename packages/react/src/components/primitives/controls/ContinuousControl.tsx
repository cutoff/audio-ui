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
 * Interactivity is governed by the explicit `editable` (default `true`) and `disabled`
 * (default `false`) props. `editable=false` blocks UI gestures (drag/wheel/keyboard) but
 * keeps the control "alive" — external `value` updates still animate the visuals.
 * `disabled=true` is stronger: it implies non-editable, suppresses all callback firing
 * (including `onClick`), and removes the control from the tab order.
 *
 * Supports double-click to reset to default value when interactive. The default value is
 * determined by the parameter's `defaultValue` property, or calculated as 0.0 for unipolar
 * or 0.5 for bipolar parameters when not specified.
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
        editable = true,
        disabled = false,
    } = props;

    const effectiveEditable = editable && !disabled;
    const gatedOnValueChange = disabled ? undefined : onValueChange;
    const gatedOnNormalizedValueChange = disabled ? undefined : onNormalizedValueChange;
    const gatedOnMidiValueChange = disabled ? undefined : onMidiValueChange;
    const gatedOnClick = disabled ? undefined : onClick;
    // Gestures only have a visible effect when a value-change callback is wired. This drives
    // cursor/highlight/hook-wiring, so a knob with `editable=true` but no callback does not
    // advertise draggability through the cursor.
    const hasAnyChangeCallback = !!(onValueChange || onNormalizedValueChange || onMidiValueChange);
    const trulyEditable = effectiveEditable && hasAnyChangeCallback;

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
        onValueChange: gatedOnValueChange,
        onNormalizedValueChange: gatedOnNormalizedValueChange,
        onMidiValueChange: gatedOnMidiValueChange,
        parameter: derivedParameter,
        userValueFormatter: valueFormatter,
        userLabel: label,
        valueAsLabel: showValueAsLabel,
    });

    // Wrap adjustValue to trigger activity on changes (wheel, keyboard)
    const wrappedAdjustValue = React.useCallback(
        (delta: number, sensitivity?: number) => {
            if (valueAsLabel === "interactive" && trulyEditable) {
                handleActivity();
            }
            adjustValue(delta, sensitivity);
        },
        [adjustValue, valueAsLabel, handleActivity, trulyEditable]
    );

    const effectiveInteractionMode = interactionMode ?? View.interaction.mode ?? "both";
    const effectiveDirection = interactionDirection ?? View.interaction.direction ?? "both";

    const interactiveProps = useContinuousInteraction({
        adjustValue: wrappedAdjustValue,
        interactionMode: effectiveInteractionMode,
        direction: effectiveDirection,
        sensitivity: interactionSensitivity,
        min: derivedParameter.min,
        max: derivedParameter.max,
        paramStep: derivedParameter.step,
        editable: trulyEditable,
        disabled,
        resetToDefault: trulyEditable ? resetToDefault : undefined,
        onDragStart: valueAsLabel === "interactive" && trulyEditable ? handleDragStart : undefined,
        onDragEnd: valueAsLabel === "interactive" && trulyEditable ? handleDragEnd : undefined,
        onMouseDown,
        onTouchStart: undefined, // ContinuousControl doesn't have onTouchStart prop
        onWheel: undefined, // ContinuousControl doesn't have onWheel prop
        onKeyDown: undefined, // ContinuousControl doesn't have onKeyDown prop
    });

    const componentClassNames = useMemo(() => {
        return classNames(className, CLASSNAMES.root, CLASSNAMES.container);
    }, [className]);

    const svgClassNames = useMemo(() => {
        return trulyEditable || gatedOnClick ? CLASSNAMES.highlight : "";
    }, [trulyEditable, gatedOnClick]);

    // Add clickable cursor when clickable but not draggable (onClick but no effective value callback).
    // Uses CSS variable for customizable cursor type.
    const svgStyle = {
        ...(interactiveProps.style ?? {}),
        ...(gatedOnClick && !trulyEditable ? { cursor: "var(--audioui-cursor-clickable)" as const } : {}),
    };

    const focusable = !disabled && (effectiveEditable || !!gatedOnClick);

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
                onClick={gatedOnClick}
                onMouseDown={interactiveProps.onMouseDown}
                onTouchStart={interactiveProps.onTouchStart}
                onKeyDown={interactiveProps.onKeyDown}
                onDoubleClick={interactiveProps.onDoubleClick}
                onMouseUp={onMouseUp}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                tabIndex={focusable ? 0 : -1}
                role={interactiveProps.role}
                aria-valuenow={realValue}
                aria-valuemin={derivedParameter.min}
                aria-valuemax={derivedParameter.max}
                aria-label={effectiveLabel}
                aria-disabled={disabled || undefined}
                aria-readonly={editable === false && !disabled ? true : undefined}
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
