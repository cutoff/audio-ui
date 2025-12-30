"use client";

import React, { CSSProperties } from "react";

export type FilmstripImageProps = {
    /** X coordinate of the center point */
    cx: number;
    /** Y coordinate of the center point */
    cy: number;
    /** Width of a SINGLE frame */
    width: number;
    /** Height of a SINGLE frame */
    height: number;
    /** Total number of frames in the strip */
    frameCount: number;
    /** Normalized value between 0 and 1 */
    normalizedValue: number;
    /** URL to the sprite sheet/filmstrip image */
    imageHref: string;
    /** Orientation of the strip (default: "vertical") */
    orientation?: "vertical" | "horizontal";
    /** Optional rotation in degrees (default: 0) */
    rotation?: number;
    /** Additional CSS class name */
    className?: string;
    /** Inline styles */
    style?: CSSProperties;
};

/**
 * A primitive component that displays a single frame from a sprite sheet (filmstrip)
 * based on a normalized value.
 *
 * This is the most performant way to animate complex knobs and UI elements in audio applications.
 * It uses a nested SVG with a shifted viewBox to "scrub" through the filmstrip, which is hardware accelerated.
 *
 * The filmstrip image should contain all frames stacked vertically (default) or horizontally.
 */
function FilmstripImage({
    cx,
    cy,
    width,
    height,
    frameCount,
    normalizedValue,
    imageHref,
    orientation = "vertical",
    rotation = 0,
    className,
    style,
}: FilmstripImageProps) {
    // Clamp value between 0 and 1
    const clampedValue = Math.max(0, Math.min(1, normalizedValue));

    // Calculate frame index (0 to frameCount - 1)
    const frameIndex = Math.round(clampedValue * (frameCount - 1));

    // Calculate total dimensions of the strip
    const totalWidth = orientation === "horizontal" ? width * frameCount : width;
    const totalHeight = orientation === "vertical" ? height * frameCount : height;

    // Calculate viewBox coordinates for the current frame
    const viewBoxX = orientation === "horizontal" ? frameIndex * width : 0;
    const viewBoxY = orientation === "vertical" ? frameIndex * height : 0;

    return (
        <g className={className} style={style} transform={`rotate(${rotation}, ${cx}, ${cy})`}>
            <svg
                x={cx - width / 2}
                y={cy - height / 2}
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
                style={{ overflow: "hidden" }}
            >
                <image
                    href={imageHref}
                    width={totalWidth}
                    height={totalHeight}
                    preserveAspectRatio="none"
                    style={{
                        transform: `translate(${-viewBoxX}px, ${-viewBoxY}px)`,
                        willChange: "transform",
                    }}
                />
            </svg>
        </g>
    );
}

export default React.memo(FilmstripImage);
