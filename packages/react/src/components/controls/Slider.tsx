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
            id: "adhoc-slider",
            type: "continuous",
            name: label || "",
            min: effectiveMin ?? 0,
            max: effectiveMax ?? 100,
            step: step,
            unit: "",
            defaultValue: effectiveDefault,
        };
    }, [parameter, min, max, step, label, bipolar]);

    // Calculate sensitivity for intuitive control response (1:1 mapping between wheel delta and value change)
    const sensitivity = useMemo(() => {
        const range = paramConfig.max - paramConfig.min;
        return range > 0 ? 1 / range : 0.001;
    }, [paramConfig.max, paramConfig.min]);

    // Use the hook to handle all math
    const {
        normalizedValue,
        adjustValue
    } = useAudioParam(value, onChange, paramConfig);

    /**
     * Wheel event handler that adjusts the slider value
     */
    const handleWheel = useCallback(
        (e: WheelEvent) => {
            if (onChange && !e.defaultPrevented) {
                // Positive deltaY increases value (Down = Increase)
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
