"use client";

import { useState, useMemo, useCallback } from "react";
import { Rotary } from "@cutoff/audio-ui-react";
import ControlSkeletonPage from "@/components/ControlSkeletonPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ChildMode = 'default' | 'complex' | 'none' | 'pixel' | 'mixed';

// Sample Images
const VINTAGE_KNOB_IMAGE = "/knob-volume.png";
const VINTAGE_KNOB_SVG = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NSIgZmlsbD0iIzMzMyIgc3Ryb2tlPSIjMTExIiBzdHJva2Utd2lkdGg9IjIiIC8+CiAgPGxpbmUgeDE9IjUwIiB5MT0iNTAiIHgyPSI1MCIgeTI9IjEwIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgLz4KPC9zdmc+";
const GREY_BG_SVG = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NSIgZmlsbD0iI2Q0ZDRkNCIgLz4KPC9zdmc+";

// Wrapper to render the Rotary inside an SVG
type RotaryWrapperProps = {
    normalizedValue: number;
    openness?: number;
    rotation?: number;
    imageHref?: string;
    style?: React.CSSProperties;
    className?: string;
    childMode?: ChildMode;
    onClick?: () => void;
};

// Complex Vector Shape (Polygon Pointer)
const ComplexVectorContent = (
    <g>
        <polygon
            points="50,15 45,30 55,30"
            fill="var(--audioui-adaptive-default-color)"
        />
        <circle cx="50" cy="50" r="3" fill="var(--audioui-adaptive-default-color)" />
    </g>
);

// Mixed Content Overlay (Simple Rect)
const MixedOverlayContent = (
    <rect
        x="48"
        y="10"
        width="4"
        height="20"
        fill="var(--audioui-adaptive-default-color)"
        rx="2"
    />
);

// Helper for the page wrapper
function RotaryWrapper({
    normalizedValue,
    openness = 90,
    rotation = 0,
    imageHref,
    style,
    className,
    childMode = 'default',
    onClick,
}: RotaryWrapperProps) {

    // Determine what children to render based on mode
    let children: React.ReactNode = null;

    if (childMode === 'complex') {
        children = ComplexVectorContent;
    } else if (childMode === 'mixed') {
        children = MixedOverlayContent;
    }
    // 'none' and 'pixel' mean children = null (just the image)

    return (
        <div
            className={`w-full h-full relative ${className || ""}`}
            style={style}
            onClick={onClick}
        >
            <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ display: 'block' }}>
                {/* Background context if no image is present */}
                 {!imageHref && (
                     <g>
                         {childMode === 'complex' ? (
                             // Track for complex example
                             <path
                                d="M 21.7 78.3 A 40 40 0 1 1 78.3 78.3"
                                fill="none"
                                stroke="var(--audioui-surface-2)"
                                strokeWidth="4"
                                strokeLinecap="round"
                             />
                         ) : (
                             // Standard circle background
                             <circle cx="50" cy="50" r="40" fill="var(--audioui-surface-1)" />
                         )}
                     </g>
                 )}

                <Rotary
                    cx={50}
                    cy={50}
                    radius={40}
                    normalizedValue={normalizedValue}
                    openness={openness}
                    rotation={rotation}
                    imageHref={imageHref}
                >
                    {children}
                </Rotary>
            </svg>
        </div>
    );
}

function generateCodeSnippet(
    normalizedValue: number,
    openness: number,
    rotation: number,
    imageHref: string | undefined,
    childMode: ChildMode
): string {
    let code = `<svg width="100%" height="100%" viewBox="0 0 100 100">\n`;

    if (!imageHref) {
         if (childMode === 'complex') {
             code += `    {/* Background Track */}\n    <path d="..." stroke="var(--audioui-surface-2)" />\n`;
         } else {
             code += `    <circle cx="50" cy="50" r="40" fill="var(--audioui-surface-1)" />\n`;
         }
    }

    code += `    <Rotary
        cx={50}
        cy={50}
        radius={40}
        normalizedValue={${normalizedValue}}
        openness={${openness}}`;

    if (rotation !== 0) {
        code += `\n        rotation={${rotation}}`;
    }

    if (imageHref) {
        code += `\n        imageHref="${imageHref}"`;
    }

    if ((childMode === 'none' || childMode === 'pixel') && imageHref) {
        code += `\n    />`;
    } else {
        code += `\n    >`;

        if (childMode === 'complex') {
            code += `\n        <polygon points="..." fill="..." />\n        <circle ... />`;
        } else if (childMode === 'mixed') {
            code += `\n        <rect ... />`;
        }

        code += `\n    </Rotary>`;
    }

    code += `\n</svg>`;
    return code;
}

export default function RotaryDemoPage() {
    const [normalizedValue, setNormalizedValue] = useState(0.3);
    const [openness, setOpenness] = useState(90);
    const [rotation, setRotation] = useState(0);
    const [imageHref, setImageHref] = useState<string | undefined>(VINTAGE_KNOB_SVG);
    // Initial state matches the first example (svg-data)
    const [childMode, setChildMode] = useState<ChildMode>('none');

    const handleExampleClick = useCallback((config: {
        normalizedValue?: number;
        openness?: number;
        rotation?: number;
        imageHref?: string;
        childMode?: ChildMode;
    }) => {
        setNormalizedValue(config.normalizedValue ?? 0.5);
        setOpenness(config.openness ?? 90);
        setRotation(config.rotation ?? 0);
        setImageHref(config.imageHref);
        setChildMode(config.childMode ?? 'complex');
    }, []);

    // Function to handle content selection change
    const handleContentChange = (value: string) => {
        const mode = value as ChildMode;
        setChildMode(mode);

        // Auto-configure imageHref based on selection
        if (mode === 'complex') {
            setImageHref(undefined);
        } else if (mode === 'none') {
            // SVG Data example
            setImageHref(VINTAGE_KNOB_SVG);
        } else if (mode === 'pixel') {
            // Pixel URL example - using local PNG image
            setImageHref(VINTAGE_KNOB_IMAGE);
            setOpenness(33);
            setRotation(-166);
        } else if (mode === 'mixed') {
            // Mixed mode
            setImageHref(GREY_BG_SVG);
        }
    };

    // Memoize examples to prevent re-renders
    const exampleSize = 100; // Fixed size for examples, matching ValueRing demo
    const examples = useMemo(() => [
        <RotaryWrapper
            key="svg-data"
            normalizedValue={0.3}
            imageHref={VINTAGE_KNOB_SVG}
            childMode="none"
            style={{ width: exampleSize, height: exampleSize }}
            onClick={() => handleExampleClick({
                normalizedValue: 0.3,
                imageHref: VINTAGE_KNOB_SVG,
                childMode: 'none'
            })}
        />,
        <RotaryWrapper
            key="complex-vector"
            normalizedValue={0.5}
            childMode="complex"
            style={{ width: exampleSize, height: exampleSize }}
            onClick={() => handleExampleClick({ normalizedValue: 0.5, childMode: 'complex', imageHref: undefined })}
        />,
        <RotaryWrapper
            key="pixel-image"
            normalizedValue={0.7}
            imageHref={VINTAGE_KNOB_IMAGE}
            childMode="pixel"
            openness={33}
            rotation={-166}
            style={{ width: exampleSize, height: exampleSize }}
            onClick={() => handleExampleClick({
                normalizedValue: 0.7,
                imageHref: VINTAGE_KNOB_IMAGE,
                childMode: 'pixel',
                openness: 33,
                rotation: -166
            })}
        />,
        <RotaryWrapper
            key="mixed-content"
            normalizedValue={0.5}
            imageHref={GREY_BG_SVG}
            childMode="mixed"
            style={{ width: exampleSize, height: exampleSize }}
            onClick={() => handleExampleClick({
                normalizedValue: 0.5,
                imageHref: GREY_BG_SVG,
                childMode: 'mixed'
            })}
        />
    ], [handleExampleClick]);

    const codeSnippet = generateCodeSnippet(
        normalizedValue,
        openness,
        rotation,
        imageHref,
        childMode
    );

    const componentProps = useMemo(() => ({
        normalizedValue,
        openness,
        rotation,
        imageHref,
        childMode
    }), [normalizedValue, openness, rotation, imageHref, childMode]);

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
        <div key="openness" className="space-y-4">
            <div className="flex justify-between items-center">
                <Label>Openness ({openness}°)</Label>
            </div>
            <Slider
                value={[openness]}
                onValueChange={(vals) => setOpenness(vals[0])}
                min={0}
                max={360}
                step={1}
            />
        </div>,
        <div key="rotation" className="space-y-4">
            <div className="flex justify-between items-center">
                <Label>Rotation ({rotation}°)</Label>
            </div>
            <Slider
                value={[rotation]}
                onValueChange={(vals) => setRotation(vals[0])}
                min={-180}
                max={180}
                step={1}
            />
        </div>,
        <div key="content" className="space-y-4">
             <Label>Content Type</Label>
             <Select value={childMode} onValueChange={handleContentChange}>
                <SelectTrigger>
                    <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="complex">Vector Shape</SelectItem>
                    <SelectItem value="none">Image (SVG Data)</SelectItem>
                    <SelectItem value="pixel">Image (Pixel URL)</SelectItem>
                    <SelectItem value="mixed">Mixed (Image + Vector)</SelectItem>
                </SelectContent>
            </Select>
        </div>,
        <div key="imageHref" className="space-y-4">
            <Label>Custom Image URL (Optional)</Label>
            <Input
                value={imageHref || ""}
                onChange={(e) => {
                    const val = e.target.value;
                    setImageHref(val || undefined);
                    if (!val && (childMode === 'none' || childMode === 'pixel')) {
                        // Fallback to complex if image is cleared in image mode
                        setChildMode('complex');
                    }
                }}
                placeholder="https://..."
            />
            <p className="text-xs text-muted-foreground mt-1">
                Enter any URL (SVG, PNG, JPG)
            </p>
        </div>
    ];

    return (
        <ControlSkeletonPage<number>
            componentName="Rotary"
            codeSnippet={codeSnippet}
            PageComponent={RotaryWrapper}
            componentProps={componentProps}
            properties={properties}
            examples={examples}
            onChange={(e) => setNormalizedValue(e.value)}
        />
    );
}
