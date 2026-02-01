/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import { useState, useMemo } from "react";
import { ImageSwitch, ImageSwitchComponentProps, AudioControlEvent } from "@cutoff/audio-ui-react";
import ControlSkeletonPage from "@/components/ControlSkeletonPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const STAR_OFF_IMAGE = "/images/demo/star-off.png";
const STAR_ON_IMAGE = "/images/demo/star-on.png";

function generateCodeSnippet(
    value: boolean,
    latch: boolean,
    frameWidth: number,
    frameHeight: number,
    imageHrefFalse: string,
    imageHrefTrue: string,
    label: string
): string {
    let props = `value={${value}} latch={${latch}} label="${label}"`;
    props += `\n  frameWidth={${frameWidth}} frameHeight={${frameHeight}}`;
    props += `\n  imageHrefFalse="${imageHrefFalse}" imageHrefTrue="${imageHrefTrue}"`;
    return `<ImageSwitch ${props}\n  onChange={(e) => setValue(e.value)}\n/>`;
}

export default function ImageSwitchDemoPage() {
    const [value, setValue] = useState(false);
    const [latch, setLatch] = useState(false);
    const [frameWidth, setFrameWidth] = useState(100);
    const [frameHeight, setFrameHeight] = useState(100);
    const [imageHrefFalse, setImageHrefFalse] = useState(STAR_OFF_IMAGE);
    const [imageHrefTrue, setImageHrefTrue] = useState(STAR_ON_IMAGE);
    const [label, setLabel] = useState("Meme Switch");

    const handleExampleClick = (): void => {
        // Meme Switch - Momentary
        setValue(false);
        setLatch(false);
        setFrameWidth(100);
        setFrameHeight(100);
        setImageHrefFalse(STAR_OFF_IMAGE);
        setImageHrefTrue(STAR_ON_IMAGE);
        setLabel("Meme Switch");
    };

    const componentProps: ImageSwitchComponentProps = useMemo(
        () => ({
            value,
            latch,
            label,
            frameWidth,
            frameHeight,
            imageHrefFalse,
            imageHrefTrue,
            onChange: (e: AudioControlEvent<boolean>) => setValue(e.value),
        }),
        [value, latch, label, frameWidth, frameHeight, imageHrefFalse, imageHrefTrue]
    );

    const codeSnippet = generateCodeSnippet(
        value,
        latch,
        frameWidth,
        frameHeight,
        imageHrefFalse,
        imageHrefTrue,
        label
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
        <div key="imageHrefFalse" className="space-y-2">
            <Label>Image URL (False/Off)</Label>
            <Input value={imageHrefFalse} onChange={(e) => setImageHrefFalse(e.target.value)} />
        </div>,
        <div key="imageHrefTrue" className="space-y-2">
            <Label>Image URL (True/On)</Label>
            <Input value={imageHrefTrue} onChange={(e) => setImageHrefTrue(e.target.value)} />
        </div>,
        <div key="label" className="space-y-2">
            <Label>Label</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} />
        </div>,
    ];

    const examples = useMemo(
        () => [
            <ImageSwitch
                key="star"
                value={false}
                latch={false}
                label="Meme Switch"
                frameWidth={100}
                frameHeight={100}
                imageHrefFalse={STAR_OFF_IMAGE}
                imageHrefTrue={STAR_ON_IMAGE}
                size="large"
                onClick={() => handleExampleClick()}
            />,
        ],
        []
    );

    return (
        <ControlSkeletonPage<boolean>
            componentName="ImageSwitch"
            codeSnippet={codeSnippet}
            PageComponent={ImageSwitch}
            componentProps={componentProps}
            properties={properties}
            examples={examples}
            onChange={(e) => setValue(e.value)}
        />
    );
}
