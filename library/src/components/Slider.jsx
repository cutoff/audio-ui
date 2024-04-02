import React, {useEffect, useState} from 'react';

export default function Slider(
{
    min,
    max,
    center,
    value,
    label,
    gridX,
    gridY,
    gridSpanX = 1,
    gridSpanY = 2,
    size = "normal", // "normal" | "large"
    style
}) {
    const mainZone = size === "large"
        ? { x: 30, y: 20, w: 40, h: 330 }
        : { x: 40, y: 20, w: 20, h: 330 };

    const [filledZone, setFilledZone] = useState({
        y: mainZone.y + mainZone.h,
        h: 0
    })

    useEffect(() => {
        // Prevent the filled zone overflowing the main zone
        let normalizedValue = Math.min(value, max);
        normalizedValue = Math.max(normalizedValue, min);

        // Compute the filled zone
        if (center) {
            computeFilledZoneFromCenter(normalizedValue);
        } else {
            computeFilledZoneFromMin(normalizedValue);
        }
    }, [min, max, value, size])

    function computeFilledZoneFromMin(normalizedValue) {
        let ratio = (normalizedValue / (max - min));
        let height = mainZone.h * ratio;
        setFilledZone({
            y: mainZone.y + (mainZone.h - height),
            h: height
        });
    }

    function computeFilledZoneFromCenter(normalizedValue) {
        let normalizedCenter = center ?? min;
        let halfHeight = mainZone.h / 2;
        let centerY = mainZone.y + halfHeight;
        if (normalizedValue >= normalizedCenter) {
            let ratio = ((normalizedValue - normalizedCenter) / (max - normalizedCenter));
            let height = halfHeight * ratio;
            setFilledZone({
                y: mainZone.y + (halfHeight - height),
                h: height
            });
        } else {
            let ratio = (normalizedValue / (normalizedCenter - min));
            let height = halfHeight * ratio;
            setFilledZone({
                y: centerY,
                h: halfHeight - height
            });
        }
    }

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
        <div style={myStyle}>
            <svg viewBox="0 0 100 400"
                 preserveAspectRatio="0.25"
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
                <text className="fill-text" x="50" y="393" fontSize="30" fontWeight="500" textAnchor="middle">
                    {label}
                </text>
            </svg>
        </div>
    );
}