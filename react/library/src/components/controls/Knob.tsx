"use client";

import React, { useCallback, useMemo } from "react";
import classNames from "classnames";
import "../../styles.css";
import { BipolarControl, ExplicitRange } from "../types";
import { knobSizeMap } from "../utils/sizeMappings";
import { bipolarFormatter } from "../utils/valueFormatters";
import { useThemableProps } from "../providers/AudioUiProvider";
import AdaptiveBox from "../support/AdaptiveBox";
import SvgKnob from "../svg/SvgKnob";

/**
 * Props for the Knob component
 */
export type KnobProps = BipolarControl &
    ExplicitRange & {
        /** Content to display inside the knob (replaces the value display) */
        children?: React.ReactNode;
        /** Thickness of the knob's stroke
         * @default 12
         */
        thickness?: number;
    };

/**
 * Knob component provides a circular control for value adjustment.
 * Features:
 * - Circular progress indicator with customizable range
 * - Mouse wheel input for value adjustment
 * - Optional centering of the progress arc
 * - Customizable content display
 * - Responsive sizing with stretch option
 * - Configurable corner/cap style (square or round)
 *
 * This component inherits properties from:
 * - `Stretchable`: For responsive sizing
 * - `Control`: For basic control properties
 * - `BipolarControl`: For bipolar mode support
 *
 * @property {boolean} stretch - Whether the knob should stretch to fill its container (from `Stretchable`)
 * @property {string} label - Label displayed below the knob (from `Control`)
 * @property {number} min - Minimum value of the knob (from `Control`)
 * @property {number} max - Maximum value of the knob (from `Control`)
 * @property {number} value - Current value of the knob (from `Control`)
 * @property {boolean} bipolar - Whether to start the arc from the center (360°) instead of MAX_START_ANGLE (from `BipolarControl`)
 * @property {number} roundness - Controls the linecap style: 0 for 'square', > 0 for 'round' (from `Control`, defaults to 12)
 * @property {number} thickness - Thickness of the knob's stroke (defaults to 12)
 * @property {React.ReactNode} children - Content to display inside the knob (replaces the value display)
 * @property {string} className - Additional CSS classes
 * @property {React.CSSProperties} style - Additional inline styles
 * @property {Function} onChange - Handler for value changes via wheel input
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Knob
 *   min={0}
 *   max={100}
 *   value={50}
 *   label="Volume"
 *   onChange={(value) => setVolume(value)}
 * />
 *
 * // With custom content
 * <Knob
 *   min={0}
 *   max={100}
 *   value={50}
 *   label="Custom"
 * >
 *   <img src="icon.svg" alt="Custom icon" />
 * </Knob>
 * ```
 */
function Knob({
    min,
    max,
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
    paramId: _paramId,
    onClick,
    onMouseDown,
    onMouseUp,
    onMouseEnter,
    onMouseLeave,
    color,
}: KnobProps) {
    // Use the themable props hook to resolve color and roundness with proper fallbacks
    const { resolvedColor, resolvedRoundness } = useThemableProps(
        { color, roundness },
        { color: undefined, roundness: 12 }
    );

    // Calculate normalized value (0 to 1)
    const normalizedValue = useMemo(() => {
        return (value - min) / (max - min);
    }, [value, min, max]);

    /**
     * Memoized function to format value based on bipolar mode
     * If bipolar is true, returns the value prefixed by its sign (+ or -)
     * Otherwise, returns the number as a string
     */
    const formatValueFn = useCallback(
        (val: number): string => {
            return bipolar ? bipolarFormatter(val) : val.toString();
        },
        [bipolar]
    );

    /**
     * Wheel event handler that adjusts the knob value if onChange is defined
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
        return classNames(className, "cutoffAudioKit", "componentContainer", onChange ? "highlight" : "");
    }, [className, onChange]);

    // Get the preferred width based on the size prop
    const { width: preferredWidth, height: preferredHeight } = knobSizeMap[size];

    // Prepare the content to display inside the knob
    const knobContent = useMemo(() => {
        if (React.isValidElement(children) && children.type === "img") {
            return (
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "10px",
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
        } else if (renderValue) {
            return renderValue(value, min, max);
        } else if (children) {
            return children;
        } else {
            return formatValueFn(value);
        }
    }, [children, renderValue, value, min, max, formatValueFn]);

    return (
        <AdaptiveBox
            displayMode="scaleToFit"
            className={componentClassNames}
            style={{
                ...(style ?? {}),
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
                    onWheel={handleWheel}
                    onClick={onClick}
                    onMouseDown={onMouseDown}
                    onMouseUp={onMouseUp}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
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

                {label && <AdaptiveBox.Label align="center">{label}</AdaptiveBox.Label>}
            </>
        </AdaptiveBox>
    );
}

// Wrap the component in React.memo to prevent unnecessary re-renders
export default React.memo(Knob);
