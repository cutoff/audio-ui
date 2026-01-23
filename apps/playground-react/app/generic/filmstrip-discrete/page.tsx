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
    OptionView,
    AudioControlEvent,
} from "@cutoff/audio-ui-react";
import ControlSkeletonPage from "@/components/ControlSkeletonPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TRAFFIC_LIGHT_FILMSTRIP = "/traffic-light-filmstrip.png";

// Traffic Light example - 8 states
const trafficLightOptions = Array.from({ length: 8 }, (_, i) => ({
    value: i + 1,
    label: `State ${i + 1}`,
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
    const optionsCode = options
        .map((opt) => `    <OptionView value="${opt.value}">${opt.label}</OptionView>`)
        .join("\n");
    let props = `value="${value}" label="${label}"`;
    props += `\n  frameWidth={${frameWidth}} frameHeight={${frameHeight}} frameCount={${frameCount}}`;
    props += `\n  imageHref="${imageHref}"`;
    if (orientation !== "vertical") props += ` orientation="${orientation}"`;
    if (frameRotation !== 0) props += ` frameRotation={${frameRotation}}`;
    return `<FilmStripDiscreteControl ${props}\n  onChange={(e) => setValue(e.value)}\n>\n${optionsCode}\n</FilmStripDiscreteControl>`;
}

export default function FilmStripDiscreteDemoPage() {
    const [value, setValue] = useState<string | number>(4);
    const [frameWidth, setFrameWidth] = useState(103);
    const [frameHeight, setFrameHeight] = useState(260);
    const [frameCount, setFrameCount] = useState(8);
    const [imageHref, setImageHref] = useState(TRAFFIC_LIGHT_FILMSTRIP);
    const [orientation, setOrientation] = useState<"vertical" | "horizontal">("vertical");
    const [frameRotation, setFrameRotation] = useState(0);
    const [label, setLabel] = useState("Traffic Light");
    const [options] = useState<Array<{ value: string | number; label: string }>>(trafficLightOptions);

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
            children: options.map((opt) => <OptionView key={opt.value} value={opt.value} />),
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
                key="traffic-light"
                value={4}
                label="Traffic Light"
                frameWidth={103}
                frameHeight={260}
                frameCount={8}
                imageHref={TRAFFIC_LIGHT_FILMSTRIP}
                size="large"
            >
                {trafficLightOptions.map((opt) => (
                    <OptionView key={opt.value} value={opt.value}>
                        {opt.label}
                    </OptionView>
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
