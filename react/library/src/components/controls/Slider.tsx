"use client";

import React, { useCallback, useMemo } from "react";
import classNames from "classnames";
import { BipolarControl, ExplicitRange } from "../types";
import { sliderSizeMap } from "../utils/sizeMappings";
import { generateColorVariants } from "../utils/colorUtils";
import { useThemableProps } from "../providers/AudioUiProvider";
import AdaptiveBox from "../support/AdaptiveBox";

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

/**
 * Represents the dimensions and position of a rectangular zone within the SVG
 */
type Zone = {
    /** X coordinate of the zone */
    x: number;
    /** Y coordinate of the zone */
    y: number;
    /** Width of the zone */
    w: number;
    /** Height of the zone */
    h: number;
};

/**
 * Represents the dimensions of the filled portion of the slider
 */
type FilledZone = {
    /** X coordinate where the fill starts (for horizontal) */
    x?: number;
    /** Y coordinate where the fill starts (for vertical) */
    y?: number;
    /** Width of the filled area (for horizontal) */
    w?: number;
    /** Height of the filled area (for vertical) */
    h?: number;
};

/**
 * Helper function to calculate a bounded ratio between 0 and 1
 *
 * @param value The value to convert to a ratio
 * @param min The minimum value (corresponds to ratio = 0)
 * @param max The maximum value (corresponds to ratio = 1)
 * @returns A ratio between 0 and 1 representing where value falls in the min-max range
 */
const calculateBoundedRatio = (value: number, min: number, max: number): number => {
    // Ensure value is within bounds
    const boundedValue = Math.max(min, Math.min(value, max));
    // Calculate ratio and ensure it's between 0 and 1
    const ratio = (boundedValue - min) / (max - min);
    return Math.max(0, Math.min(ratio, 1));
};

/**
 * Calculates the filled zone dimensions for a slider
 *
 * This function determines how to draw the filled portion of a slider based on:
 * - The slider's orientation (horizontal or vertical)
 * - Whether it's in bipolar mode (has a center point)
 * - The current value relative to min, max, and center
 *
 * @param mainZone The dimensions of the slider's background
 * @param value The current value (will be bounded to min-max range)
 * @param min The minimum value
 * @param max The maximum value
 * @param center Optional center point for bipolar mode
 * @param isHorizontal Whether the slider is horizontal (false = vertical)
 * @returns Dimensions of the filled portion (x,w for horizontal; y,h for vertical)
 *
 * For horizontal sliders:
 * - Normal mode: Fills from left edge, growing rightward as value increases
 * - Bipolar mode:
 *   - When value > center: Fills from center, growing rightward
 *   - When value < center: Fills from center, growing leftward (DJ crossfader style)
 *
 * For vertical sliders:
 * - Normal mode: Fills from bottom edge, growing upward as value increases
 * - Bipolar mode:
 *   - When value > center: Fills from center, growing upward
 *   - When value < center: Fills from center, growing downward
 */
const computeFilledZone = (
    mainZone: Zone,
    value: number,
    min: number,
    max: number,
    center?: number,
    isHorizontal: boolean = false
): FilledZone => {
    // Ensure value is within bounds (min-max range)
    const boundedValue = Math.max(min, Math.min(value, max));

    // Select the dimension and position properties based on orientation
    const dimension = isHorizontal ? mainZone.w : mainZone.h;
    const position = isHorizontal ? mainZone.x : mainZone.y;

    // Normal mode (no center point)
    if (center === undefined) {
        // Calculate the ratio and size
        const ratio = calculateBoundedRatio(boundedValue, min, max);
        const size = dimension * ratio;

        if (isHorizontal) {
            // Horizontal: Fill from left to right
            return {
                x: position,
                w: size,
            };
        } else {
            // Vertical: Fill from bottom to top (inverted position)
            return {
                y: position + (dimension - size),
                h: size,
            };
        }
    }

    // Bipolar mode calculations
    const halfSize = dimension / 2;
    const centerPoint = position + halfSize;

    if (boundedValue >= center) {
        // Value >= center (right/upper half)
        const bipolarRatio = calculateBoundedRatio(boundedValue, center, max);
        const bipolarSize = halfSize * bipolarRatio;

        if (isHorizontal) {
            // Horizontal: Fill from center to right
            return {
                x: centerPoint,
                w: bipolarSize,
            };
        } else {
            // Vertical: Fill from center to top (inverted position)
            return {
                y: position + (halfSize - bipolarSize),
                h: bipolarSize,
            };
        }
    } else {
        // Value < center (left/lower half)
        // For this case, we need to invert the ratio because:
        // - When value = min: We want bipolarRatio = 1 (maximum fill)
        // - When value = center: We want bipolarRatio = 0 (minimum fill)
        // The inversion (1 - ratio) achieves this transformation efficiently
        const bipolarRatio = 1 - calculateBoundedRatio(boundedValue, min, center);
        const bipolarSize = halfSize * bipolarRatio;

        if (isHorizontal) {
            // Horizontal: Fill from center to left (DJ crossfader style)
            return {
                x: centerPoint - bipolarSize,
                w: bipolarSize,
            };
        } else {
            // Vertical: Fill from center to bottom
            return {
                y: centerPoint,
                h: bipolarSize,
            };
        }
    }
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
        { color: "blue", roundness: undefined }
    );

    // Ensure thickness is non-negative
    const nonNegativeThickness = Math.max(0, thickness);

    // Calculate the dimensions of the slider's main zone based on orientation and thickness
    const mainZone = useMemo<Zone>(() => {
        if (orientation === "vertical") {
            // Center the slider based on its thickness
            const x = 50 - nonNegativeThickness / 2;
            return {
                x,
                y: 20,
                w: nonNegativeThickness,
                h: 330,
            };
        } else {
            // For horizontal orientation
            const y = 50 - nonNegativeThickness / 2;
            return {
                x: 20,
                y,
                w: 330,
                h: nonNegativeThickness,
            };
        }
    }, [nonNegativeThickness, orientation]);

    // Calculate the dimensions of the filled portion based on current value and orientation
    const filledZone = useMemo<FilledZone>(() => {
        const normalizedValue = Math.min(Math.max(value, min), max);
        const normalizedCenter = bipolar ? Math.floor((max - min + 1) / 2) + min : undefined;

        return computeFilledZone(mainZone, normalizedValue, min, max, normalizedCenter, orientation === "horizontal");
    }, [min, max, value, bipolar, mainZone, orientation]);

    // Calculate corner radius based on roundness
    const cornerRadius = useMemo(() => {
        // Ensure roundness is non-negative
        const nonNegativeRoundness = resolvedRoundness !== undefined ? Math.max(0, resolvedRoundness) : undefined;

        // If roundness is 0, use square caps (cornerRadius = 0)
        if (nonNegativeRoundness === 0) {
            return 0; // No rounding for square caps
        }

        // Use provided roundness or fall back to half the thickness for fully rounded corners
        const dimension = orientation === "vertical" ? mainZone.w : mainZone.h;
        return nonNegativeRoundness !== undefined ? nonNegativeRoundness : dimension / 2;
    }, [mainZone, resolvedRoundness, orientation]);

    // Generate color variants using the centralized utility
    const colorVariants = useMemo(() => {
        return generateColorVariants(resolvedColor, "transparency");
    }, [resolvedColor]);

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
    const { width: preferredWidth } = sliderSizeMap[size][orientation];

    // Determine viewBox dimensions based on orientation
    const viewBoxWidth = orientation === "vertical" ? 100 : 400;
    const viewBoxHeight = orientation === "vertical" ? 400 : 100;

    // Determine minimum dimensions based on orientation
    const minWidth = orientation === "vertical" ? 20 : 60;
    const minHeight = orientation === "vertical" ? 60 : 20;

    return (
        <AdaptiveBox
            displayMode="scaleToFit"
            className={componentClassNames}
            style={{
                ...(style ?? {}),
                ...(stretch ? {} : { width: `${preferredWidth}px` }),
            }}
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
                {/* Background Rectangle */}
                <rect
                    style={{ fill: colorVariants.primary50 }}
                    x={mainZone.x}
                    y={mainZone.y}
                    width={mainZone.w}
                    height={mainZone.h}
                    rx={cornerRadius}
                    ry={cornerRadius}
                />

                {/* Foreground Rectangle */}
                <rect
                    style={{ fill: colorVariants.primary }}
                    x={orientation === "horizontal" ? filledZone.x : mainZone.x}
                    y={orientation === "vertical" ? filledZone.y : mainZone.y}
                    width={orientation === "horizontal" ? filledZone.w : mainZone.w}
                    height={orientation === "vertical" ? filledZone.h : mainZone.h}
                    rx={cornerRadius}
                    ry={cornerRadius}
                />

                {/* Label Text */}
                {label && (
                    <text
                        style={{ fill: "var(--text-color)" }}
                        textAnchor="middle"
                        x={orientation === "vertical" ? "50" : "200"}
                        y={orientation === "vertical" ? "393" : "93"}
                        fontSize="30"
                        fontWeight="500"
                    >
                        {label}
                    </text>
                )}
            </AdaptiveBox.Svg>
        </AdaptiveBox>
    );
};

// Wrap the component in React.memo to prevent unnecessary re-renders
export default React.memo(Slider);
