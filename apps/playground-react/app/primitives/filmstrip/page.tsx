"use client";

import { useState, useMemo, useCallback } from "react";
import { FilmstripImage } from "@cutoff/audio-ui-react";
import ControlSkeletonPage from "@/components/ControlSkeletonPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

// Helper to generate a data URI for a sample filmstrip
const generateFilmstripSvg = (frames: number, width: number, height: number) => {
    const rects = [];
    for (let i = 0; i < frames; i++) {
        const hue = (i / frames) * 360;
        const y = i * height;
        rects.push(
            `<rect x="0" y="${y}" width="${width}" height="${height}" fill="hsl(${hue}, 70%, 50%)" stroke="none" />`
        );
        rects.push(
            `<text x="${width / 2}" y="${y + height / 2}" font-family="sans-serif" font-size="24" text-anchor="middle" dominant-baseline="central" fill="white">${i}</text>`
        );
        // Add a spinning indicator line
        const angle = (i / (frames - 1)) * 270 - 135; // -135 to +135
        const cx = width / 2;
        const cy = y + height / 2;
        const r = width * 0.4;
        const x2 = cx + r * Math.sin((angle * Math.PI) / 180);
        const y2 = cy - r * Math.cos((angle * Math.PI) / 180);
        rects.push(
            `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="white" stroke-width="3" stroke-linecap="round" />`
        );
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height * frames}" viewBox="0 0 ${width} ${height * frames}">${rects.join("")}</svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
};

const SAMPLE_FRAMES = 30;
const SAMPLE_WIDTH = 100;
const SAMPLE_HEIGHT = 100;
const SAMPLE_FILMSTRIP = generateFilmstripSvg(SAMPLE_FRAMES, SAMPLE_WIDTH, SAMPLE_HEIGHT);

const ABS_IMAGE = "/ABS.png";
const GUITAR_IMAGE = "/guitar_strat_tone-2.png";
const VU3_IMAGE = "/vu3.png";
const IMAGE_101 = "/101.png";

// Wrapper to render the FilmstripImage inside an SVG
type FilmstripWrapperProps = {
    normalizedValue: number;
    rotation?: number;
    imageHref?: string;
    style?: React.CSSProperties;
    className?: string;
    onClick?: () => void;
    // New props for explicit dimensions
    width?: number;
    height?: number;
    frameCount?: number;
};

function FilmstripWrapper({
    normalizedValue,
    rotation = 0,
    imageHref,
    style,
    className,
    onClick,
    width = 100,
    height = 100,
    frameCount = SAMPLE_FRAMES,
}: FilmstripWrapperProps) {
    return (
        <div
            className={`w-full h-full relative ${className || ""}`}
            style={{
                ...style,
                cursor: onClick ? "pointer" : "default",
            }}
            onClick={onClick}
        >
            <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ display: "block" }}>
                {/*
                  FilmstripImage primitive
                  Using native rotation support
                */}
                <FilmstripImage
                    cx={50}
                    cy={50}
                    width={width}
                    height={height}
                    frameCount={frameCount}
                    normalizedValue={normalizedValue}
                    imageHref={imageHref || SAMPLE_FILMSTRIP}
                    rotation={rotation}
                />
            </svg>
        </div>
    );
}

function generateCodeSnippet(
    normalizedValue: number,
    rotation: number,
    imageHref: string | undefined,
    width: number,
    height: number,
    frameCount: number
): string {
    return `<svg width="100%" height="100%" viewBox="0 0 100 100">
    <FilmstripImage
        cx={50}
        cy={50}
        width={${width}}
        height={${height}}
        frameCount={${frameCount}}
        normalizedValue={${normalizedValue}}
        imageHref="${imageHref || "data:..."}"
        rotation={${rotation}}
    />
</svg>`;
}

export default function FilmstripDemoPage() {
    const [normalizedValue, setNormalizedValue] = useState(0.5);
    const [rotation, setRotation] = useState(0);
    const [imageHref, setImageHref] = useState<string>(SAMPLE_FILMSTRIP);

    // New state for dimensions
    const [frameWidth, setFrameWidth] = useState(100);
    const [frameHeight, setFrameHeight] = useState(100);
    const [frameCount, setFrameCount] = useState(30);

    const handleExampleClick = useCallback(
        (config: {
            normalizedValue?: number;
            rotation?: number;
            imageHref?: string;
            width?: number;
            height?: number;
            frameCount?: number;
        }) => {
            setNormalizedValue(config.normalizedValue ?? 0.5);
            setRotation(config.rotation ?? 0);
            if (config.imageHref) setImageHref(config.imageHref);
            if (config.width) setFrameWidth(config.width);
            if (config.height) setFrameHeight(config.height);
            if (config.frameCount) setFrameCount(config.frameCount);
        },
        []
    );

    const examples = useMemo(
        () => [
            <FilmstripWrapper
                key="generated"
                normalizedValue={0.5}
                rotation={0}
                imageHref={SAMPLE_FILMSTRIP}
                width={SAMPLE_WIDTH}
                height={SAMPLE_HEIGHT}
                frameCount={SAMPLE_FRAMES}
                style={{ width: 100, height: 100 }}
                onClick={() =>
                    handleExampleClick({
                        normalizedValue: 0.5,
                        rotation: 0,
                        imageHref: SAMPLE_FILMSTRIP,
                        width: SAMPLE_WIDTH,
                        height: SAMPLE_HEIGHT,
                        frameCount: SAMPLE_FRAMES,
                    })
                }
            />,
            <FilmstripWrapper
                key="abs-knob"
                normalizedValue={0.75}
                rotation={0}
                imageHref={ABS_IMAGE}
                width={128}
                height={128}
                frameCount={200}
                style={{ width: 100, height: 100 }}
                onClick={() =>
                    handleExampleClick({
                        normalizedValue: 0.75,
                        rotation: 0,
                        imageHref: ABS_IMAGE,
                        width: 128,
                        height: 128,
                        frameCount: 200,
                    })
                }
            />,
            <FilmstripWrapper
                key="guitar-knob"
                normalizedValue={0.2}
                rotation={0}
                imageHref={GUITAR_IMAGE}
                width={80}
                height={80}
                frameCount={31}
                style={{ width: 100, height: 100 }}
                onClick={() =>
                    handleExampleClick({
                        normalizedValue: 0.2,
                        rotation: 0,
                        imageHref: GUITAR_IMAGE,
                        width: 80,
                        height: 80,
                        frameCount: 31,
                    })
                }
            />,
            <FilmstripWrapper
                key="vu3"
                normalizedValue={0.5}
                rotation={0}
                imageHref={VU3_IMAGE}
                width={120}
                height={80}
                frameCount={48}
                style={{ width: 100, height: 100 }}
                onClick={() =>
                    handleExampleClick({
                        normalizedValue: 0.5,
                        rotation: 0,
                        imageHref: VU3_IMAGE,
                        width: 120,
                        height: 80,
                        frameCount: 48,
                    })
                }
            />,
            <FilmstripWrapper
                key="101"
                normalizedValue={0.5}
                rotation={0}
                imageHref={IMAGE_101}
                width={128}
                height={128}
                frameCount={101}
                style={{ width: 100, height: 100 }}
                onClick={() =>
                    handleExampleClick({
                        normalizedValue: 0.5,
                        rotation: 0,
                        imageHref: IMAGE_101,
                        width: 128,
                        height: 128,
                        frameCount: 101,
                    })
                }
            />,
        ],
        [handleExampleClick]
    );

    const codeSnippet = generateCodeSnippet(normalizedValue, rotation, imageHref, frameWidth, frameHeight, frameCount);

    const componentProps = useMemo(
        () => ({
            normalizedValue,
            rotation,
            imageHref,
            width: frameWidth,
            height: frameHeight,
            frameCount,
        }),
        [normalizedValue, rotation, imageHref, frameWidth, frameHeight, frameCount]
    );

    const properties = [
        <div key="normalizedValue" className="space-y-4">
            <div className="flex justify-between items-center">
                <Label>Normalized Value ({normalizedValue.toFixed(2)})</Label>
            </div>
            <Slider
                value={[normalizedValue]}
                onValueChange={(vals) => setNormalizedValue(vals[0])}
                min={0}
                max={1}
                step={0.01}
            />
        </div>,
        <div key="rotation" className="space-y-4">
            <div className="flex justify-between items-center">
                <Label>Rotation ({rotation}°)</Label>
            </div>
            <Slider value={[rotation]} onValueChange={(vals) => setRotation(vals[0])} min={-180} max={180} step={1} />
        </div>,
        <div key="dimensions" className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
                <Label>Width (px)</Label>
                <Input type="number" value={frameWidth} onChange={(e) => setFrameWidth(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
                <Label>Height (px)</Label>
                <Input type="number" value={frameHeight} onChange={(e) => setFrameHeight(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
                <Label>Frames</Label>
                <Input type="number" value={frameCount} onChange={(e) => setFrameCount(Number(e.target.value))} />
            </div>
        </div>,
        <div key="imageHref" className="space-y-4">
            <Label>Filmstrip Image URL</Label>
            <Input
                value={imageHref || ""}
                onChange={(e) => setImageHref(e.target.value)}
                placeholder="Data URI or URL..."
            />
            <p className="text-xs text-muted-foreground mt-1">Default is a generated 30-frame SVG filmstrip.</p>
        </div>,
    ];

    return (
        <ControlSkeletonPage<number>
            componentName="FilmstripImage"
            codeSnippet={codeSnippet}
            PageComponent={FilmstripWrapper}
            componentProps={componentProps}
            properties={properties}
            examples={examples}
            onChange={(e) => setNormalizedValue(e.value)}
        />
    );
}
