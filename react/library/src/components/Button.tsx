import React, { useEffect, useState } from 'react';

export type ButtonProps = {
    /** Minimum value */
    min?: number;
    /** Maximum value */
    max?: number;
    /** Center point for value comparison */
    center?: number;
    /** Current value */
    value?: number;
    /** Button label */
    label?: string;
    /** Grid column start position */
    gridX?: number;
    /** Grid row start position */
    gridY?: number;
    /** Number of grid columns to span */
    gridSpanX?: number;
    /** Number of grid rows to span */
    gridSpanY?: number;
    /** Vertical alignment within grid cell */
    align?: 'top' | 'center' | 'bottom';
    /** Additional styles */
    style?: React.CSSProperties;
    /** Click event handler */
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
};

export default function Button({
    min = 0,
    max = 100,
    center = 50,
    value = 0,
    label,
    gridX,
    gridY,
    gridSpanX = 1,
    gridSpanY = 2,
    align = "bottom",
    style,
    onClick
}: ButtonProps) {
    const [actualCenter, setActualCenter] = useState<number>(50);

    useEffect(() => {
        setActualCenter(center ?? (max - min) / 2);
    }, [min, max, center]);

    const getJustifyContentFromAlign = (align: 'top' | 'center' | 'bottom'): string => {
        switch (align) {
            case "top":
                return "flex-start";
            case "center":
                return "center";
            default:
                return "flex-end";
        }
    };

    const myStyle: React.CSSProperties = {
        minHeight: 0,
        minWidth: 0,
        width: "min(100%, 100vh)",
        height: "min(100%, 100vh)",
        maxHeight: "100%",
        maxWidth: "100%",
        gridColumnStart: gridX,
        gridRowStart: gridY,
        gridColumnEnd: `span ${gridSpanX}`,
        gridRowEnd: `span ${gridSpanY}`,
        display: "flex",
        flexDirection: "column",
        justifyContent: getJustifyContentFromAlign(align),
        ...style
    };

    const isOn = value > actualCenter;
    const buttonStroke = isOn ? "stroke-primary-50" : "stroke-primary-20";
    const buttonFill = isOn ? "fill-primary" : "fill-primary-50";

    return (
        <div style={myStyle} onClick={onClick}>
            <svg viewBox="0 0 100 200">
                <rect 
                    className={`${buttonStroke} ${buttonFill}`}
                    strokeWidth="5"
                    x={10}
                    y={110}
                    width={80}
                    height={40}
                />
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
            </svg>
        </div>
    );
}
