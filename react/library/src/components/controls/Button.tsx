import React, {useEffect, useMemo, useState} from 'react';
import AdaptiveSvgComponent from '../support/AdaptiveSvgComponent';
import classNames from 'classnames';
import "../../styles.css";
import {Control} from "../types";

/**
 * Props for the Button component
 */
export type ButtonProps = Control & {
    /** Additional CSS class names */
    className?: string;
    /** Additional inline styles. Supports grid layout properties */
    style?: React.CSSProperties;
    /** Click event handler */
    onClick?: React.MouseEventHandler<SVGSVGElement>;
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
 * 
 * This component inherits properties from:
 * - `Stretchable`: For responsive sizing
 * - `Control`: For basic control properties
 * 
 * @property {boolean} stretch - Whether the button should stretch to fill its container (from `Stretchable`)
 * @property {string} label - Label displayed below the button (from `Control`)
 * @property {number} min - Minimum value of the button (from `Control`)
 * @property {number} max - Maximum value of the button (from `Control`)
 * @property {number} value - Current value of the button (from `Control`)
 * @property {number} roundness - Controls the corner style: 0 for square corners, > 0 for rounded corners (from `Control`, defaults to 10)
 * @property {string} className - Additional CSS class names
 * @property {React.CSSProperties} style - Additional inline styles
 * @property {React.MouseEventHandler} onClick - Click event handler
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <Button
 *   value={75}
 *   label="Power"
 *   onClick={handleClick}
 * />
 * 
 * // Grid-aligned stretched button
 * <Button
 *   value={50}
 *   label="Mode"
 *   stretch={true}
 *   style={{ justifySelf: 'center' }}
 *   onClick={handleClick}
 * />
 * ```
 */
export default function Button({
    min = 0,
    max = 100,
    value = 0,
    label,
    stretch = false,
    className,
    style,
    onClick,
    roundness = 10
}: ButtonProps) {
    const [actualCenter, setActualCenter] = useState<number>(50);

    useEffect(() => {
        setActualCenter(Math.floor((max - min + 1) / 2) + min);
    }, [min, max]);

    // Determine if the button is in the "on" state
    const isOn = useMemo(() => {
        return value > actualCenter;
    }, [value, actualCenter]);

    // Determine the button's appearance classes based on state
    const buttonStroke = isOn ? "stroke-primary-50" : "stroke-primary-20";
    const buttonFill = isOn ? "fill-primary" : "fill-primary-50";
    
    // Calculate corner radius based on roundness (ensure non-negative)
    const cornerRadius = useMemo(() => {
        const nonNegativeRoundness = Math.max(0, roundness); // Clamp to non-negative values
        return nonNegativeRoundness === 0 ? 0 : nonNegativeRoundness; // Use 0 for square corners, roundness for rounded corners
    }, [roundness]);

    return (
        <AdaptiveSvgComponent
            viewBoxWidth={100}
            viewBoxHeight={200}
            preferredWidth={75}
            preferredHeight={150}
            stretch={stretch}
            className={classNames(
                className,
                "cutoffAudioKit",
                onClick ? "highlight" : ""
            )}
            style={style}
            onClick={onClick}
        >
            {/* Button Rectangle */}
            <rect 
                className={`${buttonStroke} ${buttonFill}`}
                strokeWidth="5"
                x={10}
                y={110}
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
                    y="192" 
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
