"use client";

import React, { useMemo } from "react";
import classNames from "classnames";
import { getSizeClassForComponent, getSizeStyleForComponent } from "@cutoff/audio-ui-core";
import { useThemableProps } from "../theme/AudioUiProvider";
import SvgKnob from "../theme/SvgKnob";
import SvgContinuousControl from "../primitives/SvgContinuousControl";
import { ContinuousControlProps, Themable } from "../types";
import { clampNormalized } from "@cutoff/audio-ui-core";
import { DEFAULT_ROUNDNESS } from "@cutoff/audio-ui-core";
import { AudioParameterFactory, ContinuousParameter } from "@cutoff/audio-ui-core";
import { useAudioParameter } from "../../hooks/useAudioParameter";

/**
 * Props for the Knob component (built-in control with theming support)
 */
export type KnobProps = ContinuousControlProps &
    Themable & {
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
    label,
    children,
    stretch = false,
    className,
    style,
    onChange,
    roundness,
    thickness = 0.4,
    size = "normal",
    renderValue,
    paramId,
    onClick,
    onMouseDown,
    onMouseUp,
    onMouseEnter,
    onMouseLeave,
    color,
    parameter,
    interactionMode,
    sensitivity,
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
        });
    }, [parameter, label, min, max, step, bipolar, paramId]);

    // Get displayValue for default rendering
    const { displayValue } = useAudioParameter(value, onChange, parameterDef);

    // Get the size class name based on the size prop
    const sizeClassName = stretch ? undefined : getSizeClassForComponent("knob", size);

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
    const sizeStyle = stretch ? undefined : getSizeStyleForComponent("knob", size);

    return (
        <SvgContinuousControl
            view={SvgKnob}
            min={min}
            max={max}
            step={step}
            bipolar={bipolar}
            value={value}
            label={label}
            stretch={stretch}
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
            sensitivity={sensitivity ?? 0.008}
            thickness={clampedThickness}
            roundness={resolvedRoundness ?? DEFAULT_ROUNDNESS}
        >
            {knobContent}
        </SvgContinuousControl>
    );
}

export default React.memo(Knob);
