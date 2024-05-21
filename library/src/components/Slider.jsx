import React, {useMemo, useRef, useEffect} from 'react';
import "../styles.css";
import classNames from "classnames";

/**
 * Computes the filled zone dimensions based on a given value.
 *
 * @param {{x: number, y: number, w: number, h: number}} mainZone - The main zone dimensions.
 * @param {number} value - The value to compute the filled zone for.
 * @param {number} min - The minimum value of the range.
 * @param {number} max - The maximum value of the range.
 * @returns {{y: number, h: number}} - The y and height dimensions of the filled zone.
 */
const computeFilledZoneFromMin = (mainZone, value, min, max) => {
    let ratio = ((value - min) / (max - min));
    let height = mainZone.h * ratio;
    return {
        y: mainZone.y + (mainZone.h - height),
        h: height
    };
}

/**
 * Computes the filled zone from the center based on the given value, minimum and maximum values, center point, and main zone dimensions.
 *
 * @param {number} value - The value to compute the filled zone for.
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @param {number} center - The center point.
 * @param {{y: number, h: number}} mainZone - The main zone dimensions represented by an object with y (y-coordinate) and h (height) properties.
 *
 * @returns {{y: number, h: number}} - The filled zone dimensions represented by an object with y (y-coordinate) and h (height) properties.
 */
const computeFilledZoneFromCenter = (value, min, max, center, mainZone) => {
    let halfHeight = mainZone.h / 2;
    let centerY = mainZone.y + halfHeight;
    if (value >= center) {
        let ratio = ((value - center) / (max - center));
        let height = halfHeight * ratio;
        return {
            y: mainZone.y + (halfHeight - height),
            h: height
        };
    } else {
        let ratio = (value / (center - min));
        let height = halfHeight * ratio;
        return {
            y: centerY,
            h: halfHeight - height
        };
    }
}

/**
 * Slider component for selecting values within a specified range.
 *
 * @param {Object} props - The props object for the Slider component.
 * @param {number} props.min - The minimum value of the slider.
 * @param {number} props.max - The maximum value of the slider.
 * @param {number} [props.center] - The center value of the slider for dual-thumb sliders.
 * @param {number} props.value - The current value of the slider.
 * @param {string} props.label - The label for the slider.
 * @param {("normal"|"large")} [props.size="normal"] - The size of the slider, either "normal" or "large".
 * @param {Object} [props.style] - Additional CSS styles for the slider component.
 */
export default function Slider(
    {
        min,
        max,
        center,
        value,
        label,
        size = "normal",
        stretch,
        className,
        style,
        onChange,
        onClick
    }) {

    const mainZone = useMemo(() => (
        size === "large"
            ? {x: 30, y: 20, w: 40, h: 330}
            : {x: 40, y: 20, w: 20, h: 330}
    ), [size]);

    const filledZone = useMemo(() => {
        // Prevent the filled zone overflowing the main zone
        let normalizedValue = Math.min(value, max);
        normalizedValue = Math.max(normalizedValue, min);

        let normalizedCenter = center ?? min;

        // Compute the filled zone
        if (center) {
            return computeFilledZoneFromCenter(normalizedValue, min, max, normalizedCenter, mainZone);
        } else {
            return computeFilledZoneFromMin(mainZone, normalizedValue, min, max);
        }
    }, [min, max, value, size]);

    const myStyle = useMemo(() => ({
        minWidth: "25px",
        width: stretch ? "100%" : "min(100%, 50px)",
        height: "auto",
        maxWidth: "100%",
        maxHeight: "100%",
        ...style,
    }), [style]);

    const rootRef = useRef(null);

    useEffect(() => {
        if (!onChange) return;

        const handleWheel = (e) => {
            e.preventDefault();
            e.stopPropagation();

            const delta = e.deltaY;
            // Use a functional update to ensure we're always working with the most current value
            onChange((currentValue) => {
                // Calculate the new value based on the current value and ensure it stays within bounds
                return Math.max(min, Math.min(currentValue + delta, max));
            });
        };

        const element = rootRef.current;
        if (element) {
            element.addEventListener("wheel", handleWheel, { passive: false });
        }

        return () => {
            if (element) {
                element.removeEventListener("wheel", handleWheel);
            }
        }
    }, [min, max, onChange]);

    return (
        <div ref={rootRef}
             className={classNames(
                 className,
                 "cutoffAudioKit",
                 onChange || onClick ? "highlight" : ""
             )}
             style={myStyle}
             onClick={onClick}
        >
            <svg viewBox="0 0 100 400"
                 // preserveAspectRatio="0.25"
                // style={{backgroundColor: "#f6f6f610"}}
            >
                {/* Background Rectangle */}
                <rect className="fill-primary-50"
                      x={mainZone.x}
                      y={mainZone.y}
                      width={mainZone.w}
                      height={mainZone.h}
                />

                {/* Foreground Rectangle */}
                <rect className="fill-primary"
                      x={mainZone.x}
                      y={filledZone.y}
                      width={mainZone.w}
                      height={filledZone.h}
                />

                {/* Label Text */}
                <text className="fill-text"
                      textAnchor="middle"
                      x="50" y="393"
                      fontSize="30"
                      fontWeight="500">
                    {label}
                </text>
            </svg>
        </div>
    );
}