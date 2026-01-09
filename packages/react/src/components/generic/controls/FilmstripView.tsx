/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import React from "react";
import { ControlComponent, InteractionDirection } from "@/types";
import FilmstripImage from "@/primitives/svg/FilmstripImage";

/**
 * Props specific to filmstrip visualization
 */
export type FilmstripViewProps = {
    /** Normalized value between 0 and 1 */
    normalizedValue: number;
    /** Width of a SINGLE frame */
    frameWidth: number;
    /** Height of a SINGLE frame */
    frameHeight: number;
    /** Total number of frames in the strip */
    frameCount: number;
    /** URL to the sprite sheet/filmstrip image */
    imageHref: string;
    /** Orientation of the strip (default: "vertical") */
    orientation?: "vertical" | "horizontal";
    /** Optional frame rotation in degrees (default: 0) */
    frameRotation?: number;
    /**
     * If true, inverts the normalized value (0.0 -> 1.0 and 1.0 -> 0.0).
     * Useful for filmstrips where frame 0 represents "on" and frame 1 represents "off".
     * @default false
     */
    invertValue?: boolean;
    /** Additional CSS class name */
    className?: string;
    /** Content to render (unused in filmstrip but required by generic props) */
    children?: React.ReactNode;
};

/**
 * Creates a FilmstripView component with the specified viewBox dimensions.
 * This factory function is used to create view components with dynamic viewBox
 * based on frame dimensions. The returned component implements the ControlComponent
 * contract and can be used with ContinuousControl, DiscreteControl, or BooleanControl.
 *
 * @param {number} frameWidth - Width of a single frame in the filmstrip
 * @param {number} frameHeight - Height of a single frame in the filmstrip
 * @param {number} frameCount - Total number of frames in the strip
 * @param {string} imageHref - URL to the sprite sheet/filmstrip image
 * @param {"vertical" | "horizontal"} [orientation="vertical"] - Orientation of the strip
 * @param {number} [frameRotation=0] - Optional frame rotation in degrees
 * @param {boolean} [invertValue=false] - If true, inverts the normalized value (0.0 -> 1.0 and 1.0 -> 0.0)
 * @param {"drag" | "wheel" | "both"} [interactionMode] - Preferred interaction mode for the control
 * @param {InteractionDirection} [interactionDirection] - Preferred interaction direction for the control
 * @returns {ControlComponent<Record<string, never>>} A memoized ControlComponent that renders the filmstrip
 *
 * @example
 * ```tsx
 * const ViewComponent = createFilmstripView(
 *   100, 100, 64, "/knob-frames.png", "vertical", 0, false, "both", "circular"
 * );
 * ```
 */
export function createFilmstripView(
    frameWidth: number,
    frameHeight: number,
    frameCount: number,
    imageHref: string,
    orientation: "vertical" | "horizontal" = "vertical",
    frameRotation: number = 0,
    invertValue: boolean = false,
    interactionMode?: "drag" | "wheel" | "both",
    interactionDirection?: InteractionDirection
): ControlComponent<Record<string, never>> {
    function DynamicFilmstripView({
        normalizedValue,
        className,
    }: {
        normalizedValue: number;
        className?: string;
        style?: React.CSSProperties;
        children?: React.ReactNode;
    }) {
        return (
            <FilmstripView
                normalizedValue={normalizedValue}
                frameWidth={frameWidth}
                frameHeight={frameHeight}
                frameCount={frameCount}
                imageHref={imageHref}
                orientation={orientation}
                frameRotation={frameRotation}
                invertValue={invertValue}
                className={className}
            />
        );
    }

    const MemoizedView = React.memo(DynamicFilmstripView);

    // Map interaction direction: "both" becomes orientation-based, otherwise use as-is
    const effectiveDirection: InteractionDirection =
        interactionDirection === "both" || !interactionDirection
            ? orientation === "horizontal"
                ? "horizontal"
                : "vertical"
            : interactionDirection;

    // Attach static properties required by ControlComponent contract
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (MemoizedView as any).viewBox = { width: frameWidth, height: frameHeight };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (MemoizedView as any).labelHeightUnits = 20;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (MemoizedView as any).interaction = {
        mode: interactionMode ?? "both",
        direction: effectiveDirection,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (MemoizedView as any).title = "Filmstrip";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (MemoizedView as any).description = "A filmstrip control that displays frames from a sprite sheet";

    return MemoizedView as unknown as ControlComponent<Record<string, never>>;
}

/**
 * Pure SVG presentation component for a filmstrip control.
 * Renders a single frame from a sprite sheet based on normalized value.
 *
 * @param normalizedValue - Value between 0 and 1
 * @param frameWidth - Width of a single frame in the filmstrip
 * @param frameHeight - Height of a single frame in the filmstrip
 * @param frameCount - Total number of frames in the strip
 * @param imageHref - URL to the sprite sheet/filmstrip image
 * @param orientation - Orientation of the strip (default "vertical")
 * @param frameRotation - Optional frame rotation in degrees (default 0)
 * @param invertValue - If true, inverts the normalized value (0.0 -> 1.0 and 1.0 -> 0.0) (default false)
 * @param className - Optional CSS class
 */
function FilmstripView({
    normalizedValue,
    frameWidth,
    frameHeight,
    frameCount,
    imageHref,
    orientation = "vertical",
    frameRotation = 0,
    invertValue = false,
    className,
}: FilmstripViewProps): JSX.Element {
    // Center point of the viewBox
    const cx = frameWidth / 2;
    const cy = frameHeight / 2;

    return (
        <g className={className}>
            <FilmstripImage
                cx={cx}
                cy={cy}
                frameWidth={frameWidth}
                frameHeight={frameHeight}
                frameCount={frameCount}
                normalizedValue={normalizedValue}
                imageHref={imageHref}
                orientation={orientation}
                frameRotation={frameRotation}
                invertValue={invertValue}
            />
        </g>
    );
}

const FilmstripViewMemo = React.memo(FilmstripView);

// Attach static properties required by ControlComponent contract
// Note: viewBox dimensions are dynamic based on frameWidth/frameHeight
// We use a default that can be overridden by the parent component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(FilmstripViewMemo as any).viewBox = { width: 100, height: 100 };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(FilmstripViewMemo as any).labelHeightUnits = 20;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(FilmstripViewMemo as any).interaction = {
    mode: "both" as const,
    direction: "vertical" as const,
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(FilmstripViewMemo as any).title = "Filmstrip";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(FilmstripViewMemo as any).description = "A filmstrip control that displays frames from a sprite sheet";

// Props for the ControlComponent (excluding normalizedValue, className, style, children)
type FilmstripViewComponentProps = Omit<FilmstripViewProps, "normalizedValue" | "className" | "style" | "children">;

export default FilmstripViewMemo as unknown as ControlComponent<FilmstripViewComponentProps>;
