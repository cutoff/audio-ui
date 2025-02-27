import React, {useMemo} from 'react';
import AdaptiveSvgComponent from './AdaptiveSvgComponent';
import classNames from 'classnames';
import "../styles.css";

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
type KnobProps = {
    /** Minimum value of the knob */
    min: number;
    /** Maximum value of the knob */
    max: number;
    /** Whether to start the arc from the center (360°) instead of MAX_START_ANGLE */
    center?: boolean;
    /** Current value of the knob */
    value: number;
    /** Label displayed below the knob */
    label?: string;
    /** Content to display inside the knob (replaces the value display) */
    children?: React.ReactNode;
    /** Whether the knob should stretch to fill its container */
    stretch?: boolean;
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
                                 center = false,
                                 value,
                                 label,
                                 children,
                                 stretch = false,
                                 className,
                                 style,
                                 onChange,
                                 onClick
                             }: KnobProps) {
    const valueToAngle = useMemo(() => {
        return ((value - min) / (max - min)) * MAX_ARC_ANGLE + MAX_START_ANGLE;
    }, [value, min, max]);

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
                strokeWidth="12"
                strokeLinecap="round"
                d={calculateArcPath(MAX_START_ANGLE, MAX_END_ANGLE, 40)}
            />

            {/* Foreground Arc */}
            <path
                className="stroke-primary"
                fill="none"
                strokeWidth="12"
                strokeLinecap="round"
                d={calculateArcPath(center ? CENTER_ANGLE : MAX_START_ANGLE, valueToAngle, 40)}
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
                            children ?? value
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
