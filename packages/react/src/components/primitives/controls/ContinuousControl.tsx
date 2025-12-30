"use client";

import React, { useMemo } from "react";
import classNames from "classnames";
import { CLASSNAMES } from "@cutoff/audio-ui-core";
import { AdaptiveBoxProps, ContinuousControlProps, ControlComponent } from "../../types";
import AdaptiveBox from "../AdaptiveBox";
import { AudioParameterFactory } from "@cutoff/audio-ui-core";
import { useAudioParameter } from "../../../hooks/useAudioParameter";
import { useInteractiveControl } from "../../../hooks/useInteractiveControl";

// 1. Define Props with Generics
// P represents the "Extra Props" required by the specific View component
export type ContinuousControlComponentProps<P extends object = {}> =
    // Base Control Props (includes all ContinuousControlProps)
    ContinuousControlProps &
        // Layout props that configure AdaptiveBox behavior
        AdaptiveBoxProps &
        // The "Extra Props" P are intersected here so they appear on the root component
        P & {
            /**
             * The Visualization Component.
             * Must adhere to ControlComponent contract.
             */
            view: ControlComponent<P>;

            /**
             * Content passed to the View (e.g. center label for knobs)
             */
            children?: React.ReactNode;
        };

/**
 * A Generic Continuous Control that connects a Data Model (AudioParameter)
 * to a Visualization View (ControlComponent).
 */
export function ContinuousControl<P extends object = {}>(props: ContinuousControlComponentProps<P>) {
    const {
        view: View,
        min,
        max,
        step,
        value,
        label,
        children,
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
        ...viewProps // Capture all other props (color, thickness, bipolar, etc.) to pass to View
    } = props;

    const bipolar = props.bipolar ?? false;
    // 1. Parameter Model
    const paramConfig = useMemo(() => {
        if (parameter) return parameter;
        return AudioParameterFactory.createControl({
            id: paramId,
            label,
            min,
            max,
            step,
            bipolar,
            unit,
            scale,
        });
    }, [parameter, label, min, max, step, bipolar, unit, scale, paramId]);

    // 2. Audio Logic Hook
    const { normalizedValue, adjustValue } = useAudioParameter(value, onChange, paramConfig);

    // 3. Determine Interaction Settings (View default vs Override)
    const effectiveInteractionMode = interactionMode ?? View.interaction.mode ?? "both";
    const effectiveDirection = interactionDirection ?? View.interaction.direction ?? "both";

    // 4. Interaction Hook
    // Only editable when onChange is provided (onClick is not relevant for interaction controller)
    const interactiveProps = useInteractiveControl({
        adjustValue,
        interactionMode: effectiveInteractionMode,
        direction: effectiveDirection,
        sensitivity: interactionSensitivity,
        editable: !!onChange,
    });

    const componentClassNames = useMemo(() => {
        return classNames(
            className,
            CLASSNAMES.root,
            CLASSNAMES.container,
            onChange || onClick ? CLASSNAMES.highlight : ""
        );
    }, [className, onChange, onClick]);

    const effectiveLabel = label ?? (parameter ? paramConfig.name : undefined);

    const handleMouseDown = (e: React.MouseEvent) => {
        interactiveProps.onMouseDown(e);
        onMouseDown?.(e);
    };

    // Add pointer cursor when clickable but not draggable (onClick but no onChange)
    const clickableStyle = onClick && !onChange ? { cursor: "pointer" as const } : {};

    return (
        <AdaptiveBox
            displayMode={displayMode ?? "scaleToFit"}
            labelMode={labelMode}
            className={componentClassNames}
            style={{
                // Interactive style first (provides default cursor)
                ...(interactiveProps.style ?? {}),
                // Clickable style (pointer cursor when onClick but no onChange)
                ...clickableStyle,
                // User style last (can override cursor and other styles)
                ...(style ?? {}),
            }}
            labelHeightUnits={View.labelHeightUnits ?? 20}
        >
            <AdaptiveBox.Svg
                viewBoxWidth={View.viewBox.width}
                viewBoxHeight={View.viewBox.height}
                onWheel={interactiveProps.onWheel}
                onClick={onClick}
                onMouseDown={handleMouseDown}
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
                {/*
                    Render the View with normalized value + children + specific props (P)
                    Cast viewProps to P because TypeScript generic spread is tricky
                */}
                <View normalizedValue={normalizedValue} {...(viewProps as P)}>
                    {children}
                </View>
            </AdaptiveBox.Svg>
            {effectiveLabel && (
                <AdaptiveBox.Label position={labelPosition} align={labelAlign}>
                    {effectiveLabel}
                </AdaptiveBox.Label>
            )}
        </AdaptiveBox>
    );
}

export default React.memo(ContinuousControl) as typeof ContinuousControl;
