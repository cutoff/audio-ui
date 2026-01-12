/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import React, { useMemo } from "react";
import classNames from "classnames";
import DiscreteControl from "@/primitives/controls/DiscreteControl";
import KnobView from "./KnobView";
import { AdaptiveBoxProps, AdaptiveSizeProps, DiscreteControlProps, ThemableProps } from "@/types";
import { useAdaptiveSize } from "@/hooks/useAdaptiveSize";
import { useDiscreteParameterResolution } from "@/hooks/useDiscreteParameterResolution";
import { DEFAULT_ROUNDNESS, CLASSNAMES } from "@cutoff/audio-ui-core";
import { useThemableProps } from "@/hooks/useThemableProps";

const CONTENT_WRAPPER_STYLE: React.CSSProperties = {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22cqmin",
    fontWeight: "500",
    color: "var(--audioui-text-color)",
    cursor: "inherit",
};

const ICON_WRAPPER_STYLE: React.CSSProperties = {
    width: "50cqmin",
    height: "50cqmin",
};

/**
 * Props for the CycleButton component
 */
export type CycleButtonProps = DiscreteControlProps &
    AdaptiveSizeProps &
    AdaptiveBoxProps &
    ThemableProps & {
        /** Custom renderer for options (used when parameter is provided but no children map exists) */
        renderOption?: (option: { value: string | number; label: string }) => React.ReactNode;
        /** Thickness of the stroke (normalized 0.0-1.0, maps to 1-20). Used by rotary variant. */
        thickness?: number;
    };

/**
 * A discrete interaction control that cycles through a set of discrete options.
 *
 * This control supports discrete interaction only (click to cycle, keyboard to step).
 * It does not support continuous interaction (drag/wheel).
 *
 * **Important: Options vs Children**
 *
 * - **`options` prop**: Defines the parameter model (value, label, midiValue). Used for parameter structure.
 * - **`children` (OptionView components)**: Provides visual content (ReactNodes) for rendering. Used for display.
 *
 * Supports multiple visual variants (rotary knob-style, LED indicators, etc.) and
 * four modes of operation:
 * 1. **Ad-Hoc Mode (Options prop)**: Model from `options` prop, visual from `children` (if provided) or default rendering
 * 2. **Ad-Hoc Mode (Children only)**: Model inferred from OptionView children, visual from children
 * 3. **Strict Mode (Parameter only)**: Model from `parameter` prop, visual via `renderOption` callback
 * 4. **Hybrid Mode (Parameter + Children)**: Model from `parameter` prop, visual from children (matched by value)
 *
 * @param props - Component props
 * @returns Rendered CycleButton component
 *
 * @example
 * ```tsx
 * // Ad-Hoc Mode with options prop (data-driven)
 * <CycleButton
 *   options={[
 *     { value: "sine", label: "Sine Wave" },
 *     { value: "square", label: "Square Wave" }
 *   ]}
 * />
 *
 * // Ad-Hoc Mode with children (visual content)
 * <CycleButton defaultValue="sine" label="Waveform">
 *   <OptionView value="sine"><SineIcon /></OptionView>
 *   <OptionView value="square"><SquareIcon /></OptionView>
 * </CycleButton>
 *
 * // Hybrid: options for model, children for visuals
 * <CycleButton
 *   options={[
 *     { value: "sine", label: "Sine Wave", midiValue: 0 },
 *     { value: "square", label: "Square Wave", midiValue: 1 }
 *   ]}
 * >
 *   <OptionView value="sine"><SineIcon /></OptionView>
 *   <OptionView value="square"><SquareIcon /></OptionView>
 * </CycleButton>
 *
 * // Strict Mode with custom renderer
 * <CycleButton
 *   parameter={waveformParam}
 *   renderOption={(opt) => <Icon name={opt.value} />}
 * />
 * ```
 */
function CycleButton({
    value,
    defaultValue,
    onChange,
    renderOption,
    label,
    adaptiveSize = false,
    size = "normal",
    displayMode,
    labelMode,
    labelPosition,
    labelAlign,
    labelOverflow,
    color,
    roundness,
    thickness = 0.4,
    parameter,
    paramId,
    options,
    midiResolution,
    midiMapping,
    onClick,
    onMouseDown,
    onMouseUp,
    onMouseEnter,
    onMouseLeave,
    className,
    style,
    children,
}: CycleButtonProps) {
    const {
        style: themableStyle,
        clampedRoundness,
        clampedThickness,
    } = useThemableProps({
        color,
        roundness,
        thickness,
        style,
    });

    // Get visualContentMap and derivedParameter for content rendering.
    // Note: DiscreteControl also calls useDiscreteParameterResolution internally for parameter resolution,
    // but we need visualContentMap and derivedParameter here to render the HTML overlay content
    // (icons, text, or custom renderOption output) based on the current value.
    const { visualContentMap, derivedParameter, effectiveDefaultValue } = useDiscreteParameterResolution({
        children,
        options,
        paramId,
        parameter,
        defaultValue,
        label,
        midiResolution,
        midiMapping,
    });

    const effectiveValue = value !== undefined ? value : effectiveDefaultValue;

    // Get formattedValue for fallback display
    const formattedValue = useMemo(() => {
        const opt = derivedParameter.options.find((opt) => opt.value === effectiveValue);
        return opt?.label ?? String(effectiveValue);
    }, [derivedParameter.options, effectiveValue]);

    const content = useMemo(() => {
        const wrapContent = (node: React.ReactNode): React.ReactNode => {
            if (typeof node === "string" || typeof node === "number") {
                return node;
            }

            return (
                <div className={CLASSNAMES.iconWrapper} style={ICON_WRAPPER_STYLE}>
                    {node}
                </div>
            );
        };

        if (visualContentMap && visualContentMap.has(effectiveValue)) {
            return wrapContent(visualContentMap.get(effectiveValue));
        }

        if (renderOption) {
            const opt = derivedParameter.options.find((opt) => opt.value === effectiveValue);
            if (opt) return wrapContent(renderOption(opt));
        }

        return formattedValue;
    }, [visualContentMap, effectiveValue, renderOption, derivedParameter.options, formattedValue]);

    const { sizeClassName, sizeStyle } = useAdaptiveSize(adaptiveSize, size, "knob");

    return (
        <DiscreteControl
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            label={label}
            paramId={paramId}
            parameter={parameter}
            options={options}
            midiResolution={midiResolution}
            midiMapping={midiMapping}
            displayMode={displayMode}
            labelMode={labelMode}
            labelPosition={labelPosition}
            labelAlign={labelAlign}
            labelOverflow={labelOverflow}
            className={classNames(sizeClassName, className)}
            style={{ ...sizeStyle, ...themableStyle }}
            onClick={onClick}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            view={KnobView}
            viewProps={{
                bipolar: false,
                thickness: clampedThickness,
                roundness: clampedRoundness ?? DEFAULT_ROUNDNESS,
                color: color ?? "var(--audioui-primary-color)",
            }}
            htmlOverlay={<div style={CONTENT_WRAPPER_STYLE}>{content}</div>}
        >
            {children}
        </DiscreteControl>
    );
}

export default React.memo(CycleButton);
