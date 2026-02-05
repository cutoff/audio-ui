/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import React, { CSSProperties, ReactNode } from "react";
import TickRing from "./TickRing";

export type LabelRingProps = {
    /** X coordinate of the center point */
    cx: number;
    /** Y coordinate of the center point */
    cy: number;
    /** Outer radius of the ring (content is centered at this radius) */
    radius: number;
    /** Array of content to render at each tick position */
    labels: (string | number | ReactNode)[];
    /** Orientation of the labels:
     * - "upright": Text stays upright (default)
     * - "radial": Text rotates to match the angle
     */
    orientation?: "upright" | "radial";
    /** Openness of the ring in degrees (default 90) */
    openness?: number;
    /** Rotation offset in degrees (default 0) */
    rotation?: number;
    /** CSS class name */
    className?: string;
    /** Inline styles */
    style?: CSSProperties;
    /** CSS class name for the text elements (only applies to string/number labels) */
    labelClassName?: string;
    /** Inline styles for the text elements (only applies to string/number labels) */
    labelStyle?: CSSProperties;
    /**
     * Default size for icon labels. Used to center the icons.
     * If not provided, the component attempts to read `size`, `width`, or `height` from the icon props.
     */
    iconSize?: number;
};

/**
 * A wrapper around TickRing designed for rendering text labels or icons at radial positions.
 * Automatically handles positioning and rotation based on the specified orientation.
 */
function LabelRing({
    cx,
    cy,
    radius,
    labels,
    orientation = "upright",
    openness = 90,
    rotation = 0,
    className,
    style,
    labelClassName,
    labelStyle,
    iconSize,
}: LabelRingProps) {
    return (
        <TickRing
            cx={cx}
            cy={cy}
            radius={radius}
            openness={openness}
            rotation={rotation}
            count={labels.length}
            className={className}
            style={style}
            renderTick={({ x, y, angle, index }) => {
                const content = labels[index];

                // If content is null/undefined, skip
                if (content === null || content === undefined) return null;

                const isComponent = React.isValidElement(content);

                let transform = undefined;

                if (orientation === "radial") {
                    // Standard radial rotation: text bottom points to center

                    // Base rotation: angle + 90 makes text tangent to the circle
                    let textRotation = angle + 90;

                    // Readability optimization:
                    // If text is in the right hemisphere (roughly 90° to 270°),
                    // it appears upside-down. We flip it by 180° to keep it readable.
                    // Normalize textRotation to check orientation zone
                    const normalizedRotation = ((textRotation % 360) + 360) % 360;

                    if (normalizedRotation > 90 && normalizedRotation < 270) {
                        textRotation += 180;
                    }

                    transform = `rotate(${textRotation}, ${x}, ${y})`;
                }

                if (isComponent) {
                    // For React nodes (icons, etc), wrap in group and translate
                    // Extract rotation value from transform if present to apply to group
                    // Note: We strip the center point from rotation for the group transform
                    // because the group is already translated to {x, y}
                    const rotationValue = transform ? transform.match(/rotate\(([-\d.]+)/)?.[1] : 0;

                    // Attempt to calculate offset to center the icon
                    // We assume icons are square and positioned top-left by default (standard SVG behavior)
                    let offset = 0;
                    if (iconSize !== undefined) {
                        offset = -iconSize / 2;
                    } else {
                        // Heuristic: Try to find size from props
                        // This works for Lucide, Radix, and many other icon libraries
                        const props = (content as React.ReactElement).props as {
                            size?: string | number;
                            width?: string | number;
                            height?: string | number;
                        };
                        const size = props?.size ?? props?.width ?? props?.height;
                        const numericSize = Number(size);
                        if (!isNaN(numericSize) && numericSize > 0) {
                            offset = -numericSize / 2;
                        }
                    }

                    return (
                        <g transform={`translate(${x}, ${y}) rotate(${rotationValue}) translate(${offset}, ${offset})`}>
                            {content}
                        </g>
                    );
                }

                // For text/numbers
                return (
                    <text
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className={labelClassName}
                        style={labelStyle}
                        transform={transform}
                        fill="currentColor"
                    >
                        {content}
                    </text>
                );
            }}
        />
    );
}

export default React.memo(LabelRing);
