import React, {useMemo} from 'react';
import classNames from 'classnames';
import AdaptiveSvgComponent from '../support/AdaptiveSvgComponent';
import {BipolarControl} from "../types";

export type Thickness = 'medium' | 'large';

/**
 * Props for the Slider component
 */
export type SliderProps = BipolarControl & {
    /** Thickness variant of the slider
     * @default 'normal' */
    thickness?: Thickness;
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
    // Ensure value is within bounds
    const boundedValue = Math.max(min, Math.min(value, max));
    const ratio = (boundedValue - min) / (max - min);
    // Ensure ratio is between 0 and 1 to prevent rendering issues
    const boundedRatio = Math.max(0, Math.min(ratio, 1));
    const height = mainZone.h * boundedRatio;
    
    // Calculate y position ensuring it stays within the slider boundaries
    const y = mainZone.y + (mainZone.h - height);
    
    return {
        y: y,
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
    // Ensure value is within bounds
    const boundedValue = Math.max(min, Math.min(value, max));
    const halfHeight = mainZone.h / 2;
    const centerY = mainZone.y + halfHeight;

    if (boundedValue >= center) {
        // Upper half (value >= center)
        const ratio = (boundedValue - center) / (max - center);
        // Ensure ratio is between 0 and 1
        const boundedRatio = Math.max(0, Math.min(ratio, 1));
        const height = halfHeight * boundedRatio;
        return {
            y: mainZone.y + (halfHeight - height),
            h: height
        };
    } else {
        // Lower half (value < center)
        const ratio = (boundedValue - min) / (center - min);
        // Ensure ratio is between 0 and 1
        const boundedRatio = Math.max(0, Math.min(ratio, 1));
        const height = halfHeight * boundedRatio;
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
                    bipolar = false,
                    value,
                    label,
                    thickness = 'medium',
                    stretch = false,
                    className,
                    style,
                    onChange,
                    onClick
                }: SliderProps) => {
    // Calculate the dimensions of the slider's main zone based on size variant
    const mainZone = useMemo<Zone>(() => (
        thickness === 'large'
            ? { x: 30, y: 20, w: 40, h: 330 }
            : { x: 40, y: 20, w: 20, h: 330 }
    ), [thickness]);

    // Calculate the dimensions of the filled portion based on current value
    const filledZone = useMemo<FilledZone>(() => {
        const normalizedValue = Math.min(Math.max(value, min), max);
        const normalizedCenter = bipolar ? (Math.floor((max - min + 1) / 2) + min) : min;

        return bipolar
            ? computeFilledZoneFromCenter(normalizedValue, min, max, normalizedCenter, mainZone)
            : computeFilledZoneFromMin(mainZone, normalizedValue, min, max);
    }, [min, max, value, bipolar, mainZone]);

    // Handle mouse wheel events to change the value
    const handleWheel = (e: WheelEvent) => {
        if (!onChange) return;

        const delta = e.deltaY;
        onChange((currentValue: number) => {
            return Math.max(min, Math.min(currentValue + delta, max));
        });
    };

    return (
        <AdaptiveSvgComponent
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
        </AdaptiveSvgComponent>
    );
};

export default Slider;
