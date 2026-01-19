/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import React, { CSSProperties, useMemo } from "react";
import { calculateArcPath } from "@cutoff/audio-ui-core";

export type RingArcProps = {
    startAngle: number;
    endAngle: number;
    style: CSSProperties | undefined;
    cx: number;
    cy: number;
    radius: number;
    thickness: number;
    strokeLinecap: "round" | "square" | "butt" | string;
};

/**
 * Helper component to render either a circle or path based on whether it's a full circle.
 *
 * @internal
 */
function RingArc({ startAngle, endAngle, style, cx, cy, radius, thickness, strokeLinecap }: RingArcProps) {
    // Determine if it's a full circle based on angular difference (>= 360 degrees)
    const isFullCircle = Math.abs(endAngle - startAngle) >= 360;

    const path = useMemo(() => {
        if (isFullCircle) return undefined;

        // Use default "counter-clockwise" (End -> Start) for standard static shapes.
        return calculateArcPath(cx, cy, startAngle, endAngle, radius, "counter-clockwise");
    }, [isFullCircle, cx, cy, startAngle, endAngle, radius]);

    if (isFullCircle) {
        return (
            <circle
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                strokeWidth={thickness}
                style={{
                    ...style,
                    // @ts-expect-error - strokeLinecap accepts CSS variables (strings) but React types are strict
                    strokeLinecap: strokeLinecap,
                }}
            />
        );
    }

    if (!path) return null;

    return (
        <path
            d={path}
            fill="none"
            strokeWidth={thickness}
            style={{
                ...style,
                // @ts-expect-error - strokeLinecap accepts CSS variables (strings) but React types are strict
                strokeLinecap: strokeLinecap,
            }}
        />
    );
}

export default React.memo(RingArc);
