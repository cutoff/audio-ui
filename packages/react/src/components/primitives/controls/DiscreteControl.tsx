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
 * Interactivity is governed by the explicit `editable` (default `true`) and `disabled`
 * (default `false`) props. `editable=false` blocks click/keyboard gestures; `disabled=true`
 * additionally suppresses all callback firing (including `onClick`) and removes the control
 * from the tab order. External `value` prop updates always flow through to the visuals.
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
        editable = true,
        disabled = false,
    } = props;

    const effectiveEditable = editable && !disabled;
    const gatedOnValueChange = disabled ? undefined : onValueChange;
    const gatedOnNormalizedValueChange = disabled ? undefined : onNormalizedValueChange;
    const gatedOnMidiValueChange = disabled ? undefined : onMidiValueChange;
    const gatedOnClick = disabled ? undefined : onClick;
    // Gestures only have a visible effect when a value-change callback is wired. This drives
    // cursor/highlight/hook-wiring, so a control with `editable=true` but no callback does not
    // advertise interactivity through the cursor.
    const hasAnyChangeCallback = !!(onValueChange || onNormalizedValueChange || onMidiValueChange);
    const trulyEditable = effectiveEditable && hasAnyChangeCallback;

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
        onValueChange: gatedOnValueChange,
        onNormalizedValueChange: gatedOnNormalizedValueChange,
        onMidiValueChange: gatedOnMidiValueChange,
        parameter: derivedParameter,
    });

    const { handleClick, handleKeyDown, handleMouseDown } = useDiscreteInteraction({
        value: realValue,
        options: derivedParameter.options,
        onValueChange: commitValue,
        disabled,
        editable: trulyEditable,
        // Type cast needed because onClick prop expects React.MouseEvent<SVGSVGElement>
        // but hook accepts React.MouseEvent
        onClick: gatedOnClick
            ? (e: React.MouseEvent) => gatedOnClick(e as unknown as React.MouseEvent<SVGSVGElement>)
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
        return trulyEditable || gatedOnClick ? CLASSNAMES.highlight : "";
    }, [trulyEditable, gatedOnClick]);

    // Always set an explicit cursor to match ContinuousControl's behavior. Order: disabled wins;
    // otherwise clickable when interactive; otherwise non-editable.
    const cursor = disabled
        ? "var(--audioui-cursor-disabled)"
        : gatedOnClick || trulyEditable
          ? "var(--audioui-cursor-clickable)"
          : "var(--audioui-cursor-noneditable)";
    const svgStyle = useMemo(
        () => ({
            cursor,
        }),
        [cursor]
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
                tabIndex={disabled ? -1 : effectiveEditable || gatedOnClick ? 0 : -1}
                role="spinbutton"
                aria-valuenow={ariaValueNow}
                aria-valuemin={ariaValueMin}
                aria-valuemax={ariaValueMax}
                aria-valuetext={formattedValue}
                aria-label={effectiveLabel}
                aria-disabled={disabled || undefined}
                aria-readonly={editable === false && !disabled ? true : undefined}
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
