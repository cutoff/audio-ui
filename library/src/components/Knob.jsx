import React from "react";
import "../styles.css";

export default function Knob(
    {
        min,
        max,
        center,
        value,
        label,
        gridX,
        gridY,
        gridSpanX = 2,
        gridSpanY = 1,
        children,
        style
    }) {
    // Convert value to angle within the range 210° to 510° (150° wrapped around)
    const valueToAngle = (val) => {
        // Convert value range (0 to 100) to angle range (210° to 510°, equivalent to 150° wrapped around)
        const angle = ((val - min) / (max - min)) * 300 + 210;
        return angle > 360 ? angle - 360 : angle; // Normalize angle to 0-360 range if necessary
    };

    // Calculate SVG arc path
    const calculateArcPath = (startAngle, endAngle, radius) => {
        const start = polarToCartesian(50, 50, radius, endAngle);
        const end = polarToCartesian(50, 50, radius, startAngle);
        const largeArcFlag = endAngle > startAngle ? '0' : '1'; // Use large arc flag for wrapping
        return [
            'M', start.x, start.y,
            'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
        ].join(' ');
    };

    // Convert polar coordinates to Cartesian
    const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
        const normalizedAngle = angleInDegrees % 360; // Normalize angle to be within 0-360 degrees
        const angleInRadians = (normalizedAngle - 90) * Math.PI / 180.0;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    };

    const myStyle = {
        // backgroundColor: "#f6f6f650",
        minHeight: 0,
        minWidth: 0,
        width: "min(100%, 100vh)",
        height: "min(100%, 100vh)",
        maxHeight: "100%",
        maxWidth: "100%",
        gridColumnStart: gridX,
        gridRowStart: gridY,
        gridColumnEnd: "span " + gridSpanX,
        gridRowEnd: "span " + gridSpanY,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        ...style
    }

    return (
        <div className="rx-audio" style={myStyle}>
            <svg viewBox="0 0 100 115">
                {/* Background Donut */}
                <path className="rx-audio stroke-primary-50" fill="none" strokeWidth="12"
                      d={calculateArcPath(210, 150, 40)}
                />

                {/* Foreground Donut */}
                <path className="rx-audio stroke-primary" fill="none" strokeWidth="12"
                      d={calculateArcPath(210, valueToAngle(value), 40)}
                />

                {/* Value Text */}
                <foreignObject x="20" y="20" width="60" height="60">
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
                    }}>
                        {/* Wrap images in a div and apply CSS to control their size */}
                        {React.isValidElement(children) && children.type === 'img' ? (
                            <div style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '10px'
                            }}>
                                {React.cloneElement(children, {
                                    style: {
                                        maxWidth: '100%',
                                        maxHeight: '100%'
                                    }
                                })} {/* Ensure the image is scaled to fit */}
                            </div>
                        ) : (
                            children ?? value
                        )}
                    </div>
                </foreignObject>

                {/* Label Text */}
                <text className="fill-text" x="50" y="110" fontSize="18" fontWeight="500" textAnchor="middle">
                    {label}
                </text>
            </svg>
        </div>
    );
}
