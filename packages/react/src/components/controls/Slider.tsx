"use client";

import React, { useMemo } from "react";
import classNames from "classnames";
import { BipolarControl, ExplicitRange } from "../types";
import { sliderSizeMap } from "../utils/sizeMappings";
import { useThemableProps } from "../theme/AudioUiProvider";
import AdaptiveBox from "../primitives/AdaptiveBox";
import SvgSlider from "../theme/SvgSlider";
import { CLASSNAMES } from "../../styles/classNames";
import { AudioParameterFactory, ContinuousParameter } from "../../models/AudioParameter";
import { useAudioParameter } from "../../hooks/useAudioParameter";
import { useInteractiveControl } from "../../hooks/useInteractiveControl";

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
const Slider = ({
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
}: SliderProps) => {
    // Use the themable props hook to resolve color and roundness with proper fallbacks
    const { resolvedColor, resolvedRoundness } = useThemableProps(
        { color, roundness },
        { color: undefined, roundness: undefined }
    );

    // Construct the configuration object either from the prop or from the ad-hoc props
    const paramConfig = useMemo<ContinuousParameter>(() => {
        if (parameter) {
            if (parameter.type !== "continuous") {
                console.error("Slider component only supports continuous parameters.");
            }
            return parameter;
        }

        // Ad-hoc / Unmapped Mode (Implies Continuous)
        return AudioParameterFactory.createControl({
            id: paramId ?? "adhoc-slider",
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
        adjustValue
    } = useAudioParameter(value, onChange, paramConfig);

    // Use the interactive control hook for unified event handling
    const interactiveProps = useInteractiveControl({
        adjustValue,
        interactionMode: interactionMode ?? "both",
        direction: orientation,
        sensitivity,
    });

    // Memoize the classNames calculation
    const componentClassNames = useMemo(() => {
        return classNames(className, CLASSNAMES.root, CLASSNAMES.container, onChange ? CLASSNAMES.highlight : "");
    }, [className, onChange]);

    // Get the preferred dimensions based on the size prop and orientation
    const { width: preferredWidth, height: preferredHeight } = sliderSizeMap[size][orientation];

    // Determine viewBox dimensions based on orientation from the SVG component
    const viewBoxWidth = SvgSlider.viewBox[orientation].width;
    const viewBoxHeight = SvgSlider.viewBox[orientation].height;

    // Determine minimum dimensions based on orientation
    const minWidth = orientation === "vertical" ? 20 : 60;
    const minHeight = orientation === "vertical" ? 60 : 20;

    const labelHeightUnits = orientation === "vertical" ? 40 : 40;

    // Determine label to display
    const effectiveLabel = label ?? (parameter ? paramConfig.name : undefined);

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
            labelHeightUnits={labelHeightUnits}
            minWidth={minWidth}
            minHeight={minHeight}
        >
            <AdaptiveBox.Svg
                viewBoxWidth={viewBoxWidth}
                viewBoxHeight={viewBoxHeight}
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
                aria-valuemin={paramConfig.min}
                aria-valuemax={paramConfig.max}
                aria-label={effectiveLabel}
                aria-orientation={orientation}
            >
                <SvgSlider
                    normalizedValue={normalizedValue}
                    bipolar={bipolar}
                    orientation={orientation}
                    thickness={thickness}
                    roundness={resolvedRoundness}
                    color={resolvedColor}
                />
            </AdaptiveBox.Svg>
            {effectiveLabel && <AdaptiveBox.Label align="center">{effectiveLabel}</AdaptiveBox.Label>}
        </AdaptiveBox>
    );
};

export default React.memo(Slider);
