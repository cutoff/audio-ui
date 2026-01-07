/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import React, { useMemo } from "react";
import classNames from "classnames";
import { CLASSNAMES } from "@cutoff/audio-ui-core";
import { AdaptiveBoxProps, ContinuousControlProps, ControlComponent } from "@/types";
import AdaptiveBox from "../AdaptiveBox";
import { useAudioParameter } from "@/hooks/useAudioParameter";
import { useInteractiveControl } from "@/hooks/useInteractiveControl";
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
             * When true, displays the formatted value as the label instead of the provided label.
             * When false (default), uses the provided label or falls back to the parameter definition's label.
             * @default false
             */
            valueAsLabel?: boolean;
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
        valueAsLabel = false,
    } = props;

    const bipolar = props.bipolar ?? false;
    const { derivedParameter: paramConfig } = useContinuousParameterResolution({
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

    const { normalizedValue, adjustValue, displayValue } = useAudioParameter(
        value,
        onChange,
        paramConfig,
        valueFormatter
    );

    const effectiveInteractionMode = interactionMode ?? View.interaction.mode ?? "both";
    const effectiveDirection = interactionDirection ?? View.interaction.direction ?? "both";

    // Only editable when onChange is provided (onClick is not relevant for interaction controller)
    const interactiveProps = useInteractiveControl({
        adjustValue,
        interactionMode: effectiveInteractionMode,
        direction: effectiveDirection,
        sensitivity: interactionSensitivity,
        editable: !!onChange,
    });

    const componentClassNames = useMemo(() => {
        return classNames(className, CLASSNAMES.root, CLASSNAMES.container);
    }, [className]);

    const svgClassNames = useMemo(() => {
        return onChange || onClick ? CLASSNAMES.highlight : "";
    }, [onChange, onClick]);

    const effectiveLabel = useMemo(() => {
        if (valueAsLabel) {
            return displayValue;
        }
        return label ?? (parameter ? paramConfig.name : undefined);
    }, [valueAsLabel, displayValue, label, parameter, paramConfig.name]);

    const handleMouseDown = (e: React.MouseEvent) => {
        interactiveProps.onMouseDown(e);
        onMouseDown?.(e);
    };

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
        >
            <AdaptiveBox.Svg
                viewBoxWidth={View.viewBox.width}
                viewBoxHeight={View.viewBox.height}
                className={svgClassNames}
                style={svgStyle}
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
