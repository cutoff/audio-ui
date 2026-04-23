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
    DiscreteControlPrimitiveProps,
    ControlComponent,
} from "@/types";
import AdaptiveBox from "../AdaptiveBox";
import { useAudioParameter } from "@/hooks/useAudioParameter";
import { useDiscreteInteraction } from "@/hooks/useDiscreteInteraction";
import { useDiscreteParameterResolution } from "@/hooks/useDiscreteParameterResolution";

export type DiscreteControlComponentProps<P extends object = Record<string, unknown>> =
    // Base Control Props (permissive — accepts any combination of value-channel props,
    // with runtime precedence. A strict DiscreteControlProps is assignable to this.)
    DiscreteControlPrimitiveProps &
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
 * **Important: Options vs Children**
 *
 * - **`options` prop**: Defines the parameter model (value, label, midiValue). Used for parameter structure.
 * - **`children` (OptionView components)**: Provides visual content (ReactNodes) for rendering. Used for display.
 *
 * Supports four modes of operation:
 * 1. **Ad-Hoc Mode (Options prop)**: Model from `options` prop, visual from `children` (if provided) or default rendering
 * 2. **Ad-Hoc Mode (Children only)**: Model inferred from OptionView children, visual from children
 * 3. **Strict Mode (Parameter only)**: Model from `parameter` prop, visual via `renderOption` callback
 * 4. **Hybrid Mode (Parameter + Children)**: Model from `parameter` prop, visual from children (matched by value)
 *
 * @param props - Component props including parameter configuration, view component, and layout options
 * @returns Rendered discrete control component
 *
 * @example
 * ```tsx
 * // Ad-Hoc Mode with options prop
 * <DiscreteControl
 *   value="sine"
 *   onValueChange={setValue}
 *   options={[
 *     { value: "sine", label: "Sine Wave" },
 *     { value: "square", label: "Square Wave" }
 *   ]}
 *   view={KnobView}
 *   viewProps={{ color: "blue", thickness: 0.4 }}
 * />
 *
 * // Ad-Hoc Mode with children
 * <DiscreteControl
 *   value="sine"
 *   onValueChange={setValue}
 *   view={KnobView}
 *   viewProps={{ color: "blue", thickness: 0.4 }}
 * >
 *   <OptionView value="sine">Sine</OptionView>
 *   <OptionView value="square">Square</OptionView>
 * </DiscreteControl>
 * ```
 */
export function DiscreteControl<P extends object = Record<string, unknown>>(props: DiscreteControlComponentProps<P>) {
    const {
        view: View,
        viewProps,
        htmlOverlay,
        value,
        normalizedValue: inputNormalizedValue,
        midiValue: inputMidiValue,
        defaultValue,
        onValueChange,
        onNormalizedValueChange,
        onMidiValueChange,
        children,
        options,
        label,
        paramId,
        parameter,
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
        onClick,
        onMouseDown,
        onMouseUp,
        onMouseEnter,
        onMouseLeave,
        midiResolution,
        midiMapping,
    } = props;

    const editable = !!(onValueChange || onNormalizedValueChange || onMidiValueChange);

    const { derivedParameter, effectiveDefaultValue } = useDiscreteParameterResolution({
        children,
        options,
        paramId,
        parameter,
        defaultValue,
        label,
        midiResolution,
        midiMapping,
    });

    // Resolve effective value in real-value domain from whichever input channel was supplied.
    // For uncontrolled mode, fall back to the parameter's default.
    const anyInputProvided = value !== undefined || inputNormalizedValue !== undefined || inputMidiValue !== undefined;
    const effectiveValueInput = anyInputProvided ? value : effectiveDefaultValue;

    const { realValue, normalizedValue, formattedValue, commitValue } = useAudioParameter<string | number>({
        value: effectiveValueInput,
        normalizedValue: inputNormalizedValue,
        midiValue: inputMidiValue,
        onValueChange,
        onNormalizedValueChange,
        onMidiValueChange,
        parameter: derivedParameter,
    });

    const { handleClick, handleKeyDown, handleMouseDown } = useDiscreteInteraction({
        value: realValue,
        options: derivedParameter.options,
        onValueChange: commitValue,
        disabled: !editable,
        // Type cast needed because onClick prop expects React.MouseEvent<SVGSVGElement>
        // but hook accepts React.MouseEvent
        onClick: onClick
            ? (e: React.MouseEvent) => onClick(e as unknown as React.MouseEvent<SVGSVGElement>)
            : undefined,
        onMouseDown,
        onKeyDown: undefined, // DiscreteControl doesn't have onKeyDown prop, only uses hook handler
    });

    const effectiveLabel = label ?? derivedParameter.name;

    const optionCount = derivedParameter.options.length;
    const optionIndex = optionCount > 0 ? derivedParameter.options.findIndex((opt) => opt.value === realValue) : -1;
    const ariaValueNow = optionIndex >= 0 ? optionIndex : undefined;
    const ariaValueMin = 0;
    const ariaValueMax = Math.max(0, optionCount - 1);

    const componentClassNames = useMemo(() => {
        return classNames(className, CLASSNAMES.root, CLASSNAMES.container);
    }, [className]);

    const svgClassNames = useMemo(() => {
        return editable || onClick ? CLASSNAMES.highlight : "";
    }, [editable, onClick]);

    // Add clickable cursor when interactive.
    const svgStyle = useMemo(
        () => ({
            ...(onClick || editable ? { cursor: "var(--audioui-cursor-clickable)" as const } : {}),
        }),
        [onClick, editable]
    );

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
                onClick={handleClick}
                onMouseDown={handleMouseDown}
                onKeyDown={handleKeyDown}
                onMouseUp={onMouseUp}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                tabIndex={0}
                role="spinbutton"
                aria-valuenow={ariaValueNow}
                aria-valuemin={ariaValueMin}
                aria-valuemax={ariaValueMax}
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
