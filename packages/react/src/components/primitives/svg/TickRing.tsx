/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import React, { CSSProperties, ReactNode, useMemo } from "react";
import { polarToCartesian } from "@cutoff/audio-ui-core";

export type TickData = {
    x: number;
    y: number;
    angle: number;
    index: number;
};

export type TickRingProps = {
    /** X coordinate of the center point */
    cx: number;
    /** Y coordinate of the center point */
    cy: number;
    /** Outer radius of the ring (ticks extend inward) */
    radius: number;
    /** Length of the ticks in pixels (or diameter of dots) */
    thickness?: number;
    /** Openness of the ring in degrees (default 90) */
    openness?: number;
    /** Rotation offset in degrees (default 0) */
    rotation?: number;
    /** Total number of ticks to distribute evenly */
    count?: number;
    /** Angle in degrees between ticks (alternative to count) */
    step?: number;
    /**
     * Shape of the ticks:
     * - "line": Radial lines (optimized single path)
     * - "dot": Circles (optimized single path)
     * - "pill": Rounded lines (using stroke-linecap round)
     */
    variant?: "line" | "dot" | "pill";
    /**
     * Optional callback to render custom content at each tick position.
     * If provided, the component bails out of single-path optimization and renders generic ReactNodes.
     */
    renderTick?: (data: TickData) => ReactNode;
    /** CSS class name */
    className?: string;
    /** Inline styles */
    style?: CSSProperties;
};

/**
 * A reusable SVG primitive that renders a ring of tick marks.
 * Useful for creating scales on knobs and dials.
 *
 * Supports optimized single-path rendering for lines and dots,
 * or custom rendering via renderTick callback.
 */
function TickRing({
    cx,
    cy,
    radius,
    thickness = 4,
    openness = 90,
    rotation = 0,
    count,
    step,
    variant = "line",
    renderTick,
    className,
    style,
}: TickRingProps) {
    // 1. Calculate positions (shared logic)
    const positions = useMemo(() => {
        const clampedOpenness = Math.max(0, Math.min(360, openness));
        const baseStart = 180 + clampedOpenness / 2;
        const baseEnd = 540 - clampedOpenness / 2;
        const startAngle = baseStart - rotation;
        const totalAngle = baseEnd - baseStart;

        let numTicks = 0;
        let angleStep = 0;

        // Handle full circle case (openness = 0 or 360)
        // If openness is 0, we have a full circle (360 degrees range).
        // For full circles, we distribute ticks evenly around 360 degrees,
        // ensuring the last tick doesn't overlap the first.
        const isFullCircle = clampedOpenness <= 0.01;

        if (count !== undefined && count > 1) {
            numTicks = count;
            if (isFullCircle) {
                // For full circle, distribute evenly around 360
                angleStep = 360 / count;
            } else {
                angleStep = totalAngle / (count - 1);
            }
        } else if (step !== undefined && step > 0) {
            numTicks = Math.floor(totalAngle / step) + 1;
            angleStep = step;
        } else if (count === 1) {
            numTicks = 1;
            angleStep = 0;
        }

        if (numTicks <= 0) return [];

        const results: TickData[] = [];
        // Round coordinates to avoid hydration mismatches
        const r = (n: number) => Math.round(n * 10000) / 10000;

        for (let i = 0; i < numTicks; i++) {
            const angle = startAngle + i * angleStep;

            // Calculate position at outer radius
            const pos = polarToCartesian(cx, cy, radius, angle);

            results.push({
                x: r(pos.x),
                y: r(pos.y),
                angle: r(angle), // Keep precise angle for rotation transforms
                index: i,
            });
        }
        return results;
    }, [cx, cy, radius, openness, rotation, count, step]);

    // 2. Optimized Path Mode (calculate before early return to satisfy hooks rules)
    const pathData = useMemo(() => {
        if (renderTick || positions.length === 0) return "";

        const commands: string[] = [];
        const r = (n: number) => Math.round(n * 10000) / 10000;

        for (const pos of positions) {
            if (variant === "dot") {
                // Circle centered at radius - thickness/2
                // We need to recalculate center because pos is at outer radius
                const center = polarToCartesian(cx, cy, radius - thickness / 2, pos.angle);
                const rx = thickness / 2;
                const ry = thickness / 2;

                // Draw circle using two arcs
                // M cx-r cy A r r 0 1 0 cx+r cy A r r 0 1 0 cx-r cy
                commands.push(
                    `M ${r(center.x - rx)} ${r(center.y)} ` +
                        `A ${r(rx)} ${r(ry)} 0 1 0 ${r(center.x + rx)} ${r(center.y)} ` +
                        `A ${r(rx)} ${r(ry)} 0 1 0 ${r(center.x - rx)} ${r(center.y)}`
                );
            } else {
                // "line" or "pill"
                // Line from inner to outer
                const outer = polarToCartesian(cx, cy, radius, pos.angle);
                const inner = polarToCartesian(cx, cy, radius - thickness, pos.angle);
                commands.push(`M ${r(inner.x)} ${r(inner.y)} L ${r(outer.x)} ${r(outer.y)}`);
            }
        }
        return commands.join(" ");
    }, [positions, cx, cy, radius, thickness, variant, renderTick]);

    // 3. Custom Render Mode (Bail out of optimization)
    if (renderTick) {
        return (
            <g className={className} style={style}>
                {positions.map((pos) => (
                    <React.Fragment key={pos.index}>{renderTick(pos)}</React.Fragment>
                ))}
            </g>
        );
    }

    if (!pathData) return null;

    // Default styles based on variant
    const defaultStyles: CSSProperties =
        variant === "dot"
            ? { fill: "currentColor", stroke: "none" }
            : { fill: "none", stroke: "currentColor", strokeLinecap: variant === "pill" ? "round" : "butt" };

    return (
        <path
            d={pathData}
            className={className}
            style={{ ...defaultStyles, ...style }}
            // For lines/pills, use strokeWidth=1 default if not set in style
            // For dots, strokeWidth doesn't matter unless user overrides fill/stroke
            strokeWidth={variant === "dot" ? undefined : style?.strokeWidth || 1}
        />
    );
}

export default React.memo(TickRing);
