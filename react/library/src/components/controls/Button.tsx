"use client";

import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import AdaptiveSvgComponent from '../support/AdaptiveSvgComponent';
import classNames from 'classnames';
import "../../styles.css";
import {Control, ExplicitRange} from "../types";
import {buttonSizeMap} from "../utils/sizeMappings";

/**
 * Props for the Button component
 */
export type ButtonProps = Control & ExplicitRange & {
    /** Whether the button should latch (toggle between states) or momentary (only active while pressed) */
    latch?: boolean;
};

/**
 * A button component for audio applications.
 * 
 * Features:
 * - Supports value-based appearance changes
 * - Responsive sizing with stretch option
 * - Grid layout compatible
 * - Visual feedback for interactive state
 * - Configurable corner/cap style (square or round)
 * - Clickable with latch or momentary behavior
 * 
 * This component inherits properties from:
 * - `Stretchable`: For responsive sizing
 * - `Control`: For basic control properties
 * - `InteractiveControl`: For interactive behavior (onChange)
 * 
 * @property {boolean} stretch - Whether the button should stretch to fill its container (from `Stretchable`)
 * @property {string} label - Label displayed below the button (from `Control`)
 * @property {number} min - Minimum value of the button (from `Control`)
 * @property {number} max - Maximum value of the button (from `Control`)
 * @property {number} value - Current value of the button (from `Control`)
 * @property {number} roundness - Controls the corner style: 0 for square corners, > 0 for rounded corners (from `Control`, defaults to 10)
 * @property {Function} onChange - Handler for value changes. When provided, makes the button clickable and interactive. If not provided, the button is not editable. (from `InteractiveControl`)
 * @property {boolean} latch - Whether the button should latch (toggle between states) or momentary (only active while pressed). Defaults to false.
 * 
 * @example
 * ```tsx
 * // Non-interactive button (display only)
 * <Button
 *   value={75}
 *   label="Power"
 * />
 * 
 * // Interactive button with latch behavior
 * <Button
 *   value={75}
 *   label="Power"
 *   onChange={setValue}
 *   latch={true}
 * />
 * 
 * // Interactive button with momentary behavior
 * <Button
 *   value={0}
 *   label="Trigger"
 *   onChange={setValue}
 *   latch={false}
 * />
 * 
 * // Grid-aligned stretched button
 * <Button
 *   value={50}
 *   label="Mode"
 *   stretch={true}
 *   style={{ justifySelf: 'center' }}
 *   onChange={setValue}
 * />
 * ```
 */
function Button({
    min = 0,
    max = 100,
    value = 0,
    label,
    stretch = false,
    className,
    style,
    onChange,
    latch = false,
    roundness = 10,
    size = 'normal'
}: ButtonProps) {
    // Ref to track if the button is currently pressed (for momentary mode)
    const isPressedRef = useRef(false);
    
    // Calculate the center value based on min and max
    const actualCenter = useMemo(() => {
        return Math.floor((max - min + 1) / 2) + min;
    }, [min, max]);

    // Determine if the button is in the "on" state
    const isOn = useMemo(() => {
        return value > actualCenter;
    }, [value, actualCenter]);

    // Determine the button's appearance classes based on state
    const buttonClasses = useMemo(() => {
        const stroke = isOn ? "stroke-primary-50" : "stroke-primary-20";
        const fill = isOn ? "fill-primary" : "fill-primary-50";
        return { stroke, fill };
    }, [isOn]);
    
    // Calculate corner radius based on roundness (ensure non-negative)
    const cornerRadius = useMemo(() => {
        const nonNegativeRoundness = Math.max(0, roundness); // Clamp to non-negative values
        return nonNegativeRoundness === 0 ? 0 : nonNegativeRoundness; // Use 0 for square corners, roundness for rounded corners
    }, [roundness]);

    // Handle mouse down events to toggle the button state or set to max value
    const handleMouseDown = useCallback((_e: React.MouseEvent) => {
        // If onChange is provided, handle the button state
        if (onChange) {
            if (latch) {
                // For latch buttons, toggle between min and max values
                const newValue = isOn ? min : max;
                onChange(newValue);
            } else {
                // For non-latch buttons, set to max value and mark as pressed
                isPressedRef.current = true;
                onChange(max);
            }
        }
    }, [onChange, latch, isOn, min, max]);
    
    // Handle mouse up event for both latch and non-latch buttons
    const handleMouseUp = useCallback(() => {
        // For non-latch buttons, reset to min value if the button is pressed
        if (onChange && !latch && isPressedRef.current) {
            isPressedRef.current = false;
            onChange(min);
        }
        // For latch buttons, do nothing (the toggle happens on mouseDown)
    }, [onChange, latch, min]);
    
    // Memoize the global mouseup handler to ensure consistent function reference
    // This is important for proper cleanup when dependencies change
    const handleGlobalMouseUp = useCallback(() => {
        if (isPressedRef.current) {
            isPressedRef.current = false;
            onChange?.(min);
        }
    }, [onChange, min]);
    
    // Set up global mouseup event listener for momentary buttons
    useEffect(() => {
        // Only add the global listener if this is a momentary button with onChange handler
        if (!latch && onChange) {
            // Add global mouseup listener
            window.addEventListener('mouseup', handleGlobalMouseUp);
            
            // Clean up
            return () => {
                window.removeEventListener('mouseup', handleGlobalMouseUp);
            };
        }
        // Return undefined for the case when we don't add a listener
        // This fixes the TypeScript warning: TS7030: Not all code paths return a value
        return undefined;
    }, [latch, onChange, handleGlobalMouseUp]); // Use memoized function in dependencies
    
    // Memoize the classNames calculation
    const componentClassNames = useMemo(() => {
        return classNames(
            className,
            "cutoffAudioKit",
            onChange ? "highlight" : ""
        );
    }, [className, onChange]);

    // Get the preferred dimensions based on the size prop
    const { width: preferredWidth, height: preferredHeight } = buttonSizeMap[size];

    return (
        <AdaptiveSvgComponent
            viewBoxWidth={100}
            viewBoxHeight={100}
            preferredWidth={preferredWidth}
            preferredHeight={preferredHeight}
            minWidth={20}
            minHeight={40}
            stretch={stretch}
            className={componentClassNames}
            style={style}
            onMouseDown={onChange ? handleMouseDown : undefined}
            onMouseUp={onChange ? handleMouseUp : undefined}
        >
            {/* Button Rectangle */}
            <rect 
                className={`${buttonClasses.stroke} ${buttonClasses.fill}`}
                strokeWidth="5"
                x={10}
                y={10}
                width={80}
                height={40}
                rx={cornerRadius}
                ry={cornerRadius}
            />
            
            {/* Label Text */}
            {label && (
                <text 
                    className="fill-text" 
                    x="50" 
                    y="88"
                    fontSize="30"
                    fontWeight="500" 
                    textAnchor="middle"
                >
                    {label}
                </text>
            )}
        </AdaptiveSvgComponent>
    );
}

// Wrap the component in React.memo to prevent unnecessary re-renders
export default React.memo(Button);
