"use client";

import React, { useMemo } from "react";
import classNames from "classnames";
import "../../styles.css";
import { CLASSNAMES } from "../../styles/classNames";
import { BipolarControl, ExplicitRange } from "../types";
import { knobSizeMap } from "../utils/sizeMappings";
import { useThemableProps } from "../theme/AudioUiProvider";
import AdaptiveBox from "../primitives/AdaptiveBox";
import SvgKnob from "../theme/SvgKnob";
import { AudioParameterFactory, ContinuousParameter } from "../../models/AudioParameter";
import { useAudioParameter } from "../../hooks/useAudioParameter";
import { useInteractiveControl } from "../../hooks/useInteractiveControl";

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
    const { resolvedColor, resolvedRoundness } = useThemableProps(
        { color, roundness },
        { color: undefined, roundness: 12 }
    );

    // Construct the configuration object either from the prop or from the ad-hoc props
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
    }, [parameter, label, min, max, step, bipolar]);

    // Use the hook to handle all math
    const {
        normalizedValue,
        displayValue,
        adjustValue
    } = useAudioParameter(value, onChange, parameterDef);

    // Use the interactive control hook for unified event handling
    const interactiveProps = useInteractiveControl({
        adjustValue,
        interactionMode: interactionMode ?? "both",
        direction: "vertical",
        sensitivity: sensitivity ?? 0.008, // Increased default sensitivity (was 0.005)
    });

    // Memoize the classNames calculation
    const componentClassNames = useMemo(() => {
        return classNames(className, CLASSNAMES.root, CLASSNAMES.container, onChange ? CLASSNAMES.highlight : "");
    }, [className, onChange]);

    // Get the preferred width based on the size prop
    const { width: preferredWidth, height: preferredHeight } = knobSizeMap[size];

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
        const textContent = renderValue
            ? renderValue(value, parameterDef.min, parameterDef.max)
            : displayValue;

        // Default text rendering, now consistently applied
        return (
            <div style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                fontWeight: "500",
                color: "var(--audioui-text-color)",
                cursor: "inherit",
            }}>
                {textContent}
            </div>
        );
    }, [children, renderValue, value, parameterDef.min, parameterDef.max, displayValue]);

    const effectiveLabel = label ?? (parameter ? parameterDef.name : undefined);

    // Merge event handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        interactiveProps.onMouseDown(e);
        onMouseDown?.(e);
    };

    return (
        <AdaptiveBox
            displayMode="scaleToFit"
            className={componentClassNames}
            style={{
                ...(style ?? {}),
                ...(interactiveProps.style ?? {}),
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
                    onWheel={interactiveProps.onWheel}
                    onClick={onClick}
                    onMouseDown={handleMouseDown}
                    onTouchStart={interactiveProps.onTouchStart}
                    onKeyDown={interactiveProps.onKeyDown}
                    onMouseUp={onMouseUp}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    tabIndex={interactiveProps.tabIndex}
                    role={interactiveProps.role}
                    aria-valuenow={value}
                    aria-valuemin={parameterDef.min}
                    aria-valuemax={parameterDef.max}
                    aria-label={effectiveLabel}
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
