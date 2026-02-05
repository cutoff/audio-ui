/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import { useState, useMemo, useCallback, useId } from "react";
import { ValueRing } from "@cutoff/audio-ui-react";

import ControlSkeletonPage from "@/components/ControlSkeletonPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { ColorPickerField } from "@/components/ColorPickerField";

// Wrapper to render the ValueRing inside an SVG
type RingWrapperProps = {
    normalizedValue: number; // 0.0-1.0
    bipolar?: boolean;
    thickness?: number; // 1-20
    roundness?: number; // mapped to boolean for ValueRing
    openness?: number;
    rotation?: number;
    fgGlow?: boolean;
    color?: string;
    style?: React.CSSProperties;
    className?: string;
    onClick?: () => void;
    size?: string; // ControlSkeletonPage passes size, but we might ignore it or use it for container size
    adaptiveSize?: boolean; // When true, component fills container; when false, uses fixed size
};

function RingWrapper({
    normalizedValue,
    bipolar,
    thickness = 6,
    roundness,
    openness = 90,
    rotation = 0,
    fgGlow,
    color,
    style,
    className,
    onClick,
    adaptiveSize = false,
}: RingWrapperProps) {
    const value = Math.max(0, Math.min(1, normalizedValue));
    const filterId = useId().replace(/:/g, "");

    // Fixed dimensions for examples; use full size when adaptiveSize is true
    const sizePx = 100;
    const cx = sizePx / 2;
    const cy = sizePx / 2;
    // Radius needs to account for thickness to avoid clipping
    // The ValueRing calculates actualRadius = radius - thickness/2
    // So if we pass radius=50, actual is 50-3 = 47.
    // We want the outer edge to be within 50.
    const radius = sizePx / 2;

    const primaryColor = color || "var(--audioui-adaptive-default-color)";

    const fgStyle: React.CSSProperties = {
        stroke: primaryColor,
        ...(fgGlow ? { filter: `url(#${filterId})` } : {}),
    };

    const bgStyle: React.CSSProperties = {
        stroke: `color-mix(in srgb, ${primaryColor} 50%, transparent)`,
        opacity: 1,
    };

    return (
        <div
            className={`${adaptiveSize ? "w-full h-full" : ""} ${className || ""}`}
            style={{
                ...style,
                ...(adaptiveSize ? {} : { width: sizePx, height: sizePx }),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
            onClick={onClick}
        >
            <svg
                width={adaptiveSize ? "100%" : sizePx}
                height={adaptiveSize ? "100%" : sizePx}
                viewBox={`0 0 ${sizePx} ${sizePx}`}
                style={{ overflow: "visible", display: "block" }}
            >
                {fgGlow && (
                    <defs>
                        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                )}
                <ValueRing
                    cx={cx}
                    cy={cy}
                    radius={radius}
                    normalizedValue={value}
                    bipolar={bipolar}
                    thickness={thickness} // Pass thickness directly (1-20)
                    roundness={!!roundness} // ValueRing takes boolean for roundness
                    openness={openness}
                    rotation={rotation}
                    fgArcStyle={fgStyle}
                    bgArcStyle={bgStyle}
                />
            </svg>
        </div>
    );
}

function generateCodeSnippet(
    normalizedValue: number,
    bipolar: boolean,
    thickness: number,
    roundness: number | undefined,
    openness: number,
    rotation: number,
    fgGlow: boolean,
    color: string | undefined
): string {
    const radius = 50;
    const cx = 50;
    const cy = 50;
    const primaryColor = color || "var(--audioui-adaptive-default-color)";

    let code = `<svg width="100" height="100" viewBox="0 0 100 100">\n`;
    if (fgGlow) {
        code += `  <defs>\n`;
        code += `    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">\n`;
        code += `      <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />\n`;
        code += `      <feMerge>\n`;
        code += `        <feMergeNode in="blur" />\n`;
        code += `        <feMergeNode in="SourceGraphic" />\n`;
        code += `      </feMerge>\n`;
        code += `    </filter>\n`;
        code += `  </defs>\n`;
    }
    code += `  <ValueRing\n`;
    code += `    cx={${cx}}\n`;
    code += `    cy={${cy}}\n`;
    code += `    radius={${radius}}\n`;
    code += `    normalizedValue={${normalizedValue}}\n`;

    if (bipolar) code += `    bipolar={true}\n`;
    if (thickness !== 6) code += `    thickness={${thickness}}\n`;
    if (roundness) code += `    roundness={true}\n`;
    if (openness !== 90) code += `    openness={${openness}}\n`;
    if (rotation !== 0) code += `    rotation={${rotation}}\n`;

    code += `    fgArcStyle={{\n`;
    code += `      stroke: "${primaryColor}",\n`;
    if (fgGlow) {
        code += `      filter: "url(#glow)"\n`;
    }
    code += `    }}\n`;

    code += `    bgArcStyle={{\n`;
    code += `      stroke: "color-mix(in srgb, ${primaryColor} 50%, transparent)",\n`;
    code += `      opacity: 1\n`;
    code += `    }}\n`;
    code += `  />\n`;
    code += `</svg>`;

    return code;
}

export default function RingDemoPage() {
    const [normalizedValue, setNormalizedValue] = useState(0.65);
    const [bipolar, setBipolar] = useState(false);
    const [roundness, setRoundness] = useState<number | undefined>(1); // Default to true (1)
    const [thickness, setThickness] = useState(6); // Default 6px
    const [openness, setOpenness] = useState(90);
    const [rotation, setRotation] = useState(0);
    const [fgGlow, setFgGlow] = useState(false);
    const [color, setColor] = useState<string | undefined>(undefined);

    const handleExampleClick = useCallback(
        (config: {
            normalizedValue?: number;
            bipolar?: boolean;
            roundness?: number;
            thickness?: number;
            openness?: number;
            rotation?: number;
            fgGlow?: boolean;
            color?: string;
        }) => {
            setNormalizedValue(config.normalizedValue ?? 0.65);
            setBipolar(config.bipolar ?? false);
            setRoundness(config.roundness);
            setThickness(config.thickness ?? 6);
            setOpenness(config.openness ?? 90);
            setRotation(config.rotation ?? 0);
            setFgGlow(config.fgGlow ?? false);
            setColor(config.color);
        },
        []
    );

    // Memoize value arrays for Sliders to prevent unnecessary re-renders or updates
    const normalizedValueArray = useMemo(() => [normalizedValue], [normalizedValue]);
    const thicknessArray = useMemo(() => [thickness], [thickness]);
    const opennessArray = useMemo(() => [openness], [openness]);
    const rotationArray = useMemo(() => [rotation], [rotation]);

    const properties = useMemo(
        () => [
            <div key="normalizedValue" className="grid gap-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="normalizedValueProp">Normalized Value (0.0-1.0)</Label>
                    <Input
                        id="normalizedValueProp"
                        type="number"
                        min="0"
                        max="1"
                        step="0.01"
                        className="w-[70px] h-8 text-right"
                        value={normalizedValue}
                        onChange={(e) => setNormalizedValue(Math.max(0, Math.min(1, Number(e.target.value))))}
                    />
                </div>
                <Slider
                    value={normalizedValueArray}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={(values) => setNormalizedValue(values[0])}
                />
            </div>,
            <div key="thickness" className="grid gap-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="thicknessProp">Thickness (1-20)</Label>
                    <Input
                        id="thicknessProp"
                        type="number"
                        min="1"
                        max="20"
                        step="1"
                        className="w-[70px] h-8 text-right"
                        value={thickness}
                        onChange={(e) => setThickness(Math.max(1, Math.min(20, Number(e.target.value))))}
                    />
                </div>
                <Slider
                    value={thicknessArray}
                    min={1}
                    max={20}
                    step={1}
                    onValueChange={(values) => setThickness(values[0])}
                />
            </div>,
            <div key="openness" className="grid gap-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="opennessProp">Openness (degrees)</Label>
                    <Input
                        id="opennessProp"
                        type="number"
                        min="0"
                        max="360"
                        step="1"
                        className="w-[70px] h-8 text-right"
                        value={openness}
                        onChange={(e) => setOpenness(Math.max(0, Math.min(360, Number(e.target.value))))}
                    />
                </div>
                <Slider
                    value={opennessArray}
                    min={0}
                    max={360}
                    step={1}
                    onValueChange={(values) => setOpenness(values[0])}
                />
            </div>,
            <div key="rotation" className="grid gap-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="rotationProp">Rotation (degrees)</Label>
                    <Input
                        id="rotationProp"
                        type="number"
                        min="-180"
                        max="180"
                        step="1"
                        className="w-[70px] h-8 text-right"
                        value={rotation}
                        onChange={(e) => setRotation(Math.max(-180, Math.min(180, Number(e.target.value))))}
                    />
                </div>
                <Slider
                    value={rotationArray}
                    min={-180}
                    max={180}
                    step={1}
                    onValueChange={(values) => setRotation(values[0])}
                />
            </div>,
            <div key="color" className="grid gap-2">
                <ColorPickerField id="colorProp" label="Color" value={color} onChange={setColor} />
            </div>,
            <div key="roundness" className="flex items-center gap-2 pt-2">
                <Checkbox
                    id="roundnessProp"
                    checked={!!roundness}
                    onCheckedChange={(checked) => setRoundness(checked ? 1 : undefined)}
                />
                <Label htmlFor="roundnessProp" className="cursor-pointer">
                    Roundness
                </Label>
            </div>,
            <div key="bipolar" className="flex items-center gap-2 pt-2">
                <Checkbox
                    id="bipolarProp"
                    checked={bipolar}
                    onCheckedChange={(checked) => setBipolar(checked === true)}
                />
                <Label htmlFor="bipolarProp" className="cursor-pointer">
                    Bipolar
                </Label>
            </div>,
            <div key="fgGlow" className="flex items-center gap-2 pt-2">
                <Checkbox id="fgGlowProp" checked={fgGlow} onCheckedChange={(checked) => setFgGlow(checked === true)} />
                <Label htmlFor="fgGlowProp" className="cursor-pointer">
                    FG Glow
                </Label>
            </div>,
        ],
        [
            normalizedValue,
            thickness,
            openness,
            rotation,
            color,
            roundness,
            bipolar,
            fgGlow,
            normalizedValueArray,
            thicknessArray,
            opennessArray,
            rotationArray,
        ]
    );

    const examples = useMemo(
        () => [
            <RingWrapper
                key="default"
                normalizedValue={0.75}
                thickness={6}
                roundness={1}
                onClick={() => handleExampleClick({ normalizedValue: 0.75, thickness: 6, fgGlow: false, roundness: 1 })}
            />,
            <RingWrapper
                key="glow"
                normalizedValue={0.75}
                thickness={6}
                roundness={1}
                fgGlow={true}
                onClick={() => handleExampleClick({ normalizedValue: 0.75, thickness: 6, fgGlow: true, roundness: 1 })}
            />,
            <RingWrapper
                key="bipolar"
                normalizedValue={0.5}
                bipolar={true}
                thickness={6}
                roundness={1}
                openness={90}
                onClick={() =>
                    handleExampleClick({
                        normalizedValue: 0.5,
                        bipolar: true,
                        thickness: 6,
                        openness: 90,
                        roundness: 1,
                    })
                }
            />,
            <RingWrapper
                key="full-circle"
                normalizedValue={0.33}
                openness={0}
                thickness={4}
                roundness={1}
                onClick={() => handleExampleClick({ normalizedValue: 0.33, openness: 0, thickness: 4, roundness: 1 })}
            />,
            <RingWrapper
                key="thick-glow"
                normalizedValue={0.8}
                thickness={12}
                openness={120}
                fgGlow={true}
                roundness={1}
                color="#ec4899" // Pink
                onClick={() =>
                    handleExampleClick({
                        normalizedValue: 0.8,
                        thickness: 12,
                        openness: 120,
                        fgGlow: true,
                        color: "#ec4899",
                        roundness: 1,
                    })
                }
            />,
        ],
        [handleExampleClick]
    );

    const codeSnippet = generateCodeSnippet(
        normalizedValue,
        bipolar,
        thickness,
        roundness,
        openness,
        rotation,
        fgGlow,
        color
    );

    const componentProps = useMemo(
        () => ({
            normalizedValue,
            bipolar,
            thickness,
            roundness,
            openness,
            rotation,
            fgGlow,
            color,
        }),
        [normalizedValue, bipolar, thickness, roundness, openness, rotation, fgGlow, color]
    );

    return (
        <ControlSkeletonPage<number>
            componentName="ValueRing"
            codeSnippet={codeSnippet}
            PageComponent={RingWrapper}
            componentProps={componentProps}
            properties={properties}
            examples={examples}
            // Mock onChange since RingWrapper isn't interactive
            onChange={(event) => setNormalizedValue(event.value)}
        />
    );
}
