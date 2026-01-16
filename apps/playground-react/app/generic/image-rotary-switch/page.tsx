/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import { useState, useMemo } from "react";
import { ImageRotarySwitch, ImageRotarySwitchProps, OptionView, AudioControlEvent } from "@cutoff/audio-ui-react";
import ControlSkeletonPage from "@/components/ControlSkeletonPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const KNOB_IMAGE = "/knob-volume.png";
const KNOB_TONE_IMAGE = "/knob-tone.png";
const KNOB_SELECTOR_IMAGE = "/knob-selector.png";

// Options for the discrete control
const defaultOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
];

// Volume example - 5 levels
const volumeOptions = [
    { value: 0, label: "0" },
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 4, label: "4" },
];

// Tone example - 3 positions
const toneOptions = [
    { value: "low", label: "Low" },
    { value: "mid", label: "Mid" },
    { value: "high", label: "High" },
];

// Selector example - 10 positions
const selectorOptions = Array.from({ length: 10 }, (_, i) => ({
    value: i,
    label: String(i),
}));

function generateCodeSnippet(
    value: string | number,
    frameWidth: number,
    frameHeight: number,
    imageHref: string,
    rotation: number,
    openness: number,
    label: string,
    options: Array<{ value: string | number; label: string }>
): string {
    const optionsCode = options
        .map((opt) => `    <OptionView value="${opt.value}">${opt.label}</OptionView>`)
        .join("\n");
    let props = `value="${value}" label="${label}"`;
    props += `\n  frameWidth={${frameWidth}} frameHeight={${frameHeight}}`;
    props += `\n  imageHref="${imageHref}"`;
    if (rotation !== 0) props += ` rotation={${rotation}}`;
    if (openness !== 90) props += ` openness={${openness}}`;
    return `<ImageRotarySwitch ${props}\n  onChange={(e) => setValue(e.value)}\n>\n${optionsCode}\n</ImageRotarySwitch>`;
}

export default function ImageRotarySwitchDemoPage() {
    const [value, setValue] = useState<string | number>("low");
    const [frameWidth, setFrameWidth] = useState(100);
    const [frameHeight, setFrameHeight] = useState(100);
    const [imageHref, setImageHref] = useState(KNOB_IMAGE);
    const [rotation, setRotation] = useState(0);
    const [openness, setOpenness] = useState(90);
    const [label, setLabel] = useState("Level");
    const [options, setOptions] = useState<Array<{ value: string | number; label: string }>>(defaultOptions);

    const handleExampleClick = (num: 0 | 1 | 2): void => {
        switch (num) {
            case 0:
                // Volume
                setValue(2);
                setFrameWidth(100);
                setFrameHeight(100);
                setImageHref(KNOB_IMAGE);
                setRotation(0);
                setOpenness(90);
                setLabel("Volume Level");
                setOptions(volumeOptions);
                break;
            case 1:
                // Tone
                setValue("mid");
                setFrameWidth(100);
                setFrameHeight(100);
                setImageHref(KNOB_TONE_IMAGE);
                setRotation(0);
                setOpenness(90);
                setLabel("Tone");
                setOptions(toneOptions);
                break;
            case 2:
                // Selector
                setValue(5);
                setFrameWidth(100);
                setFrameHeight(100);
                setImageHref(KNOB_SELECTOR_IMAGE);
                setRotation(0);
                setOpenness(90);
                setLabel("Selector");
                setOptions(selectorOptions);
                break;
        }
    };

    const componentProps: ImageRotarySwitchProps = useMemo(
        () => ({
            value,
            label,
            frameWidth,
            frameHeight,
            imageHref,
            rotation,
            openness,
            onChange: (e: AudioControlEvent<string | number>) => setValue(e.value),
            children: options.map((opt) => <OptionView key={opt.value} value={opt.value} />),
        }),
        [value, label, frameWidth, frameHeight, imageHref, rotation, openness, options]
    );

    const codeSnippet = generateCodeSnippet(
        value,
        frameWidth,
        frameHeight,
        imageHref,
        rotation,
        openness,
        label,
        options
    );

    const properties = [
        <div key="dimensions" className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
                <Label>Frame Width</Label>
                <Input type="number" value={frameWidth} onChange={(e) => setFrameWidth(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
                <Label>Frame Height</Label>
                <Input type="number" value={frameHeight} onChange={(e) => setFrameHeight(Number(e.target.value))} />
            </div>
        </div>,
        <div key="imageHref" className="space-y-2">
            <Label>Image URL</Label>
            <Input value={imageHref} onChange={(e) => setImageHref(e.target.value)} />
        </div>,
        <div key="rotation" className="grid gap-2">
            <Label>Rotation (degrees)</Label>
            <Input type="number" value={rotation} onChange={(e) => setRotation(Number(e.target.value))} />
        </div>,
        <div key="openness" className="grid gap-2">
            <Label>Openness (degrees)</Label>
            <Input type="number" value={openness} onChange={(e) => setOpenness(Number(e.target.value))} />
        </div>,
        <div key="label" className="space-y-2">
            <Label>Label</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} />
        </div>,
        <div key="value" className="grid gap-2">
            <Label>Current Value</Label>
            <Select
                value={String(value)}
                onValueChange={(val) => {
                    // Try to parse as number, otherwise use string
                    const numVal = Number(val);
                    setValue(isNaN(numVal) ? val : numVal);
                }}
            >
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {options.map((opt) => (
                        <SelectItem key={String(opt.value)} value={String(opt.value)}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>,
    ];

    const examples = useMemo(
        () => [
            <ImageRotarySwitch
                key="volume"
                value={2}
                label="Volume Level"
                frameWidth={100}
                frameHeight={100}
                imageHref={KNOB_IMAGE}
                size="large"
                onClick={() => handleExampleClick(0)}
            >
                {volumeOptions.map((opt) => (
                    <OptionView key={opt.value} value={opt.value}>
                        {opt.label}
                    </OptionView>
                ))}
            </ImageRotarySwitch>,
            <ImageRotarySwitch
                key="tone"
                value="mid"
                label="Tone"
                frameWidth={100}
                frameHeight={100}
                imageHref={KNOB_TONE_IMAGE}
                size="large"
                onClick={() => handleExampleClick(1)}
            >
                {toneOptions.map((opt) => (
                    <OptionView key={opt.value} value={opt.value}>
                        {opt.label}
                    </OptionView>
                ))}
            </ImageRotarySwitch>,
            <ImageRotarySwitch
                key="selector"
                value={5}
                label="Selector"
                frameWidth={100}
                frameHeight={100}
                imageHref={KNOB_SELECTOR_IMAGE}
                size="large"
                onClick={() => handleExampleClick(2)}
            >
                {selectorOptions.map((opt) => (
                    <OptionView key={opt.value} value={opt.value}>
                        {opt.label}
                    </OptionView>
                ))}
            </ImageRotarySwitch>,
        ],
        []
    );

    return (
        <ControlSkeletonPage<string | number>
            componentName="ImageRotarySwitch"
            codeSnippet={codeSnippet}
            PageComponent={ImageRotarySwitch}
            componentProps={componentProps}
            properties={properties}
            examples={examples}
            onChange={(e) => setValue(e.value)}
        />
    );
}
