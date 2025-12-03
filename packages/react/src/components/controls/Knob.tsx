"use client";

import React, { useCallback, useMemo } from "react";
import classNames from "classnames";
import "../../styles.css";
import { CLASSNAMES } from "../../styles/classNames";
import { BipolarControl, ExplicitRange } from "../types";
import { knobSizeMap } from "../utils/sizeMappings";
import { useThemableProps } from "../providers/AudioUiProvider";
import AdaptiveBox from "../AdaptiveBox";
import SvgKnob from "../svg/SvgKnob";
import { ContinuousParameter } from "../../models/AudioParameter";
import { useAudioParam } from "../../hooks/useAudioParam";

/**
 * Props for the Knob component
 */
export type KnobProps = BipolarControl &
    Partial<ExplicitRange> & {
        /** Content to display inside the knob (replaces the value display) */
        children?: React.ReactNode;
        /** Thickness of the knob's stroke
         * @default 12
         */
        thickness?: number;
        /**
         * Audio Parameter definition (Model)
         * If provided, overrides min/max/step/label/unit
         */
        parameter?: ContinuousParameter;
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
    thickness = 12,
    size = "normal",
    renderValue,
    paramId: _paramId,
    onClick,
    onMouseDown,
    onMouseUp,
    onMouseEnter,
    onMouseLeave,
    color,
    parameter,
}: KnobProps) {
    // Use the themable props hook to resolve color and roundness with proper fallbacks
    const { resolvedColor, resolvedRoundness } = useThemableProps(
        { color, roundness },
        { color: undefined, roundness: 12 }
    );

    // Construct the configuration object either from the prop or from the ad-hoc props
    const paramConfig = useMemo<ContinuousParameter>(() => {
        if (parameter) {
            if (parameter.type !== "continuous") {
                console.error("Knob component only supports continuous parameters.");
            }
            return parameter;
        }

        // Ad-hoc / Unmapped Mode (Implies Continuous)
        // If bipolar mode, adapt min/max to be symmetric around 0
        let effectiveMin = min;
        let effectiveMax = max;
        let effectiveDefault = min ?? 0;

        if (bipolar) {
            // If both min and max are provided, use them as-is (user override)
            // Otherwise, use symmetric defaults
            if (min === undefined && max === undefined) {
                effectiveMin = -100;
                effectiveMax = 100;
                effectiveDefault = 0;
            } else if (min === undefined && max !== undefined) {
                // Only max provided: make symmetric
                effectiveMin = -max;
                effectiveDefault = 0;
            } else if (min !== undefined && max === undefined) {
                // Only min provided: make symmetric
                effectiveMax = -min;
                effectiveDefault = 0;
            } else {
                // Both provided: use as-is, but default to 0 if in bipolar mode
                effectiveDefault = 0;
            }
        }

        return {
            id: "adhoc-knob",
            type: "continuous",
            name: label || "",
            min: effectiveMin ?? 0,
            max: effectiveMax ?? 100,
            step: step,
            unit: "",
            defaultValue: effectiveDefault,
        };
    }, [parameter, min, max, step, label, bipolar]);

    // Calculate sensitivity for intuitive control response
    // Normalized Delta = Raw Delta * Sensitivity
    // Real Value Delta = Normalized Delta * Range
    // Target: Real Value Delta = Raw Delta (1:1 mapping)
    // Therefore: Sensitivity = 1 / Range
    const sensitivity = useMemo(() => {
        const range = paramConfig.max - paramConfig.min;
        return range > 0 ? 1 / range : 0.001;
    }, [paramConfig.max, paramConfig.min]);

    // Wrap onChange
    const handleChange = useCallback((newValue: number) => {
        if (onChange) {
            onChange(newValue);
        }
    }, [onChange]);

    // Use the hook to handle all math
    const {
        normalizedValue,
        displayValue,
        adjustValue
    } = useAudioParam(value, onChange ? handleChange : undefined, paramConfig);

    /**
     * Wheel event handler that adjusts the knob value
     */
    const handleWheel = useCallback(
        (e: WheelEvent) => {
            if (onChange && !e.defaultPrevented) {
                // Positive deltaY increases value (Down = Increase)
                // Sensitivity ensures 1:1 mapping between wheel delta and value change
                adjustValue(e.deltaY, sensitivity);
            }
        },
        [onChange, adjustValue, sensitivity]
    );

    // Memoize the classNames calculation
    const componentClassNames = useMemo(() => {
        return classNames(className, CLASSNAMES.root, CLASSNAMES.container, onChange ? CLASSNAMES.highlight : "");
    }, [className, onChange]);

    // Get the preferred width based on the size prop
    const { width: preferredWidth, height: preferredHeight } = knobSizeMap[size];

    // Prepare the content to display inside the knob
    const knobContent = useMemo(() => {
        if (React.isValidElement(children) && children.type === "img") {
            return (
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "10px",
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
        } else if (renderValue) {
            const effectiveMin = paramConfig.min;
            const effectiveMax = paramConfig.max;
            return renderValue(value, effectiveMin, effectiveMax);
        } else if (children) {
            return children;
        } else {
            return displayValue;
        }
    }, [children, renderValue, value, paramConfig.min, paramConfig.max, displayValue]);

    const effectiveLabel = label ?? (parameter ? paramConfig.name : undefined);

    return (
        <AdaptiveBox
            displayMode="scaleToFit"
            className={componentClassNames}
            style={{
                ...(style ?? {}),
                ...(stretch ? {} : { width: `${preferredWidth}px`, height: `${preferredHeight}px` }),
            }}
            labelHeightUnits={20}
            minWidth={40}
            minHeight={40}
        >
            <>
                <AdaptiveBox.Svg
                    viewBoxWidth={SvgKnob.viewBox.width}
                    viewBoxHeight={SvgKnob.viewBox.height}
                    onWheel={handleWheel}
                    onClick={onClick}
                    onMouseDown={onMouseDown}
                    onMouseUp={onMouseUp}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                >
                    <SvgKnob
                        normalizedValue={normalizedValue}
                        bipolar={bipolar}
                        thickness={thickness}
                        roundness={resolvedRoundness ?? 12}
                        color={resolvedColor}
                    >
                        {knobContent}
                    </SvgKnob>
                </AdaptiveBox.Svg>

                {effectiveLabel && <AdaptiveBox.Label align="center">{effectiveLabel}</AdaptiveBox.Label>}
            </>
        </AdaptiveBox>
    );
}

export default React.memo(Knob);
