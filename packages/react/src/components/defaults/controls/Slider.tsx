"use client";

import React from "react";
import classNames from "classnames";
import { useThemableProps } from "@/defaults/AudioUiProvider";
import { SvgVerticalSlider, SvgHorizontalSlider } from "./SvgSlider";
import ContinuousControl from "@/primitives/controls/ContinuousControl";
import { useAdaptiveSize } from "@/hooks/useAdaptiveSize";
import { AdaptiveBoxProps, AdaptiveSizeProps, ContinuousControlProps, ThemableProps } from "@/types";
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
    thickness = 0.4,
    parameter,
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
}: SliderProps) {
    // Use the themable props hook to resolve color and roundness with proper fallbacks
    // Clamp values to 0.0-1.0 range
    const clampedRoundness = roundness !== undefined ? clampNormalized(roundness) : undefined;
    const clampedThickness = clampNormalized(thickness);
    const { resolvedColor, resolvedRoundness } = useThemableProps(
        { color, roundness: clampedRoundness },
        { color: undefined, roundness: DEFAULT_ROUNDNESS }
    );

    // Get adaptive sizing values
    const { sizeClassName, sizeStyle } = useAdaptiveSize(adaptiveSize, size, "slider", orientation);

    // Merge class names: size class first, then user className (user takes precedence)
    const mergedClassName = classNames(sizeClassName, className);

    // Select the appropriate view component based on orientation
    const ViewComponent = orientation === "vertical" ? SvgVerticalSlider : SvgHorizontalSlider;

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
            className={mergedClassName}
            style={{ ...sizeStyle, ...style }}
            onChange={onChange}
            paramId={paramId}
            onClick={onClick}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            parameter={parameter}
            interactionMode={interactionMode}
            interactionDirection={interactionDirection}
            interactionSensitivity={interactionSensitivity}
            valueFormatter={valueFormatter}
            view={ViewComponent}
            viewProps={{
                color: resolvedColor,
                thickness: clampedThickness,
                roundness: resolvedRoundness ?? DEFAULT_ROUNDNESS,
            }}
        />
    );
}

export default React.memo(Slider);
