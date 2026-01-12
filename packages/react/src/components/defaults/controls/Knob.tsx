/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import React from "react";
import classNames from "classnames";
import KnobView from "./KnobView";
import ContinuousControl from "@/primitives/controls/ContinuousControl";
import {
    AdaptiveBoxProps,
    AdaptiveSizeProps,
    ContinuousControlProps,
    ThemableProps,
    KnobVariant,
    ValueLabelMode,
} from "@/types";
import { DEFAULT_ROUNDNESS } from "@cutoff/audio-ui-core";
import { useAudioParameter } from "@/hooks/useAudioParameter";
import { useAdaptiveSize } from "@/hooks/useAdaptiveSize";
import { useContinuousParameterResolution } from "@/hooks/useContinuousParameterResolution";
import { useThemableProps } from "@/hooks/useThemableProps";

/**
 * Default openness for knob ring in degrees (matches ValueRing default)
 */
export const DEFAULT_OPENNESS = 90;

/**
 * Default rotation angle offset in degrees (matches ValueRing default)
 */
export const DEFAULT_ROTATION = 0;

/**
 * Props for the Knob component (built-in control with theming support)
 */
export type KnobProps = ContinuousControlProps &
    AdaptiveSizeProps &
    AdaptiveBoxProps &
    ThemableProps & {
        /** Visual variant of the knob
         * @default "abstract"
         */
        variant?: KnobVariant;
        /** Thickness of the knob's stroke (normalized 0.0-1.0, maps to 1-20)
         * @default Variant-dependent: 0.4 for abstract/simplest, 0.2 for others
         */
        thickness?: number;
        /** Openness of the ring in degrees (value between 0-360º; 0º: closed; 90º: 3/4 open; 180º: half-circle;)
         * @default 90
         */
        openness?: number;
        /** Optional rotation angle offset in degrees
         * @default 0
         */
        rotation?: number;
        /**
         * Whether to use RotaryImage (true) or RadialImage (false) for iconCap overlay.
         * When true, the icon rotates with the knob value; when false, the icon remains static.
         * Only applies when variant is "iconCap" and children is provided.
         * @default false
         */
        rotaryOverlay?: boolean;
        /**
         * SVG content to display as overlay in iconCap variant.
         * Typically an icon component (e.g., wave icons) that will be rendered at the center of the knob.
         * The icon inherits color via currentColor, so it will adapt to light/dark mode automatically.
         * Only used when variant is "iconCap".
         *
         * @example
         * ```tsx
         * <Knob variant="iconCap" value={50} min={0} max={100}>
         *   <SineWaveIcon />
         * </Knob>
         * ```
         */
        children?: React.ReactNode;
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
 * Knob component provides a circular control for value adjustment.
 * Supports continuous value ranges with optional bipolar mode, custom formatting,
 * and multiple visual variants.
 *
 * @example Basic usage
 * ```tsx
 * <Knob value={50} min={0} max={100} label="Volume" />
 * ```
 *
 * @example With iconCap variant and icon
 * ```tsx
 * <Knob variant="iconCap" value={64} min={0} max={127} rotaryOverlay={true}>
 *   <SineWaveIcon />
 * </Knob>
 * ```
 */
function Knob({
    min,
    max,
    step,
    bipolar = false,
    value,
    onChange,
    valueFormatter,
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
    variant = "abstract",
    thickness,
    openness = DEFAULT_OPENNESS,
    rotation = DEFAULT_ROTATION,
    parameter,
    unit,
    scale,
    paramId,
    interactionMode,
    interactionDirection,
    interactionSensitivity,
    rotaryOverlay: svgOverlayRotary = false,
    children: svgOverlay,
    valueAsLabel = "labelOnly",
    midiResolution,
    defaultValue,
    onClick,
    onMouseDown,
    onMouseUp,
    onMouseEnter,
    onMouseLeave,
    className,
    style,
}: KnobProps) {
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

    const { derivedParameter: parameterDef } = useContinuousParameterResolution({
        parameter,
        paramId: paramId ?? "adhoc-knob",
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

    const { formattedValue } = useAudioParameter(value, onChange, parameterDef, valueFormatter);

    const { sizeClassName, sizeStyle: adaptiveSizeStyle } = useAdaptiveSize(adaptiveSize, size, "knob");

    // Uses container query units (cqmin) so text scales with component size
    const displayValueOverlay =
        variant === "abstract" ? (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22cqmin",
                    fontWeight: "500",
                    color: "var(--audioui-text-color)",
                    cursor: "inherit",
                }}
            >
                {formattedValue}
            </div>
        ) : undefined;

    return (
        <ContinuousControl
            min={min}
            max={max}
            step={step}
            bipolar={bipolar}
            value={value}
            label={label}
            displayMode={displayMode}
            labelMode={labelMode}
            labelPosition={labelPosition}
            labelAlign={labelAlign}
            labelOverflow={labelOverflow}
            className={classNames(sizeClassName, className)}
            style={{ ...adaptiveSizeStyle, ...themableStyle }}
            onChange={onChange}
            paramId={paramId}
            onClick={onClick}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            parameter={parameter}
            unit={unit}
            scale={scale}
            interactionMode={interactionMode}
            interactionDirection={interactionDirection}
            interactionSensitivity={interactionSensitivity ?? 0.008}
            valueFormatter={valueFormatter}
            valueAsLabel={valueAsLabel}
            view={KnobView}
            viewProps={{
                color: color ?? "var(--audioui-primary-color)",
                variant: variant,
                thickness: clampedThickness,
                roundness: clampedRoundness ?? DEFAULT_ROUNDNESS,
                openness: openness,
                rotation: rotation,
                svgOverlayRotary: svgOverlayRotary,
                svgOverlay: svgOverlay,
                bipolar: bipolar,
            }}
            htmlOverlay={displayValueOverlay}
        />
    );
}

export default React.memo(Knob);
