/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import React from "react";
import { ControlComponent } from "@/types";
import RadialImage from "@/primitives/svg/RadialImage";

/**
 * Props specific to image switch visualization
 */
export type ImageViewProps = {
    /** Normalized value between 0 and 1 */
    normalizedValue: number;
    /** Width of the viewBox (determines viewBox width) */
    frameWidth: number;
    /** Height of the viewBox (determines viewBox height) */
    frameHeight: number;
    /** Radius for the image (typically min(frameWidth, frameHeight) / 2) */
    radius: number;
    /** URL to the image for false/off state */
    imageHrefFalse: string;
    /** URL to the image for true/on state */
    imageHrefTrue: string;
    /** Additional CSS class name */
    className?: string;
    /** Content to render (unused in image view but required by generic props) */
    children?: React.ReactNode;
};

/**
 * Pure SVG presentation component for an image switch control.
 * Renders one of two images based on normalized value (false = 0, true = 1).
 *
 * @param {ImageViewProps} props - Component props
 * @param {number} props.normalizedValue - Value between 0 and 1 (0 = false, 1 = true)
 * @param {number} props.frameWidth - Width of the viewBox
 * @param {number} props.frameHeight - Height of the viewBox
 * @param {number} props.radius - Radius for the image
 * @param {string} props.imageHrefFalse - URL to the image for false/off state
 * @param {string} props.imageHrefTrue - URL to the image for true/on state
 * @param {string} [props.className] - Optional CSS class
 * @returns {JSX.Element} SVG group element containing the image
 */
function ImageView({
    normalizedValue,
    frameWidth,
    frameHeight,
    radius,
    imageHrefFalse,
    imageHrefTrue,
    className,
}: ImageViewProps): JSX.Element {
    // Center point of the viewBox
    const cx = frameWidth / 2;
    const cy = frameHeight / 2;

    // Determine which image to show based on normalized value (threshold at 0.5)
    const imageHref = normalizedValue > 0.5 ? imageHrefTrue : imageHrefFalse;

    return (
        <g className={className}>
            <RadialImage cx={cx} cy={cy} radius={radius} imageHref={imageHref} />
        </g>
    );
}

const ImageViewMemo = React.memo(ImageView);

// Attach static properties required by ControlComponent contract
// Note: viewBox dimensions are dynamic based on frameWidth/frameHeight
// We use a default that can be overridden by the parent component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(ImageViewMemo as any).viewBox = { width: 100, height: 100 };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(ImageViewMemo as any).labelHeightUnits = 20;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(ImageViewMemo as any).interaction = {
    mode: "both" as const,
    direction: "vertical" as const,
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(ImageViewMemo as any).title = "Image Switch";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(ImageViewMemo as any).description = "A boolean control that displays one of two images based on value";

// Props for the ControlComponent (excluding normalizedValue, className, style, children)
type ImageViewComponentProps = Omit<ImageViewProps, "normalizedValue" | "className" | "style" | "children">;

export default ImageViewMemo as unknown as ControlComponent<ImageViewComponentProps>;
