"use client";

import React, { useMemo } from "react";
import classNames from "classnames";
import { useThemableProps } from "@/defaults/AudioUiProvider";
import SvgKnob from "./SvgKnob";
import ContinuousControl from "@/primitives/controls/ContinuousControl";
import { AdaptiveBoxProps, AdaptiveSizeProps, ContinuousControlProps, ThemableProps, KnobVariant } from "@/types";
import { clampNormalized } from "@cutoff/audio-ui-core";
import { DEFAULT_ROUNDNESS } from "@cutoff/audio-ui-core";
import { AudioParameterFactory, ContinuousParameter } from "@cutoff/audio-ui-core";
import { useAudioParameter } from "@/hooks/useAudioParameter";
import { useAdaptiveSize } from "@/hooks/useAdaptiveSize";

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
         * @default Variant-dependent: 0.4 for abstract/simplest, 0.15 for others
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
        /** Whether to use RotaryImage (true) or RadialImage (false) for iconCap overlay
         * @default false
         */
        rotaryOverlay?: boolean;
        /** SVG content to display as overlay in iconCap variant */
        children?: React.ReactNode;
    };

/**
 * Knob component provides a circular control for value adjustment.
 * Supports continuous value ranges with optional bipolar mode, custom formatting,
 * and multiple visual variants.
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
    rotaryOverlay = false,
    children: svgChildren,
    onClick,
    onMouseDown,
    onMouseUp,
    onMouseEnter,
    onMouseLeave,
    className,
    style,
}: KnobProps) {
    // Use the themable props hook to resolve color and roundness with proper fallbacks
    // Clamp values to 0.0-1.0 range (only if provided, otherwise let SvgKnob use variant-specific default)
    const clampedRoundness = roundness !== undefined ? clampNormalized(roundness) : undefined;
    const clampedThickness = thickness !== undefined ? clampNormalized(thickness) : undefined;
    const { resolvedColor, resolvedRoundness } = useThemableProps(
        { color, roundness: clampedRoundness },
        { color: undefined, roundness: DEFAULT_ROUNDNESS }
    );

    // Construct parameter definition from prop or ad-hoc props
    // Required for useAudioParameter to compute displayValue
    const parameterDef = useMemo<ContinuousParameter>(() => {
        if (parameter) {
            if (parameter.type !== "continuous") {
                console.error("Knob component only supports continuous parameters.");
            }
            return parameter;
        }

        // Ad-hoc / Unmapped Mode (Implies Continuous)
        return AudioParameterFactory.createControl({
            id: paramId ?? "adhoc-knob",
            label,
            min,
            max,
            step,
            bipolar,
            unit,
            scale,
        });
    }, [parameter, label, min, max, step, bipolar, unit, scale, paramId]);

    // Get displayValue from hook (handles valueFormatter internally if provided)
    const { displayValue } = useAudioParameter(value, onChange, parameterDef, valueFormatter);

    // Get adaptive sizing values
    const { sizeClassName, sizeStyle: adaptiveSizeStyle } = useAdaptiveSize(adaptiveSize, size, "knob");

    // Prepare the content to display inside the knob
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
                {displayValue}
            </div>
        ) : undefined;

    return (
        <ContinuousControl
            view={SvgKnob}
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
            className={classNames(sizeClassName, className)}
            style={{ ...adaptiveSizeStyle, ...style }}
            onChange={onChange}
            paramId={paramId}
            onClick={onClick}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            color={resolvedColor}
            parameter={parameter}
            interactionMode={interactionMode}
            interactionDirection={interactionDirection}
            interactionSensitivity={interactionSensitivity ?? 0.008}
            variant={variant}
            thickness={clampedThickness}
            roundness={resolvedRoundness ?? DEFAULT_ROUNDNESS}
            openness={openness}
            rotation={rotation}
            rotaryOverlay={rotaryOverlay}
            svgChildren={svgChildren}
            valueFormatter={valueFormatter}
        >
            {displayValueOverlay}
        </ContinuousControl>
    );
}

export default React.memo(Knob);
