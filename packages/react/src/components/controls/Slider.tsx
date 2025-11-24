"use client";

import React, { useCallback, useMemo } from "react";
import classNames from "classnames";
import { BipolarControl, ExplicitRange } from "../types";
import { sliderSizeMap } from "../utils/sizeMappings";
import { useThemableProps } from "../providers/AudioUiProvider";
import AdaptiveBox from "../AdaptiveBox";
import SvgSlider from "../svg/SvgSlider";
import { CLASSNAMES } from "../../styles/classNames";
import { ContinuousParameter } from "../../models/AudioParameter";
import { useAudioParam } from "../../hooks/useAudioParam";

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

// @ts-ignore
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
    paramId: _paramId,
    onClick,
    onMouseDown,
    onMouseUp,
    onMouseEnter,
    onMouseLeave,
    color,
    parameter,
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
        return {
            id: "adhoc-slider",
            type: "continuous",
            name: label || "",
            min: min ?? 0,
            max: max ?? 100,
            step: step,
            unit: "",
            defaultValue: min ?? 0,
            midiResolution: 7
        };
    }, [parameter, min, max, step, label]);

    // Calculate sensitivity to match legacy behavior
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
        adjustValue
    } = useAudioParam(value, onChange ? handleChange : undefined, paramConfig);

    /**
     * Wheel event handler that adjusts the slider value
     */
    const handleWheel = useCallback(
        (e: WheelEvent) => {
            if (onChange && !e.defaultPrevented) {
                // Use positive deltaY to match previous behavior
                adjustValue(e.deltaY, sensitivity);
            }
        },
        [onChange, adjustValue, sensitivity]
    );

    // Memoize the classNames calculation
    const componentClassNames = useMemo(() => {
        return classNames(className, CLASSNAMES.root, onChange ? CLASSNAMES.highlight : "");
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

    return (
        <AdaptiveBox
            displayMode="scaleToFit"
            className={componentClassNames}
            style={{
                ...(style ?? {}),
                ...(stretch ? {} : { width: `${preferredWidth}px`, height: `${preferredHeight}px` }),
            }}
            labelHeightUnits={labelHeightUnits}
            minWidth={minWidth}
            minHeight={minHeight}
        >
            <AdaptiveBox.Svg
                viewBoxWidth={viewBoxWidth}
                viewBoxHeight={viewBoxHeight}
                onWheel={handleWheel}
                onClick={onClick}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
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
