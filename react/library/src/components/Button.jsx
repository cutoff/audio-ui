import React, {useEffect, useState} from 'react';

export default function Button(
    {
        min = 0,
        max = 100,
        center = 50,
        value = 0,
        label,
        gridX,
        gridY,
        gridSpanX = 1,
        gridSpanY = 2,
        align = "bottom", // "bottom" | "center" | "top"
        style
    }) {

    const [actualCenter, setActualCenter] = useState(50);

    useEffect(() => {
        setActualCenter(center ?? (max - min) / 2);
    }, [min, max, center])

    const getJustifyContentFromAlign = (align) => {
        switch (align) {
            case "top":
                return "flex-start";
            case "center":
                return "center";
            default:
                return "flex-end";
        }
    };

    const myStyle = {
        // backgroundColor: "#f6f6f605",
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
        justifyContent: getJustifyContentFromAlign(align),
        ...style
    }

    const isOn = value > actualCenter;
    const buttonStroke = isOn ? "stroke-primary-50" : "stroke-primary-20";
    const buttonFill = isOn ? "fill-primary" : "fill-primary-50";

    return (
        <div style={myStyle}>
            <svg viewBox="0 0 100 200"
                // preserveAspectRatio="0.25"
                // style={{backgroundColor: "#f6f6f610"}}
            >
                <rect className={`${buttonStroke} ${buttonFill}`}
                      strokeWidth="5"
                      x={10}
                      y={110}
                      width={80}
                      height={40}
                />

                {/* Label Text */}
                <text className="fill-text" x="50" y="192" fontSize="30" fontWeight="500" textAnchor="middle">
                    {label}
                </text>
            </svg>
        </div>
    );
}