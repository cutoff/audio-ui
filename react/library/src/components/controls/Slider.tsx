"use client";

import React, { useCallback, useMemo } from "react";
import classNames from "classnames";
import { BipolarControl, ExplicitRange } from "../types";
import { sliderSizeMap } from "../utils/sizeMappings";
import { useThemableProps } from "../providers/AudioUiProvider";
import AdaptiveBox from "../support/AdaptiveBox";
import SvgSlider from "../svg/SvgSlider";

/**
 * Props for the Slider component
 */
export type SliderProps = BipolarControl &
    ExplicitRange & {
        /** Orientation of the slider
         * @default 'vertical' */
        orientation?: "horizontal" | "vertical";
        /** Thickness of the slider in pixels
         * @default 20 */
        thickness?: number;
    };

// @ts-ignore
/**
 * A vertical slider component for audio applications.
 *
 * Features:
 * - Supports both unidirectional (min to max) and bidirectional (center-based) modes
 * - Mouse wheel interaction for value adjustment
 * - Customizable thickness
 * - Optional stretch behavior to fill container
 * - Grid layout compatible
 * - Visual feedback for interactive state
 * - Configurable corner/cap style (square or round)
 *
 * The slider consists of a background track with a filled portion indicating the current value.
 * When a center point is specified, the fill originates from the center point rather than
 * the minimum value.
 *
 * This component inherits properties from:
 * - `Stretchable`: For responsive sizing
 * - `Control`: For basic control properties
 * - `BipolarControl`: For bipolar mode support
 *
 * @property {boolean} stretch - Whether the slider should stretch to fill its container (from `Stretchable`)
 * @property {string} label - Label displayed below the slider (from `Control`)
 * @property {number} min - Minimum value of the slider (from `Control`)
 * @property {number} max - Maximum value of the slider (from `Control`)
 * @property {number} value - Current value of the slider (from `Control`)
 * @property {boolean} bipolar - Whether to start the fill from the center instead of minimum (from `BipolarControl`)
 * @property {number} roundness - Controls the corner style: 0 for square corners, > 0 for rounded corners (from `Control`, defaults to half the slider width)
 * @property {number} thickness - Thickness of the slider in pixels (defaults to 20)
 * @property {string} className - Additional CSS class names
 * @property {React.CSSProperties} style - Additional inline styles
 * @property {Function} onChange - Handler for value changes
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Slider
 *   min={0}
 *   max={100}
 *   value={50}
 *   label="Volume"
 *   onChange={handleChange}
 * />
 *
 * // Center-based slider
 * <Slider
 *   min={-50}
 *   max={50}
 *   center={0}
 *   value={25}
 *   label="Pan"
 *   onChange={handleChange}
 * />
 *
 * // Grid-aligned stretched slider
 * <Slider
 *   min={0}
 *   max={100}
 *   value={75}
 *   label="Level"
 *   stretch={true}
 *   style={{ justifySelf: 'center' }}
 * />
 * ```
 */
const Slider = ({
    orientation = "vertical",
    min,
    max,
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
}: SliderProps) => {
    // Use the themable props hook to resolve color and roundness with proper fallbacks
    // For Slider, the default roundness is dynamic based on dimensions, so we pass undefined
    const { resolvedColor, resolvedRoundness } = useThemableProps(
        { color, roundness },
        { color: undefined, roundness: undefined }
    );

    // Calculate normalized value (0 to 1)
    const normalizedValue = useMemo(() => {
        return (value - min) / (max - min);
    }, [value, min, max]);

    /**
     * Wheel event handler that adjusts the slider value if onChange is defined
     * and the event hasn't been prevented by a user handler
     */
    const handleWheel = useCallback(
        (e: WheelEvent) => {
            // Only adjust the value if onChange is defined and the event hasn't been prevented
            if (onChange && !e.defaultPrevented) {
                const delta = e.deltaY;
                onChange((currentValue: number) => {
                    return Math.max(min, Math.min(currentValue + delta, max));
                });
            }
        },
        [onChange, min, max]
    );

    // Memoize the classNames calculation
    const componentClassNames = useMemo(() => {
        return classNames(className, "cutoffAudioKit", onChange ? "highlight" : "");
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
            {label && <AdaptiveBox.Label align="center">{label}</AdaptiveBox.Label>}
        </AdaptiveBox>
    );
};

// Wrap the component in React.memo to prevent unnecessary re-renders
export default React.memo(Slider);
