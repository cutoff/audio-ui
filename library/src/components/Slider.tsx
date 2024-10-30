import React, { useMemo } from 'react';
import classNames from 'classnames';
import BaseComponent from './BaseComponent';

/**
 * Props for the Slider component
 */
type SliderProps = {
    /** Minimum value of the slider's range */
    min: number;
    /** Maximum value of the slider's range */
    max: number;
    /** Optional center point for bidirectional sliders.
     * When provided, the slider fills from the center point in both directions */
    center?: number;
    /** Current value of the slider */
    value: number;
    /** Text label displayed below the slider */
    label: string;
    /** Size variant of the slider
     * @default 'normal' */
    size?: 'normal' | 'large';
    /** Whether the slider should stretch to fill its container
     * @default false */
    stretch?: boolean;
    /** Additional CSS class names */
    className?: string;
    /** Additional inline styles. Supports grid layout properties */
    style?: React.CSSProperties;
    /** Handler for value changes. Called when the mouse wheel is used */
    onChange?: (value: number | ((prev: number) => number)) => void;
    /** Handler for click events */
    onClick?: React.MouseEventHandler<SVGSVGElement>;
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
 * Represents the vertical dimensions of the filled portion of the slider
 */
type FilledZone = {
    /** Y coordinate where the fill starts */
    y: number;
    /** Height of the filled area */
    h: number;
};

/**
 * Calculates the filled zone dimensions for a slider that fills from minimum value
 */
const computeFilledZoneFromMin = (mainZone: Zone, value: number, min: number, max: number): FilledZone => {
    const ratio = (value - min) / (max - min);
    const height = mainZone.h * ratio;
    return {
        y: mainZone.y + (mainZone.h - height),
        h: height
    };
};

/**
 * Calculates the filled zone dimensions for a slider that fills from a center point
 */
const computeFilledZoneFromCenter = (
    value: number,
    min: number,
    max: number,
    center: number,
    mainZone: Zone
): FilledZone => {
    const halfHeight = mainZone.h / 2;
    const centerY = mainZone.y + halfHeight;

    if (value >= center) {
        const ratio = (value - center) / (max - center);
        const height = halfHeight * ratio;
        return {
            y: mainZone.y + (halfHeight - height),
            h: height
        };
    } else {
        const ratio = value / (center - min);
        const height = halfHeight * ratio;
        return {
            y: centerY,
            h: halfHeight - height
        };
    }
};

/**
 * A vertical slider component for audio applications.
 *
 * Features:
 * - Supports both unidirectional (min to max) and bidirectional (center-based) modes
 * - Mouse wheel interaction for value adjustment
 * - Two size variants: normal and large
 * - Optional stretch behavior to fill container
 * - Grid layout compatible
 * - Visual feedback for interactive state
 *
 * The slider consists of a background track with a filled portion indicating the current value.
 * When a center point is specified, the fill originates from the center point rather than
 * the minimum value.
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
                    min,
                    max,
                    center,
                    value,
                    label,
                    size = 'normal',
                    stretch = false,
                    className,
                    style,
                    onChange,
                    onClick
                }: SliderProps) => {
    // Calculate the dimensions of the slider's main zone based on size variant
    const mainZone = useMemo<Zone>(() => (
        size === 'large'
            ? { x: 30, y: 20, w: 40, h: 330 }
            : { x: 40, y: 20, w: 20, h: 330 }
    ), [size]);

    // Calculate the dimensions of the filled portion based on current value
    const filledZone = useMemo<FilledZone>(() => {
        const normalizedValue = Math.min(Math.max(value, min), max);
        const normalizedCenter = center ?? min;

        return center
            ? computeFilledZoneFromCenter(normalizedValue, min, max, normalizedCenter, mainZone)
            : computeFilledZoneFromMin(mainZone, normalizedValue, min, max);
    }, [min, max, value, center, mainZone]);

    // Handle mouse wheel events to change the value
    const handleWheel = (e: WheelEvent) => {
        if (!onChange) return;

        const delta = e.deltaY;
        onChange((currentValue: number) => {
            return Math.max(min, Math.min(currentValue + delta, max));
        });
    };

    return (
        <BaseComponent
            viewBoxWidth={100}
            viewBoxHeight={400}
            preferredWidth={40}
            preferredHeight={160}
            minWidth={20}
            minHeight={60}
            stretch={stretch}
            className={classNames(
                className,
                'cutoffAudioKit',
                (onChange || onClick) ? 'highlight' : ''
            )}
            style={style}
            onWheel={onChange ? handleWheel : undefined}
            onClick={onClick}
        >
            {/* Background Rectangle */}
            <rect
                className="fill-primary-50"
                x={mainZone.x}
                y={mainZone.y}
                width={mainZone.w}
                height={mainZone.h}
            />

            {/* Foreground Rectangle */}
            <rect
                className="fill-primary"
                x={mainZone.x}
                y={filledZone.y}
                width={mainZone.w}
                height={filledZone.h}
            />

            {/* Label Text */}
            <text
                className="fill-text"
                textAnchor="middle"
                x="50"
                y="393"
                fontSize="30"
                fontWeight="500"
            >
                {label}
            </text>
        </BaseComponent>
    );
};

export default Slider;