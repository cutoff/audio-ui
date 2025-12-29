"use client";

import React, { useMemo } from "react";
import classNames from "classnames";
import { getSizeClassForComponent, getSizeStyleForComponent } from "@cutoff/audio-ui-core";
import { useThemableProps } from "../theme/AudioUiProvider";
import SvgKnob from "../theme/SvgKnob";
import ContinuousControl from "../primitives/controls/ContinuousControl";
import { AdaptiveBoxProps, AdaptiveSizeProps, ContinuousControlProps, ThemableProps } from "../types";
import { clampNormalized } from "@cutoff/audio-ui-core";
import { DEFAULT_ROUNDNESS } from "@cutoff/audio-ui-core";
import { AudioParameterFactory, ContinuousParameter } from "@cutoff/audio-ui-core";
import { useAudioParameter } from "../../hooks/useAudioParameter";

/**
 * Props for the Knob component (built-in control with theming support)
 */
export type KnobProps = ContinuousControlProps &
    AdaptiveSizeProps &
    AdaptiveBoxProps &
    ThemableProps & {
        /** Content to display inside the knob (replaces the value display) */
        children?: React.ReactNode;
        /** Thickness of the knob's stroke (normalized 0.0-1.0, maps to 1-20)
         * @default 0.4
         */
        thickness?: number;
    };

/**
 * Knob component provides a circular control for value adjustment.
 * ...
 */
function Knob({
    min,
    max,
    step,
    bipolar = false,
    value,
    onChange,
    renderValue,
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
    unit,
    scale,
    paramId,
    interactionMode,
    interactionDirection,
    interactionSensitivity,
    onClick,
    onMouseDown,
    onMouseUp,
    onMouseEnter,
    onMouseLeave,
    className,
    style,
    children,
}: KnobProps) {
    // Use the themable props hook to resolve color and roundness with proper fallbacks
    // Clamp values to 0.0-1.0 range
    const clampedRoundness = roundness !== undefined ? clampNormalized(roundness) : undefined;
    const clampedThickness = clampNormalized(thickness);
    const { resolvedColor, resolvedRoundness } = useThemableProps(
        { color, roundness: clampedRoundness },
        { color: undefined, roundness: DEFAULT_ROUNDNESS }
    );

    // Construct the configuration object either from the prop or from the ad-hoc props
    // We need this to get displayValue and min/max for renderValue
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

    // Get displayValue for default rendering
    const { displayValue } = useAudioParameter(value, onChange, parameterDef);

    // Determine sizing behavior: adaptiveSize controls stretch behavior and
    // takes precedence over size when both are provided.
    const isStretch = adaptiveSize === true;

    // Get the size class name based on the size prop
    const sizeClassName = isStretch ? undefined : getSizeClassForComponent("knob", size);

    // Prepare the content to display inside the knob
    const knobContent = useMemo(() => {
        // Handle images first
        if (React.isValidElement(children) && children.type === "img") {
            return (
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "inherit",
                    }}
                >
                    {React.cloneElement(children, {
                        style: {
                            maxWidth: "100%",
                            maxHeight: "100%",
                            cursor: "inherit",
                        },
                    } as React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>)}
                </div>
            );
        }

        // Handle custom children or render props
        if (children) {
            return children;
        }

        // Determine text content: custom render prop or default display value
        const textContent = renderValue ? renderValue(value, parameterDef.min, parameterDef.max) : displayValue;

        // Default text rendering, now consistently applied
        return (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                    fontWeight: "500",
                    color: "var(--audioui-text-color)",
                    cursor: "inherit",
                }}
            >
                {textContent}
            </div>
        );
    }, [children, renderValue, value, parameterDef.min, parameterDef.max, displayValue]);

    // Merge class names: size class first, then user className (user takes precedence)
    const mergedClassName = classNames(sizeClassName, className);

    // Build merged style: size style (when not stretching), then user style (user takes precedence)
    const sizeStyle = isStretch ? undefined : getSizeStyleForComponent("knob", size);

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
            className={mergedClassName}
            style={{ ...sizeStyle, ...style }}
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
            thickness={clampedThickness}
            roundness={resolvedRoundness ?? DEFAULT_ROUNDNESS}
        >
            {knobContent}
        </ContinuousControl>
    );
}

export default React.memo(Knob);
