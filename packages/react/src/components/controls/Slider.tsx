"use client";

import React from "react";
import { sliderSizeMap } from "../utils/sizeMappings";
import { useThemableProps } from "../theme/AudioUiProvider";
import { SvgVerticalSlider, SvgHorizontalSlider } from "../theme/SvgSlider";
import SvgContinuousControl from "../primitives/SvgContinuousControl";
import { BipolarControl, ExplicitRange } from "../types";
import { ContinuousParameter } from "../../models/AudioParameter";

/**
 * Props for the Slider component
 */
export type SliderProps = BipolarControl &
    Partial<ExplicitRange> & {
        /** Orientation of the slider
         * @default 'vertical' */
        orientation?: "horizontal" | "vertical";
        /** Thickness of the slider in pixels
         * @default 20 */
        thickness?: number;
        /**
         * Audio Parameter definition (Model)
         * If provided, overrides min/max/label
         */
        parameter?: ContinuousParameter;
    };

/**
 * A vertical slider component for audio applications.
 * ...
 */
function Slider({
    orientation = "vertical",
    min,
    max,
    step,
    bipolar = false,
    value,
    label,
    thickness = 20,
    stretch = false,
    className,
    style,
    onChange,
    roundness,
    size = "normal",
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
}: SliderProps) {
    // Use the themable props hook to resolve color and roundness with proper fallbacks
    const { resolvedColor, resolvedRoundness } = useThemableProps(
        { color, roundness },
        { color: undefined, roundness: undefined }
    );

    // Get the preferred dimensions based on the size prop and orientation
    const { width: preferredWidth, height: preferredHeight } = sliderSizeMap[size][orientation];

    // Select the appropriate view component based on orientation
    const ViewComponent = orientation === "vertical" ? SvgVerticalSlider : SvgHorizontalSlider;

    return (
        <SvgContinuousControl
            view={ViewComponent}
            min={min}
            max={max}
            step={step}
            bipolar={bipolar}
            value={value}
            label={label}
            stretch={stretch}
            className={className}
            style={{
                ...(style ?? {}),
                ...(stretch ? {} : { width: `${preferredWidth}px`, height: `${preferredHeight}px` }),
            }}
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
            sensitivity={sensitivity}
            thickness={thickness}
            roundness={resolvedRoundness}
        />
    );
}

export default React.memo(Slider);
