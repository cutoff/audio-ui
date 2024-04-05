import React, {useEffect, useMemo, useRef} from 'react';
import "../styles.css";
import classNames from "classnames";

const MAX_START_ANGLE = 220;
const MAX_END_ANGLE = 500;
const MAX_ARC_ANGLE = MAX_END_ANGLE - MAX_START_ANGLE;
const CENTER_ANGLE = 360;

// Calculate SVG arc path
const calculateArcPath = (startAngle, endAngle, radius) => {
    if (startAngle > endAngle) {
        [startAngle, endAngle] = [endAngle, startAngle]
    }
    const start = polarToCartesian(50, 50, radius, endAngle);
    const end = polarToCartesian(50, 50, radius, startAngle);
    const largeArcFlag = (endAngle - startAngle) <= 180 ? '0' : '1';
    return [
        'M', start.x, start.y,
        'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(' ');
};

// Convert polar coordinates to Cartesian
const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
};

export default function Knob(
    {
        min,
        max,
        center,
        value,
        label,
        children,
        stretch,
        className,
        style,
        onChange,
        onClick
    }) {

    // Convert value to angle within the range 210° to 510° (150° wrapped around)
    const valueToAngle = useMemo(() => {
        return ((value - min) / (max - min)) * MAX_ARC_ANGLE + MAX_START_ANGLE;
    }, [value, min, max]);

    const myStyle = useMemo(() => ({
        minWidth: "50px",
        width: stretch ? "100%" : "min(100%, 75px)",
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
            onChange || onClick ? "highlight" :  ""
        )}
             style={myStyle}
             onClick={onClick}
        >
            <svg viewBox="0 0 100 108">
                {/* Background Donut */}
                <path className="stroke-primary-50"
                      fill="none"
                      strokeWidth="12"
                      strokeLinecap="round"
                      d={calculateArcPath(MAX_START_ANGLE, MAX_END_ANGLE, 40)}
                />

                {/* Foreground Donut */}
                <path className="stroke-primary"
                      fill="none"
                      strokeWidth="12"
                      strokeLinecap="round"
                      d={calculateArcPath(center ? CENTER_ANGLE : MAX_START_ANGLE, valueToAngle, 40)}
                />

                {/* Value Text */}
                <foreignObject style={{cursor: "inherit"}}
                    x="20" y="22" width="60" height="60">
                    <div xmlns="http://www.w3.org/1999/xhtml" style={{
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
                        {/* Wrap images in a div and apply CSS to control their size */}
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
                                })} {/* Ensure the image is scaled to fit */}
                            </div>
                        ) : (
                            children ?? value
                        )}
                    </div>
                </foreignObject>

                {/* Label Text */}
                <text style={{cursor: "inherit"}}
                      className="fill-text"
                      x="50"
                      y="108"
                      fontSize="18"
                      fontWeight="500"
                      textAnchor="middle">
                    {label}
                </text>
            </svg>
        </div>
    );
}
