"use client";

import React from "react";
import classNames from "classnames";
import { getSizeClassForComponent, getSizeStyleForComponent } from "@cutoff/audio-ui-core";
import { useThemableProps } from "../theme/AudioUiProvider";
import { SvgVerticalSlider, SvgHorizontalSlider } from "../theme/SvgSlider";
import SvgContinuousControl from "../primitives/SvgContinuousControl";
import { AdaptiveBoxProps, AdaptiveSizeProps, ContinuousControlProps, ThemableProps } from "../types";
import { clampNormalized } from "@cutoff/audio-ui-core";
import { DEFAULT_ROUNDNESS } from "@cutoff/audio-ui-core";

/**
 * Props for the Slider component (built-in control with theming support)
 */
export type SliderProps = ContinuousControlProps &
    AdaptiveSizeProps &
    AdaptiveBoxProps &
    ThemableProps & {
        /** Orientation of the slider
         * @default 'vertical' */
        orientation?: "horizontal" | "vertical";
        /** Thickness of the slider (normalized 0.0-1.0, maps to 1-50)
         * @default 0.4 */
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
    onChange,
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
    interactionMode,
    sensitivity,
    onClick,
    onMouseDown,
    onMouseUp,
    onMouseEnter,
    onMouseLeave,
    className,
    style,
}: SliderProps) {
    // Use the themable props hook to resolve color and roundness with proper fallbacks
    // Clamp values to 0.0-1.0 range
    const clampedRoundness = roundness !== undefined ? clampNormalized(roundness) : undefined;
    const clampedThickness = clampNormalized(thickness);
    const { resolvedColor, resolvedRoundness } = useThemableProps(
        { color, roundness: clampedRoundness },
        { color: undefined, roundness: DEFAULT_ROUNDNESS }
    );

    // Determine sizing behavior: adaptiveSize controls stretch behavior and
    // takes precedence over size when both are provided.
    const isStretch = adaptiveSize === true;

    // Get the size class name based on the size prop and orientation
    const sizeClassName = isStretch ? undefined : getSizeClassForComponent("slider", size, orientation);

    // Merge class names: size class first, then user className (user takes precedence)
    const mergedClassName = classNames(sizeClassName, className);

    // Build merged style: size style (when not stretching), then user style (user takes precedence)
    const sizeStyle = isStretch ? undefined : getSizeStyleForComponent("slider", size, orientation);

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
            sensitivity={sensitivity}
            thickness={clampedThickness}
            roundness={resolvedRoundness ?? DEFAULT_ROUNDNESS}
        />
    );
}

export default React.memo(Slider);
