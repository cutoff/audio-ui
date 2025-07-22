import React, {useCallback, useMemo} from 'react';
import AdaptiveSvgComponent from '../support/AdaptiveSvgComponent';
import classNames from 'classnames';
import "../../styles.css";
import {BipolarControl} from "../types";

/**
 * Angular constants for the knob's arc
 */
const MAX_START_ANGLE = 220;
const MAX_END_ANGLE = 500;
const MAX_ARC_ANGLE = MAX_END_ANGLE - MAX_START_ANGLE;
const CENTER_ANGLE = 360;

/**
 * Props for the Knob component
 */
export type KnobProps = BipolarControl & {
    /** Content to display inside the knob (replaces the value display) */
    children?: React.ReactNode;
    /** Additional CSS classes */
    className?: string;
    /** Additional inline styles */
    style?: React.CSSProperties;
    /** Handler for value changes via wheel input */
    onChange?: (value: number | ((prev: number) => number)) => void;
    /** Handler for click events */
    onClick?: React.MouseEventHandler;
};

/**
 * Calculate SVG arc path
 */
const calculateArcPath = (startAngle: number, endAngle: number, radius: number): string => {
    if (startAngle > endAngle) {
        [startAngle, endAngle] = [endAngle, startAngle];
    }
    const start = polarToCartesian(50, 50, radius, endAngle);
    const end = polarToCartesian(50, 50, radius, startAngle);
    const largeArcFlag = (endAngle - startAngle) <= 180 ? '0' : '1';
    return [
        'M', start.x, start.y,
        'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(' ');
};

/**
 * Convert polar coordinates to Cartesian
 */
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
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
 * @property {React.ReactNode} children - Content to display inside the knob (replaces the value display)
 * @property {string} className - Additional CSS classes
 * @property {React.CSSProperties} style - Additional inline styles
 * @property {Function} onChange - Handler for value changes via wheel input
 * @property {React.MouseEventHandler} onClick - Handler for click events
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
export default function Knob({
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
                                 onClick,
                                 roundness = 12
                             }: KnobProps) {

    const valueToAngle = useMemo(() => {
        return ((value - min) / (max - min)) * MAX_ARC_ANGLE + MAX_START_ANGLE;
    }, [value, min, max]);
    
    // Fixed stroke width of 12
    const strokeWidth = 12;
    
    // Determine stroke linecap based on roundness (square if 0, round if > 0)
    // Ensure roundness is non-negative
    const nonNegativeRoundness = Math.max(0, roundness);
    const strokeLinecap = nonNegativeRoundness === 0 ? 'square' : 'round';

    /**
     * Memoized function to format value based on bipolar mode
     * If bipolar is true, returns the value prefixed by its sign (+ or -)
     * Otherwise, returns the number as a string
     */
    const formatValueFn = useCallback((val: number): string => {
        return bipolar && val > 0 ? `+${val}` : val.toString();
    }, [bipolar]);

    const handleWheel = (e: WheelEvent) => {
        if (!onChange) return;
        const delta = e.deltaY;
        onChange((currentValue: number) => {
            return Math.max(min, Math.min(currentValue + delta, max));
        });
    };

    return (
        <AdaptiveSvgComponent
            stretch={stretch}
            className={classNames(
                className,
                "cutoffAudioKit",
                "componentContainer",
                onChange || onClick ? "highlight" : ""
            )}
            style={style}
            viewBoxWidth={100}
            viewBoxHeight={115}
            preferredWidth={75}
            onWheel={onChange ? handleWheel : undefined}
            onClick={onClick}
        >
            {/* Background Arc */}
            <path
                className="stroke-primary-50"
                fill="none"
                strokeWidth={strokeWidth}
                strokeLinecap={strokeLinecap}
                d={calculateArcPath(MAX_START_ANGLE, MAX_END_ANGLE, 40)}
            />

            {/* Foreground Arc */}
            <path
                className="stroke-primary"
                fill="none"
                strokeWidth={strokeWidth}
                strokeLinecap={strokeLinecap}
                d={calculateArcPath(bipolar ? CENTER_ANGLE : MAX_START_ANGLE, valueToAngle, 40)}
            />

            {/* Value Display */}
            <foreignObject style={{cursor: "inherit"}} x="20" y="22" width="60" height="60">
                <React.Fragment>
                    <div style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "22px",
                        maxWidth: '100%',
                        maxHeight: '100%',
                        fontWeight: "500",
                        cursor: "inherit"
                    }}>
                        {React.isValidElement(children) && children.type === 'img' ? (
                            <div style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '10px',
                                cursor: "inherit"
                            }}>
                                {React.cloneElement(children, {
                                    style: {
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        cursor: "inherit"
                                    }
                                } as React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>)}
                            </div>
                        ) : (
                            formatValueFn(value)
                        )}
                    </div>
                </React.Fragment>
            </foreignObject>

            {/* Label */}
            {label && (
                <text
                    style={{cursor: "inherit"}}
                    className="fill-text"
                    x="50"
                    y="110"
                    fontSize="18"
                    fontWeight="500"
                    textAnchor="middle"
                >
                    {label}
                </text>
            )}
        </AdaptiveSvgComponent>
    );
}
