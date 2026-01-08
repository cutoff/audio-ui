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
import { AdaptiveBoxProps, AdaptiveSizeProps, BaseProps, AudioControlEvent, ThemableProps } from "@/types";
import { useThemableProps } from "@/defaults/AudioUiProvider";
import { useAdaptiveSize } from "@/hooks/useAdaptiveSize";
import { useEnumParameterResolution } from "@/hooks/useEnumParameterResolution";
import { clampNormalized, EnumParameter } from "@cutoff/audio-ui-core";
import { DEFAULT_ROUNDNESS } from "@cutoff/audio-ui-core";

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
export type CycleButtonProps = AdaptiveSizeProps &
    AdaptiveBoxProps &
    BaseProps &
    ThemableProps & {
        /** Label displayed below the component */
        label?: string;
        /** Current value of the component (Controlled mode) */
        value?: string | number;
        /** Handler for value changes */
        onChange?: (event: AudioControlEvent<string | number>) => void;
        /** Default value of the component (Uncontrolled mode) */
        defaultValue?: string | number;
        /** Child elements (Option components) */
        children?: React.ReactNode;
        /** Identifier for the parameter this control represents */
        paramId?: string;
        /** Audio Parameter definition (Strict Model Mode) */
        parameter?: EnumParameter;
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
 * Supports multiple visual variants (rotary knob-style, LED indicators, etc.) and
 * three modes of operation:
 * 1. Ad-Hoc Mode (Children only): Model inferred from Option children.
 * 2. Strict Mode (Parameter only): Model provided via parameter prop. View via renderOption.
 * 3. Hybrid Mode (Parameter + Children): Model from parameter, View from children (matched by value).
 *
 * @param props - Component props
 * @returns Rendered CycleButton component
 *
 * @example
 * ```tsx
 * // Ad-Hoc Mode
 * <CycleButton defaultValue="sine" label="Waveform">
 *   <Option value="sine">Sine</Option>
 *   <Option value="square">Square</Option>
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
    color,
    roundness,
    thickness = 0.4,
    parameter,
    paramId,
    onClick,
    onMouseDown,
    onMouseUp,
    onMouseEnter,
    onMouseLeave,
    className,
    style,
    children,
}: CycleButtonProps) {
    const clampedRoundness = roundness !== undefined ? clampNormalized(roundness) : undefined;
    const clampedThickness = clampNormalized(thickness);
    const { resolvedColor, resolvedRoundness } = useThemableProps(
        { color, roundness: clampedRoundness },
        { color: undefined, roundness: DEFAULT_ROUNDNESS }
    );

    // Get visualContentMap and derivedParameter for content rendering.
    // Note: DiscreteControl also calls useEnumParameterResolution internally for parameter resolution,
    // but we need visualContentMap and derivedParameter here to render the HTML overlay content
    // (icons, text, or custom renderOption output) based on the current value.
    const { visualContentMap, derivedParameter, effectiveDefaultValue } = useEnumParameterResolution({
        children,
        paramId,
        parameter,
        defaultValue,
        label,
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
                <div className="audioui-icon-wrapper" style={ICON_WRAPPER_STYLE}>
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
            displayMode={displayMode}
            labelMode={labelMode}
            labelPosition={labelPosition}
            labelAlign={labelAlign}
            className={classNames(sizeClassName, className)}
            style={{ ...sizeStyle, ...style }}
            onClick={onClick}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            view={KnobView}
            viewProps={{
                bipolar: false,
                thickness: clampedThickness,
                roundness: resolvedRoundness ?? DEFAULT_ROUNDNESS,
                color: resolvedColor,
            }}
            htmlOverlay={<div style={CONTENT_WRAPPER_STYLE}>{content}</div>}
        >
            {children}
        </DiscreteControl>
    );
}

export default React.memo(CycleButton);
