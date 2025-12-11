"use client";

import React from "react";
import classNames from "classnames";
import { getSizeClassForComponent, getSizeStyleForComponent } from "../utils/sizeMappings";
import { useThemableProps } from "../theme/AudioUiProvider";
import { SvgVerticalSlider, SvgHorizontalSlider } from "../theme/SvgSlider";
import SvgContinuousControl from "../primitives/SvgContinuousControl";
import { ContinuousControlProps, Themable } from "../types";

/**
 * Props for the Slider component (built-in control with theming support)
 */
export type SliderProps = ContinuousControlProps &
    Themable & {
    /** Orientation of the slider
     * @default 'vertical' */
    orientation?: "horizontal" | "vertical";
    /** Thickness of the slider in pixels
     * @default 20 */
    thickness?: number;
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

    // Get the size class name based on the size prop and orientation
    const sizeClassName = stretch ? undefined : getSizeClassForComponent("slider", size, orientation);

    // Merge class names: size class first, then user className (user takes precedence)
    const mergedClassName = classNames(sizeClassName, className);

    // Build merged style: size style (when not stretching), then user style (user takes precedence)
    const sizeStyle = stretch ? undefined : getSizeStyleForComponent("slider", size, orientation);

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
            sensitivity={sensitivity}
            thickness={thickness}
            roundness={resolvedRoundness}
        />
    );
}

export default React.memo(Slider);
