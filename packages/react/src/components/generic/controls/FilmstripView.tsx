/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import React from "react";
import { ControlComponent } from "@/types";
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
    /** Optional dark mode filmstrip URL (used when dark mode is active) */
    imageDarkHref?: string;
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
 * Pure SVG presentation component for a filmstrip control.
 * Renders a single frame from a sprite sheet based on normalized value.
 *
 * Supports optional dark mode filmstrips via imageDarkHref. CSS automatically
 * switches between light and dark filmstrips based on the .dark class or prefers-color-scheme.
 *
 * @param {FilmstripViewProps} props - Component props
 * @param {number} props.normalizedValue - Value between 0 and 1
 * @param {number} props.frameWidth - Width of a single frame in the filmstrip
 * @param {number} props.frameHeight - Height of a single frame in the filmstrip
 * @param {number} props.frameCount - Total number of frames in the strip
 * @param {string} props.imageHref - URL to the sprite sheet/filmstrip image
 * @param {string} [props.imageDarkHref] - Optional dark mode filmstrip URL
 * @param {"vertical" | "horizontal"} [props.orientation="vertical"] - Orientation of the strip
 * @param {number} [props.frameRotation=0] - Optional frame rotation in degrees
 * @param {boolean} [props.invertValue=false] - If true, inverts the normalized value (0.0 -> 1.0 and 1.0 -> 0.0)
 * @param {string} [props.className] - Optional CSS class
 * @returns {JSX.Element} SVG group element containing the filmstrip frame (FilmstripImage component)
 */
function FilmstripView({
    normalizedValue,
    frameWidth,
    frameHeight,
    frameCount,
    imageHref,
    imageDarkHref,
    orientation = "vertical",
    frameRotation = 0,
    invertValue = false,
    className,
}: FilmstripViewProps): React.JSX.Element {
    return (
        <FilmstripImage
            x={0}
            y={0}
            frameWidth={frameWidth}
            frameHeight={frameHeight}
            frameCount={frameCount}
            normalizedValue={normalizedValue}
            imageHref={imageHref}
            imageDarkHref={imageDarkHref}
            orientation={orientation}
            frameRotation={frameRotation}
            invertValue={invertValue}
            className={className}
        />
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
