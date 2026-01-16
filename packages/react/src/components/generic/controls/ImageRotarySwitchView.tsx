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
export type ImageRotarySwitchViewProps = {
    /** Normalized value between 0 and 1 */
    normalizedValue: number;
    /** Width of the viewBox (determines viewBox width) */
    frameWidth: number;
    /** Height of the viewBox (determines viewBox height) */
    frameHeight: number;
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
 * Pure SVG presentation component for a rotary image control.
 * Renders a rotating image based on normalized value.
 *
 * @param {ImageRotarySwitchViewProps} props - Component props
 * @param {number} props.normalizedValue - Value between 0 and 1
 * @param {number} props.frameWidth - Width of the viewBox
 * @param {number} props.frameHeight - Height of the viewBox
 * @param {string} props.imageHref - URL to the image to rotate
 * @param {number} [props.rotation=0] - Optional rotation angle offset in degrees
 * @param {number} [props.openness=90] - Openness of the arc in degrees
 * @param {boolean} [props.bipolar=false] - Whether to start the arc from center (bipolar mode)
 * @param {number} [props.positions] - Optional number of discrete positions for snapping
 * @param {string} [props.className] - Optional CSS class
 * @returns {JSX.Element} SVG group element containing the rotary image (RotaryImage component)
 */
function ImageRotarySwitchView({
    normalizedValue,
    frameWidth,
    frameHeight,
    imageHref,
    rotation = 0,
    openness = 90,
    bipolar = false,
    positions,
    className,
}: ImageRotarySwitchViewProps): JSX.Element {
    // Center point of the viewBox
    const cx = frameWidth / 2;
    const cy = frameHeight / 2;
    // Calculate radius from frame dimensions
    const radius = Math.min(frameWidth, frameHeight) / 2;

    return (
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
            className={className}
        />
    );
}

const ImageRotarySwitchViewMemo = React.memo(ImageRotarySwitchView);

// Attach static properties required by ControlComponent contract
// Note: viewBox dimensions are dynamic based on frameWidth/frameHeight
// We use a default that can be overridden by the parent component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(ImageRotarySwitchViewMemo as any).viewBox = { width: 100, height: 100 };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(ImageRotarySwitchViewMemo as any).labelHeightUnits = 20;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(ImageRotarySwitchViewMemo as any).interaction = {
    mode: "both" as const,
    direction: "circular" as const,
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(ImageRotarySwitchViewMemo as any).title = "Rotary Image";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(ImageRotarySwitchViewMemo as any).description = "A rotary control that rotates an image based on value";

// Props for the ControlComponent (excluding normalizedValue, className, style, children)
type ImageRotarySwitchViewComponentProps = Omit<
    ImageRotarySwitchViewProps,
    "normalizedValue" | "className" | "style" | "children"
>;

export default ImageRotarySwitchViewMemo as unknown as ControlComponent<ImageRotarySwitchViewComponentProps>;
