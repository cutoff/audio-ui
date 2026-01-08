/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import React, { useMemo } from "react";
import classNames from "classnames";
import { CLASSNAMES } from "@cutoff/audio-ui-core";
import { AdaptiveBoxProps, ContinuousControlProps, ControlComponent, ValueLabelMode } from "@/types";
import AdaptiveBox from "../AdaptiveBox";
import { useAudioParameter } from "@/hooks/useAudioParameter";
import { useContinuousInteraction } from "@/hooks/useContinuousInteraction";
import { useContinuousParameterResolution } from "@/hooks/useContinuousParameterResolution";

export type ContinuousControlComponentProps<P extends object = Record<string, unknown>> =
    // Base Control Props (includes all ContinuousControlProps)
    ContinuousControlProps &
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
        label,
        displayMode,
        labelMode,
        labelPosition,
        labelAlign,
        className,
        style,
        onChange,
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
    } = props;

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

    const { normalizedValue, adjustValue, effectiveLabel } = useAudioParameter(
        value,
        onChange,
        derivedParameter,
        valueFormatter,
        label,
        showValueAsLabel
    );

    // Wrap adjustValue to trigger activity on changes (wheel, keyboard)
    const wrappedAdjustValue = React.useCallback(
        (delta: number, sensitivity?: number) => {
            if (valueAsLabel === "interactive") {
                handleActivity();
            }
            adjustValue(delta, sensitivity);
        },
        [adjustValue, valueAsLabel, handleActivity]
    );

    const effectiveInteractionMode = interactionMode ?? View.interaction.mode ?? "both";
    const effectiveDirection = interactionDirection ?? View.interaction.direction ?? "both";

    // Only editable when onChange is provided (onClick is not relevant for interaction controller)
    const interactiveProps = useContinuousInteraction({
        adjustValue: wrappedAdjustValue,
        interactionMode: effectiveInteractionMode,
        direction: effectiveDirection,
        sensitivity: interactionSensitivity,
        editable: !!onChange,
        onDragStart: valueAsLabel === "interactive" ? handleDragStart : undefined,
        onDragEnd: valueAsLabel === "interactive" ? handleDragEnd : undefined,
        onMouseDown,
        onTouchStart: undefined, // ContinuousControl doesn't have onTouchStart prop
        onWheel: undefined, // ContinuousControl doesn't have onWheel prop
        onKeyDown: undefined, // ContinuousControl doesn't have onKeyDown prop
    });

    const componentClassNames = useMemo(() => {
        return classNames(className, CLASSNAMES.root, CLASSNAMES.container);
    }, [className]);

    const svgClassNames = useMemo(() => {
        return onChange || onClick ? CLASSNAMES.highlight : "";
    }, [onChange, onClick]);

    // Add pointer cursor when clickable but not draggable (onClick but no onChange)
    const svgStyle = {
        ...(interactiveProps.style ?? {}),
        // Override cursor for click-only controls
        ...(onClick && !onChange ? { cursor: "pointer" as const } : {}),
    };

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
                onWheel={interactiveProps.onWheel}
                onClick={onClick}
                onMouseDown={interactiveProps.onMouseDown}
                onTouchStart={interactiveProps.onTouchStart}
                onKeyDown={interactiveProps.onKeyDown}
                onMouseUp={onMouseUp}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                tabIndex={interactiveProps.tabIndex}
                role={interactiveProps.role}
                aria-valuenow={value}
                aria-label={effectiveLabel}
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
