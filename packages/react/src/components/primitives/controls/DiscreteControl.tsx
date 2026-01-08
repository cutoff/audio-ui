/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import React, { useMemo, useCallback } from "react";
import classNames from "classnames";
import { CLASSNAMES } from "@cutoff/audio-ui-core";
import { AdaptiveBoxProps, DiscreteControlProps, ControlComponent } from "@/types";
import AdaptiveBox from "../AdaptiveBox";
import { useAudioParameter } from "@/hooks/useAudioParameter";
import { useDiscreteInteraction } from "@/hooks/useDiscreteInteraction";
import { useDiscreteParameterResolution } from "@/hooks/useDiscreteParameterResolution";

export type DiscreteControlComponentProps<P extends object = Record<string, unknown>> =
    // Base Control Props (includes all DiscreteControlProps)
    DiscreteControlProps &
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
 * A Generic Discrete Control that connects a Data Model (DiscreteParameter)
 * to a Visualization View (ControlComponent).
 *
 * This component handles parameter resolution, value management, interaction handling,
 * and layout management for discrete controls (CycleButton, Selector, etc.).
 *
 * Supports three modes of operation:
 * 1. Ad-Hoc Mode (Children only): Model inferred from Option children.
 * 2. Strict Mode (Parameter only): Model provided via parameter prop. View via renderOption.
 * 3. Hybrid Mode (Parameter + Children): Model from parameter, View from children (matched by value).
 *
 * @param props - Component props including parameter configuration, view component, and layout options
 * @returns Rendered discrete control component
 *
 * @example
 * ```tsx
 * <DiscreteControl
 *   value="sine"
 *   onChange={(e) => setValue(e.value)}
 *   view={KnobView}
 *   viewProps={{ color: "blue", thickness: 0.4 }}
 * >
 *   <Option value="sine">Sine</Option>
 *   <Option value="square">Square</Option>
 * </DiscreteControl>
 * ```
 */
export function DiscreteControl<P extends object = Record<string, unknown>>(props: DiscreteControlComponentProps<P>) {
    const {
        view: View,
        viewProps,
        htmlOverlay,
        value,
        defaultValue,
        onChange,
        children,
        label,
        paramId,
        parameter,
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

    const { derivedParameter, effectiveDefaultValue } = useDiscreteParameterResolution({
        children,
        paramId,
        parameter,
        defaultValue,
        label,
    });

    const effectiveValue = value !== undefined ? value : effectiveDefaultValue;

    const { normalizedValue, setNormalizedValue, formattedValue, converter } = useAudioParameter(
        effectiveValue,
        onChange,
        derivedParameter
    );

    const handleValueChange = useCallback(
        (val: number | string) => {
            setNormalizedValue(converter.normalize(val));
        },
        [setNormalizedValue, converter]
    );

    const { handleClick: handleDiscreteClick, handleKeyDown: handleDiscreteKeyDown } = useDiscreteInteraction({
        value: effectiveValue,
        options: derivedParameter.options,
        onValueChange: handleValueChange,
        disabled: !onChange,
    });

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            onMouseDown?.(e);
        },
        [onMouseDown]
    );

    const handleClick = useCallback(
        (e: React.MouseEvent<SVGSVGElement>) => {
            onClick?.(e as unknown as React.MouseEvent);
            // The hook handles the cycle logic if defaultPrevented is false
            if (!e.defaultPrevented) {
                handleDiscreteClick(e);
            }
        },
        [onClick, handleDiscreteClick]
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (!e.defaultPrevented) {
                handleDiscreteKeyDown(e);
            }
        },
        [handleDiscreteKeyDown]
    );

    const effectiveLabel = label ?? derivedParameter.name;

    const componentClassNames = useMemo(() => {
        return classNames(className, CLASSNAMES.root, CLASSNAMES.container);
    }, [className]);

    const svgClassNames = useMemo(() => {
        return onChange || onClick ? CLASSNAMES.highlight : "";
    }, [onChange, onClick]);

    // Add pointer cursor when interactive (onChange or onClick)
    const svgStyle = useMemo(
        () => ({
            ...(onClick || onChange ? { cursor: "pointer" as const } : {}),
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
        >
            <AdaptiveBox.Svg
                viewBoxWidth={View.viewBox.width}
                viewBoxHeight={View.viewBox.height}
                className={svgClassNames}
                style={svgStyle}
                onClick={handleClick}
                onMouseDown={handleMouseDown}
                onKeyDown={handleKeyDown}
                onMouseUp={onMouseUp}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                tabIndex={0}
                role="spinbutton"
                aria-valuenow={typeof effectiveValue === "number" ? effectiveValue : undefined}
                aria-valuetext={formattedValue}
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

export default React.memo(DiscreteControl) as typeof DiscreteControl;
