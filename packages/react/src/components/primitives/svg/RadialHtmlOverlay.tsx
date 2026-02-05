/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

import React from "react";

export type RadialHtmlOverlayProps = {
    /** X coordinate of the center point */
    cx: number;
    /** Y coordinate of the center point */
    cy: number;
    /** Radius from center to the edge of the content box. The content will be a square with side = radius * 2 */
    radius: number;
    /** Content to render inside the overlay */
    children?: React.ReactNode;
    /** Additional CSS class name */
    className?: string;
    /** Inline styles for the foreignObject */
    style?: React.CSSProperties;
    /** Pointer events behavior (default: "none" to let clicks pass through to SVG below, set to "auto" if interactive) */
    pointerEvents?: "none" | "auto";
};

/**
 * A primitive that renders HTML content inside an SVG at a radial position.
 * It creates a square foreignObject centered at (cx, cy) with size based on radius.
 *
 * This is the preferred way to render text inside knobs, as it leverages the browser's
 * native HTML text rendering engine (Flexbox, wrapping, fonts) which is superior to SVG text.
 */
function RadialHtmlOverlay({
    cx,
    cy,
    radius,
    children,
    className,
    style,
    pointerEvents = "none",
}: RadialHtmlOverlayProps) {
    const size = radius * 2;
    const x = cx - radius;
    const y = cy - radius;

    return (
        <foreignObject
            x={x}
            y={y}
            width={size}
            height={size}
            className={className}
            style={{
                pointerEvents,
                ...style,
            }}
        >
            <div
                // @ts-expect-error - xmlns is valid for XHTML but not strictly in React's HTML definitions
                xmlns="http://www.w3.org/1999/xhtml"
                style={{
                    // Use 100% to fill the foreignObject (which is sized in SVG user units)
                    // Do NOT use explicit pixels here, as that breaks SVG scaling (viewBox).
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                }}
            >
                {children}
            </div>
        </foreignObject>
    );
}

export default React.memo(RadialHtmlOverlay);
