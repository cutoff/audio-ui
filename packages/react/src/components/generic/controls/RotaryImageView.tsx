/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import React from "react";
import { ControlComponent } from "@/types";
import RotaryImage from "@/primitives/svg/RotaryImage";

/**
 * Props specific to rotary image visualization
 */
export type RotaryImageViewProps = {
    /** Normalized value between 0 and 1 */
    normalizedValue: number;
    /** Width of the viewBox (determines viewBox width) */
    frameWidth: number;
    /** Height of the viewBox (determines viewBox height) */
    frameHeight: number;
    /** Radius for the rotary image (typically min(frameWidth, frameHeight) / 2) */
    radius: number;
    /** URL to the image to rotate */
    imageHref: string;
    /** Optional rotation angle offset in degrees (default: 0) */
    rotation?: number;
    /** Openness of the arc in degrees (value between 0-360º; 0º: closed; 90º: 3/4 open; 180º: half-circle;)
     * @default 90
     */
    openness?: number;
    /** Whether to start the arc from center (bipolar mode)
     * @default false
     */
    bipolar?: boolean;
    /** Optional number of discrete positions. When defined, the value will snap to the nearest position.
     * Used by discrete controls to snap to option positions.
     */
    positions?: number;
    /** Additional CSS class name */
    className?: string;
    /** Content to render (unused in rotary image but required by generic props) */
    children?: React.ReactNode;
};

/**
 * Creates a RotaryImageView component with the specified viewBox dimensions.
 * This factory function is used to create view components with dynamic viewBox
 * based on frame dimensions. The returned component implements the ControlComponent
 * contract and can be used with ContinuousControl or DiscreteControl.
 *
 * @param {number} frameWidth - Width of the viewBox
 * @param {number} frameHeight - Height of the viewBox
 * @param {number} radius - Radius for the rotary image (typically min(frameWidth, frameHeight) / 2)
 * @param {string} imageHref - URL to the image to rotate
 * @param {number} [rotation=0] - Optional rotation angle offset in degrees
 * @param {number} [openness=90] - Openness of the arc in degrees
 * @param {boolean} [bipolar=false] - Whether to start the arc from center (bipolar mode)
 * @param {"drag" | "wheel" | "both"} [interactionMode] - Preferred interaction mode for the control
 * @param {InteractionDirection} [interactionDirection] - Preferred interaction direction for the control
 * @returns {ControlComponent<{ positions?: number }>} A memoized ControlComponent that renders the rotary image
 *
 * @example
 * ```tsx
 * const ViewComponent = createRotaryImageView(
 *   100, 100, 45, "/knob-image.png", 0, 90, false, "both", "circular"
 * );
 * ```
 */
export function createRotaryImageView(
    frameWidth: number,
    frameHeight: number,
    radius: number,
    imageHref: string,
    rotation: number = 0,
    openness: number = 90,
    bipolar: boolean = false,
    interactionMode?: "drag" | "wheel" | "both",
    interactionDirection?: "vertical" | "horizontal" | "circular"
): ControlComponent<{ positions?: number }> {
    function DynamicRotaryImageView({
        normalizedValue,
        className,
        positions,
    }: {
        normalizedValue: number;
        className?: string;
        style?: React.CSSProperties;
        children?: React.ReactNode;
        positions?: number;
    }) {
        return (
            <RotaryImageView
                normalizedValue={normalizedValue}
                frameWidth={frameWidth}
                frameHeight={frameHeight}
                radius={radius}
                imageHref={imageHref}
                rotation={rotation}
                openness={openness}
                bipolar={bipolar}
                positions={positions}
                className={className}
            />
        );
    }

    const MemoizedView = React.memo(DynamicRotaryImageView);

    // Attach static properties required by ControlComponent contract
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (MemoizedView as any).viewBox = { width: frameWidth, height: frameHeight };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (MemoizedView as any).labelHeightUnits = 20;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (MemoizedView as any).interaction = {
        mode: interactionMode ?? "both",
        direction: interactionDirection ?? "circular",
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (MemoizedView as any).title = "Rotary Image";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (MemoizedView as any).description = "A rotary control that rotates an image based on value";

    return MemoizedView as unknown as ControlComponent<{ positions?: number }>;
}

/**
 * Pure SVG presentation component for a rotary image control.
 * Renders a rotating image based on normalized value.
 *
 * @param {RotaryImageViewProps} props - Component props
 * @param {number} props.normalizedValue - Value between 0 and 1
 * @param {number} props.frameWidth - Width of the viewBox
 * @param {number} props.frameHeight - Height of the viewBox
 * @param {number} props.radius - Radius for the rotary image
 * @param {string} props.imageHref - URL to the image to rotate
 * @param {number} [props.rotation=0] - Optional rotation angle offset in degrees
 * @param {number} [props.openness=90] - Openness of the arc in degrees
 * @param {boolean} [props.bipolar=false] - Whether to start the arc from center (bipolar mode)
 * @param {number} [props.positions] - Optional number of discrete positions for snapping
 * @param {string} [props.className] - Optional CSS class
 * @returns {JSX.Element} SVG group element containing the rotary image
 */
function RotaryImageView({
    normalizedValue,
    frameWidth,
    frameHeight,
    radius,
    imageHref,
    rotation = 0,
    openness = 90,
    bipolar = false,
    positions,
    className,
}: RotaryImageViewProps): JSX.Element {
    // Center point of the viewBox
    const cx = frameWidth / 2;
    const cy = frameHeight / 2;

    return (
        <g className={className}>
            <RotaryImage
                cx={cx}
                cy={cy}
                radius={radius}
                normalizedValue={normalizedValue}
                imageHref={imageHref}
                rotation={rotation}
                openness={openness}
                bipolar={bipolar}
                positions={positions}
            />
        </g>
    );
}

const RotaryImageViewMemo = React.memo(RotaryImageView);

// Attach static properties required by ControlComponent contract
// Note: viewBox dimensions are dynamic based on frameWidth/frameHeight
// We use a default that can be overridden by the parent component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(RotaryImageViewMemo as any).viewBox = { width: 100, height: 100 };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(RotaryImageViewMemo as any).labelHeightUnits = 20;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(RotaryImageViewMemo as any).interaction = {
    mode: "both" as const,
    direction: "circular" as const,
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(RotaryImageViewMemo as any).title = "Rotary Image";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(RotaryImageViewMemo as any).description = "A rotary control that rotates an image based on value";

// Props for the ControlComponent (excluding normalizedValue, className, style, children)
type RotaryImageViewComponentProps = Omit<RotaryImageViewProps, "normalizedValue" | "className" | "style" | "children">;

export default RotaryImageViewMemo as unknown as ControlComponent<RotaryImageViewComponentProps>;
