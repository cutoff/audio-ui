/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import { useState, useMemo } from "react";
import { FilmStripBooleanControl, FilmStripBooleanControlProps, AudioControlEvent } from "@cutoff/audio-ui-react";
import ControlSkeletonPage from "@/components/ControlSkeletonPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SWITCH_METAL_IMAGE = "/switch_metal.png";
const BIG_BUTTON_IMAGE = "/big_button.png";
const POWER_SWITCH_IMAGE = "/Power_switch_01.png";

function generateCodeSnippet(
    value: boolean,
    latch: boolean,
    frameWidth: number,
    frameHeight: number,
    frameCount: number,
    imageHref: string,
    orientation: "vertical" | "horizontal",
    frameRotation: number,
    label: string,
    invertValue: boolean
): string {
    let props = `value={${value}} latch={${latch}} label="${label}"`;
    props += `\n  frameWidth={${frameWidth}} frameHeight={${frameHeight}} frameCount={${frameCount}}`;
    props += `\n  imageHref="${imageHref}"`;
    if (orientation !== "vertical") props += ` orientation="${orientation}"`;
    if (frameRotation !== 0) props += ` frameRotation={${frameRotation}}`;
    if (invertValue) props += ` invertValue={${invertValue}}`;
    return `<FilmStripBooleanControl ${props}\n  onChange={(e) => setValue(e.value)}\n/>`;
}

export default function FilmStripBooleanDemoPage() {
    const [value, setValue] = useState(false);
    const [latch, setLatch] = useState(true);
    const [frameWidth, setFrameWidth] = useState(64);
    const [frameHeight, setFrameHeight] = useState(64);
    const [frameCount, setFrameCount] = useState(2);
    const [imageHref, setImageHref] = useState(SWITCH_METAL_IMAGE);
    const [orientation, setOrientation] = useState<"vertical" | "horizontal">("vertical");
    const [frameRotation, setFrameRotation] = useState(0);
    const [label, setLabel] = useState("Power");
    const [invertValue, setInvertValue] = useState(true);

    const handleExampleClick = (num: 0 | 1 | 2): void => {
        switch (num) {
            case 0:
                // Metal Switch - Latch
                setValue(false);
                setLatch(true);
                setFrameWidth(64);
                setFrameHeight(64);
                setFrameCount(2);
                setImageHref(SWITCH_METAL_IMAGE);
                setOrientation("vertical");
                setFrameRotation(0);
                setLabel("Metal Switch");
                setInvertValue(true);
                break;
            case 1:
                // Big Button - Momentary
                setValue(false);
                setLatch(false);
                setFrameWidth(128);
                setFrameHeight(128);
                setFrameCount(2);
                setImageHref(BIG_BUTTON_IMAGE);
                setOrientation("vertical");
                setFrameRotation(0);
                setLabel("Big Button");
                setInvertValue(false);
                break;
            case 2:
                // Power Switch - Latch
                setValue(true);
                setLatch(true);
                setFrameWidth(100);
                setFrameHeight(100);
                setFrameCount(2);
                setImageHref(POWER_SWITCH_IMAGE);
                setOrientation("vertical");
                setFrameRotation(0);
                setLabel("Power Switch");
                setInvertValue(true);
                break;
        }
    };

    const componentProps: FilmStripBooleanControlProps = useMemo(
        () => ({
            value,
            latch,
            label,
            frameWidth,
            frameHeight,
            frameCount,
            imageHref,
            orientation,
            frameRotation,
            invertValue,
            onChange: (e: AudioControlEvent<boolean>) => setValue(e.value),
        }),
        [value, latch, label, frameWidth, frameHeight, frameCount, imageHref, orientation, frameRotation, invertValue]
    );

    const codeSnippet = generateCodeSnippet(
        value,
        latch,
        frameWidth,
        frameHeight,
        frameCount,
        imageHref,
        orientation,
        frameRotation,
        label,
        invertValue
    );

    const properties = [
        <div key="value" className="flex items-center gap-2">
            <Checkbox id="valueProp" checked={value} onCheckedChange={(checked) => setValue(checked === true)} />
            <Label htmlFor="valueProp" className="cursor-pointer">
                Value ({value ? "On" : "Off"})
            </Label>
        </div>,
        <div key="latch" className="flex items-center gap-2">
            <Checkbox id="latchProp" checked={latch} onCheckedChange={(checked) => setLatch(checked === true)} />
            <Label htmlFor="latchProp" className="cursor-pointer">
                Latch Mode (Toggle)
            </Label>
        </div>,
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
        <div key="invertValue" className="flex items-center gap-2">
            <Checkbox
                id="invertValueProp"
                checked={invertValue}
                onCheckedChange={(checked) => setInvertValue(checked === true)}
            />
            <Label htmlFor="invertValueProp" className="cursor-pointer">
                Invert Value
            </Label>
        </div>,
    ];

    const examples = useMemo(
        () => [
            <FilmStripBooleanControl
                key="switch-metal"
                value={false}
                latch={true}
                label="Metal Switch"
                frameWidth={64}
                frameHeight={64}
                frameCount={2}
                imageHref={SWITCH_METAL_IMAGE}
                invertValue={true}
                size="large"
                onClick={() => handleExampleClick(0)}
            />,
            <FilmStripBooleanControl
                key="big-button"
                value={false}
                latch={false}
                label="Big Button"
                frameWidth={128}
                frameHeight={128}
                frameCount={2}
                imageHref={BIG_BUTTON_IMAGE}
                size="large"
                onClick={() => handleExampleClick(1)}
            />,
            <FilmStripBooleanControl
                key="power-switch"
                value={true}
                latch={true}
                label="Power Switch"
                frameWidth={100}
                frameHeight={100}
                frameCount={2}
                imageHref={POWER_SWITCH_IMAGE}
                invertValue={true}
                size="large"
                onClick={() => handleExampleClick(2)}
            />,
        ],
        []
    );

    return (
        <ControlSkeletonPage<boolean>
            componentName="FilmStripBooleanControl"
            codeSnippet={codeSnippet}
            PageComponent={FilmStripBooleanControl}
            componentProps={componentProps}
            properties={properties}
            examples={examples}
            onChange={(e) => setValue(e.value)}
        />
    );
}
