/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import { useState, useMemo } from "react";
import {
    FilmStripDiscreteControl,
    FilmStripDiscreteControlProps,
    Option,
    AudioControlEvent,
} from "@cutoff/audio-ui-react";
import ControlSkeletonPage from "@/components/ControlSkeletonPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const VU3_IMAGE = "/vu3.png";
const GUITAR_IMAGE = "/guitar_strat_tone-2.png";
const ABS_IMAGE = "/ABS.png";

// Options for the discrete control
const defaultOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
];

// VU Meter example - 3 levels
const vuOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
];

// Guitar tone example - 5 positions
const guitarOptions = [
    { value: 0, label: "0" },
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 4, label: "4" },
];

// ABS knob example - 10 positions
const absOptions = Array.from({ length: 10 }, (_, i) => ({
    value: i,
    label: String(i),
}));

function generateCodeSnippet(
    value: string | number,
    frameWidth: number,
    frameHeight: number,
    frameCount: number,
    imageHref: string,
    orientation: "vertical" | "horizontal",
    frameRotation: number,
    label: string,
    options: Array<{ value: string | number; label: string }>
): string {
    const optionsCode = options.map((opt) => `    <Option value="${opt.value}">${opt.label}</Option>`).join("\n");
    let props = `value="${value}" label="${label}"`;
    props += `\n  frameWidth={${frameWidth}} frameHeight={${frameHeight}} frameCount={${frameCount}}`;
    props += `\n  imageHref="${imageHref}"`;
    if (orientation !== "vertical") props += ` orientation="${orientation}"`;
    if (frameRotation !== 0) props += ` frameRotation={${frameRotation}}`;
    return `<FilmStripDiscreteControl ${props}\n  onChange={(e) => setValue(e.value)}\n>\n${optionsCode}\n</FilmStripDiscreteControl>`;
}

export default function FilmStripDiscreteDemoPage() {
    const [value, setValue] = useState<string | number>("low");
    const [frameWidth, setFrameWidth] = useState(120);
    const [frameHeight, setFrameHeight] = useState(80);
    const [frameCount, setFrameCount] = useState(48);
    const [imageHref, setImageHref] = useState(VU3_IMAGE);
    const [orientation, setOrientation] = useState<"vertical" | "horizontal">("vertical");
    const [frameRotation, setFrameRotation] = useState(0);
    const [label, setLabel] = useState("Level");
    const [options, setOptions] = useState<Array<{ value: string | number; label: string }>>(defaultOptions);

    const handleExampleClick = (num: 0 | 1 | 2): void => {
        switch (num) {
            case 0:
                // VU Meter
                setValue("medium");
                setFrameWidth(120);
                setFrameHeight(80);
                setFrameCount(48);
                setImageHref(VU3_IMAGE);
                setOrientation("vertical");
                setFrameRotation(0);
                setLabel("VU Level");
                setOptions(vuOptions);
                break;
            case 1:
                // Guitar Tone
                setValue(2);
                setFrameWidth(80);
                setFrameHeight(80);
                setFrameCount(31);
                setImageHref(GUITAR_IMAGE);
                setOrientation("vertical");
                setFrameRotation(0);
                setLabel("Tone Position");
                setOptions(guitarOptions);
                break;
            case 2:
                // ABS Knob
                setValue(5);
                setFrameWidth(128);
                setFrameHeight(128);
                setFrameCount(200);
                setImageHref(ABS_IMAGE);
                setOrientation("vertical");
                setFrameRotation(0);
                setLabel("ABS Position");
                setOptions(absOptions);
                break;
        }
    };

    const componentProps: FilmStripDiscreteControlProps = useMemo(
        () => ({
            value,
            label,
            frameWidth,
            frameHeight,
            frameCount,
            imageHref,
            orientation,
            frameRotation,
            onChange: (e: AudioControlEvent<string | number>) => setValue(e.value),
            children: options.map((opt) => <Option key={opt.value} value={opt.value} />),
        }),
        [value, label, frameWidth, frameHeight, frameCount, imageHref, orientation, frameRotation, options]
    );

    const codeSnippet = generateCodeSnippet(
        value,
        frameWidth,
        frameHeight,
        frameCount,
        imageHref,
        orientation,
        frameRotation,
        label,
        options
    );

    const properties = [
        <div key="dimensions" className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
                <Label>Frame Width</Label>
                <Input type="number" value={frameWidth} onChange={(e) => setFrameWidth(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
                <Label>Frame Height</Label>
                <Input type="number" value={frameHeight} onChange={(e) => setFrameHeight(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
                <Label>Frame Count</Label>
                <Input type="number" value={frameCount} onChange={(e) => setFrameCount(Number(e.target.value))} />
            </div>
        </div>,
        <div key="imageHref" className="space-y-2">
            <Label>Image URL</Label>
            <Input value={imageHref} onChange={(e) => setImageHref(e.target.value)} />
        </div>,
        <div key="orientation" className="grid gap-2">
            <Label>Orientation</Label>
            <Select value={orientation} onValueChange={(value) => setOrientation(value as "vertical" | "horizontal")}>
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="vertical">Vertical</SelectItem>
                    <SelectItem value="horizontal">Horizontal</SelectItem>
                </SelectContent>
            </Select>
        </div>,
        <div key="frameRotation" className="grid gap-2">
            <Label>Frame Rotation (degrees)</Label>
            <Input type="number" value={frameRotation} onChange={(e) => setFrameRotation(Number(e.target.value))} />
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
            <FilmStripDiscreteControl
                key="vu3"
                value="medium"
                label="VU Level"
                frameWidth={120}
                frameHeight={80}
                frameCount={48}
                imageHref={VU3_IMAGE}
                size="large"
                style={{ cursor: "pointer" }}
                onClick={() => handleExampleClick(0)}
            >
                {vuOptions.map((opt) => (
                    <Option key={opt.value} value={opt.value}>
                        {opt.label}
                    </Option>
                ))}
            </FilmStripDiscreteControl>,
            <FilmStripDiscreteControl
                key="guitar"
                value={2}
                label="Tone Position"
                frameWidth={80}
                frameHeight={80}
                frameCount={31}
                imageHref={GUITAR_IMAGE}
                size="large"
                style={{ cursor: "pointer" }}
                onClick={() => handleExampleClick(1)}
            >
                {guitarOptions.map((opt) => (
                    <Option key={opt.value} value={opt.value}>
                        {opt.label}
                    </Option>
                ))}
            </FilmStripDiscreteControl>,
            <FilmStripDiscreteControl
                key="abs"
                value={5}
                label="ABS Position"
                frameWidth={128}
                frameHeight={128}
                frameCount={200}
                imageHref={ABS_IMAGE}
                size="large"
                style={{ cursor: "pointer" }}
                onClick={() => handleExampleClick(2)}
            >
                {absOptions.map((opt) => (
                    <Option key={opt.value} value={opt.value}>
                        {opt.label}
                    </Option>
                ))}
            </FilmStripDiscreteControl>,
        ],
        []
    );

    return (
        <ControlSkeletonPage<string | number>
            componentName="FilmStripDiscreteControl"
            codeSnippet={codeSnippet}
            PageComponent={FilmStripDiscreteControl}
            componentProps={componentProps}
            properties={properties}
            examples={examples}
            onChange={(e) => setValue(e.value)}
        />
    );
}
