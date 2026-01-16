/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import React from "react";
import { ControlComponent } from "@/types";
import Image from "@/primitives/svg/Image";

/**
 * Props specific to image switch visualization
 */
export type ImageSwitchViewProps = {
    /** Normalized value between 0 and 1 */
    normalizedValue: number;
    /** Width of the viewBox (determines viewBox width) */
    frameWidth: number;
    /** Height of the viewBox (determines viewBox height) */
    frameHeight: number;
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
 * @param {ImageSwitchViewProps} props - Component props
 * @param {number} props.normalizedValue - Value between 0 and 1 (0 = false, 1 = true)
 * @param {number} props.frameWidth - Width of the viewBox
 * @param {number} props.frameHeight - Height of the viewBox
 * @param {string} props.imageHrefFalse - URL to the image for false/off state
 * @param {string} props.imageHrefTrue - URL to the image for true/on state
 * @param {string} [props.className] - Optional CSS class
 * @returns {JSX.Element} SVG image element
 */
function ImageSwitchView({
    normalizedValue,
    frameWidth,
    frameHeight,
    imageHrefFalse,
    imageHrefTrue,
    className,
}: ImageSwitchViewProps): JSX.Element {
    // Determine which image to show based on normalized value (threshold at 0.5)
    const imageHref = normalizedValue > 0.5 ? imageHrefTrue : imageHrefFalse;

    return <Image x={0} y={0} width={frameWidth} height={frameHeight} imageHref={imageHref} className={className} />;
}

const ImageSwitchViewMemo = React.memo(ImageSwitchView);

// Attach static properties required by ControlComponent contract
// Note: viewBox dimensions are dynamic based on frameWidth/frameHeight
// We use a default that can be overridden by the parent component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(ImageSwitchViewMemo as any).viewBox = { width: 100, height: 100 };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(ImageSwitchViewMemo as any).labelHeightUnits = 20;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(ImageSwitchViewMemo as any).interaction = {
    mode: "both" as const,
    direction: "vertical" as const,
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(ImageSwitchViewMemo as any).title = "Image Switch";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(ImageSwitchViewMemo as any).description = "A boolean control that displays one of two images based on value";

// Props for the ControlComponent (excluding normalizedValue, className, style, children)
type ImageSwitchViewComponentProps = Omit<ImageSwitchViewProps, "normalizedValue" | "className" | "style" | "children">;

export default ImageSwitchViewMemo as unknown as ControlComponent<ImageSwitchViewComponentProps>;
