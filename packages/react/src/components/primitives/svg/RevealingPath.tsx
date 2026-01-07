/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import React, { SVGProps } from "react";

export interface RevealingPathProps extends Omit<
    SVGProps<SVGPathElement>,
    "strokeDasharray" | "strokeDashoffset" | "pathLength"
> {
    /**
     * Normalized value between 0 and 1 indicating how much of the path to reveal.
     * 0 = path is completely hidden
     * 1 = path is completely visible
     */
    normalizedValue: number;
    /**
     * The internal resolution used for the path length calculation.
     * Higher values might offer smoother animations but "100" is usually sufficient for percentage-based fills.
     * Defaults to 100.
     */
    resolution?: number;
}

/**
 * A primitive SVG component that reveals a path from start to end using CSS stroke-dashoffset.
 *
 * This component uses the SVG `pathLength` attribute to normalize the path's length
 * calculation, allowing for performant "filling" animations without calculating
 * the actual geometric length of the path in JavaScript.
 *
 * Usage:
 * ```tsx
 * <RevealingPath
 *   d="M..."
 *   normalizedValue={0.5} // 50% revealed from the start
 *   stroke="currentColor"
 *   fill="none"
 * />
 * ```
 */
function RevealingPath({ normalizedValue, resolution = 100, className, style, ...props }: RevealingPathProps) {
    // Clamp value to ensure it stays within 0-1 range
    const clampedValue = Math.max(0, Math.min(1, normalizedValue));

    // Calculate the dash offset based on the resolution.
    // - When value is 1 (100%), offset is 0 (dash fully covers path).
    // - When value is 0 (0%), offset is resolution (dash is shifted fully 'off' the path).
    const numericResolution = Number(resolution);
    const calculatedOffset = numericResolution * (1 - clampedValue);

    return (
        <path
            {...props}
            className={className}
            // pathLength normalizes the browser's internal distance calculation for this element
            // to this value (default 100), regardless of the path's actual pixel length.
            pathLength={numericResolution}
            // Create a single dash that is the length of the entire path.
            // This ensures the "filled" part is solid and the "empty" part is transparent.
            strokeDasharray={numericResolution}
            // Shift the dash pattern to reveal only the desired portion.
            strokeDashoffset={calculatedOffset}
            style={style}
        />
    );
}

export default React.memo(RevealingPath);
