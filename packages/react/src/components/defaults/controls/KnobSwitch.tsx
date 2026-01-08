/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import React, { useMemo } from "react";
import classNames from "classnames";
import AdaptiveBox from "@/primitives/AdaptiveBox";
import KnobView from "./KnobView";
import { AdaptiveBoxProps, AdaptiveSizeProps, BaseProps, AudioControlEvent, ThemableProps } from "@/types";
import { useThemableProps } from "@/defaults/AudioUiProvider";
import { CLASSNAMES } from "@cutoff/audio-ui-core";
import { EnumParameter } from "@cutoff/audio-ui-core";
import { useAudioParameter } from "@/hooks/useAudioParameter";
import { useDiscreteInteraction } from "@/hooks/useDiscreteInteraction";
import { useAdaptiveSize } from "@/hooks/useAdaptiveSize";
import { useEnumParameterResolution } from "@/hooks/useEnumParameterResolution";
import { clampNormalized } from "@cutoff/audio-ui-core";
import { DEFAULT_ROUNDNESS } from "@cutoff/audio-ui-core";

/**
 * Props for the KnobSwitch component
 */
export type KnobSwitchProps = AdaptiveSizeProps &
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
        /** Thickness of the knob's stroke (normalized 0.0-1.0, maps to 1-20) */
        thickness?: number;
    };

/**
 * A switch component that uses a knob interface to cycle through options.
 *
 * This control supports discrete interaction (click to cycle, keyboard to step).
 *
 * Supports three modes of operation:
 * 1. Ad-Hoc Mode (Children only): Model inferred from Option children.
 * 2. Strict Mode (Parameter only): Model provided via parameter prop. View via renderOption.
 * 3. Hybrid Mode (Parameter + Children): Model from parameter, View from children (matched by value).
 *
 * @param props - Component props
 * @returns Rendered KnobSwitch component
 *
 * @example
 * ```tsx
 * // Ad-Hoc Mode
 * <KnobSwitch defaultValue="sine" label="Waveform">
 *   <Option value="sine">Sine</Option>
 *   <Option value="square">Square</Option>
 * </KnobSwitch>
 *
 * // Strict Mode with custom renderer
 * <KnobSwitch
 *   parameter={waveformParam}
 *   renderOption={(opt) => <Icon name={opt.value} />}
 * />
 * ```
 */
function KnobSwitch({
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
}: KnobSwitchProps) {
    const clampedRoundness = roundness !== undefined ? clampNormalized(roundness) : undefined;
    const clampedThickness = clampNormalized(thickness);
    const { resolvedColor, resolvedRoundness } = useThemableProps(
        { color, roundness: clampedRoundness },
        { color: undefined, roundness: DEFAULT_ROUNDNESS }
    );

    const { derivedParameter, visualContentMap, effectiveDefaultValue } = useEnumParameterResolution({
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

    const { handleClick: handleDiscreteClick, handleKeyDown: handleDiscreteKeyDown } = useDiscreteInteraction({
        value: effectiveValue,
        options: derivedParameter.options,
        onValueChange: (val) => setNormalizedValue(converter.normalize(val)),
        disabled: !onChange,
    });

    const handleMouseDown = (e: React.MouseEvent) => {
        onMouseDown?.(e);
    };

    const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
        onClick?.(e as unknown as React.MouseEvent);
        // The hook handles the cycle logic if defaultPrevented is false
        handleDiscreteClick(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        handleDiscreteKeyDown(e);
    };

    // Container query units for scalable text/icons
    const contentWrapperStyle = useMemo(
        () => ({
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "22cqmin",
            fontWeight: "500",
            color: "var(--audioui-text-color)",
            cursor: "inherit",
        }),
        []
    );

    const iconWrapperStyle = useMemo(
        () => ({
            width: "50cqmin",
            height: "50cqmin",
        }),
        []
    );

    const wrapContent = (node: React.ReactNode): React.ReactNode => {
        if (typeof node === "string" || typeof node === "number") {
            return node;
        }

        return (
            <div className="audioui-icon-wrapper" style={iconWrapperStyle}>
                {node}
            </div>
        );
    };

    const content = useMemo(() => {
        if (visualContentMap && visualContentMap.has(effectiveValue)) {
            return wrapContent(visualContentMap.get(effectiveValue));
        }

        if (renderOption) {
            const opt = derivedParameter.options.find((opt) => opt.value === effectiveValue);
            if (opt) return wrapContent(renderOption(opt));
        }

        return formattedValue;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visualContentMap, effectiveValue, renderOption, derivedParameter.options, formattedValue, iconWrapperStyle]);

    const effectiveLabel = label ?? derivedParameter.name;

    const { sizeClassName, sizeStyle } = useAdaptiveSize(adaptiveSize, size, "knob");

    const componentClassNames = useMemo(() => {
        return classNames(sizeClassName, CLASSNAMES.root, CLASSNAMES.container, className);
    }, [sizeClassName, className]);

    const svgClassNames = useMemo(() => {
        return onChange || onClick ? CLASSNAMES.highlight : "";
    }, [onChange, onClick]);

    // Add pointer cursor when interactive (onChange or onClick)
    const svgStyle = {
        // Override cursor for interactive controls
        ...(onClick || onChange ? { cursor: "pointer" as const } : {}),
    };

    return (
        <AdaptiveBox
            displayMode={displayMode ?? "scaleToFit"}
            labelMode={labelMode}
            className={componentClassNames}
            style={{
                ...sizeStyle,
                ...style,
            }}
            labelHeightUnits={20}
            minWidth={40}
            minHeight={40}
        >
            <AdaptiveBox.Svg
                viewBoxWidth={KnobView.viewBox.width}
                viewBoxHeight={KnobView.viewBox.height}
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
                <KnobView
                    normalizedValue={normalizedValue}
                    bipolar={false}
                    thickness={clampedThickness}
                    roundness={resolvedRoundness ?? DEFAULT_ROUNDNESS}
                    color={resolvedColor}
                />
            </AdaptiveBox.Svg>
            <AdaptiveBox.HtmlOverlay>
                <div style={contentWrapperStyle}>{content}</div>
            </AdaptiveBox.HtmlOverlay>
            {effectiveLabel && (
                <AdaptiveBox.Label position={labelPosition} align={labelAlign ?? "center"}>
                    {effectiveLabel}
                </AdaptiveBox.Label>
            )}
        </AdaptiveBox>
    );
}

export default React.memo(KnobSwitch);
