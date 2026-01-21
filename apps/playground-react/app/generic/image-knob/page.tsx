/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import { useState, useMemo } from "react";
import {
    ImageKnob,
    ImageKnobProps,
    AudioControlEvent,
    ValueLabelMode,
    InteractionMode,
    InteractionDirection,
} from "@cutoff/audio-ui-react";
import ControlSkeletonPage from "@/components/ControlSkeletonPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const KNOB_IMAGE = "/knob-volume.png";
const KNOB_TONE_IMAGE = "/knob-tone.png";
const FINGER_POINTING_IMAGE = "/finger-pointing.png";

function generateCodeSnippet(
    value: number,
    min: number,
    max: number,
    step: number | undefined,
    bipolar: boolean,
    frameWidth: number,
    frameHeight: number,
    imageHref: string,
    rotation: number,
    openness: number,
    label: string,
    interactionMode: InteractionMode | undefined,
    interactionDirection: InteractionDirection | undefined,
    interactionSensitivity: number | undefined,
    valueAsLabel: ValueLabelMode | undefined,
    unit: string | undefined,
    defaultValue: number | undefined
): string {
    let props = `value={${value}} min={${min}} max={${max}} label="${label}"`;
    if (bipolar) props += ` bipolar={${bipolar}}`;
    if (step !== undefined) props += ` step={${step}}`;
    if (unit !== undefined) props += ` unit="${unit}"`;
    if (defaultValue !== undefined) props += ` defaultValue={${defaultValue}}`;
    props += `\n  frameWidth={${frameWidth}} frameHeight={${frameHeight}}`;
    props += `\n  imageHref="${imageHref}"`;
    if (rotation !== 0) props += ` rotation={${rotation}}`;
    if (openness !== 90) props += ` openness={${openness}}`;
    if (interactionMode !== undefined) props += ` interactionMode="${interactionMode}"`;
    if (interactionDirection !== undefined) props += ` interactionDirection="${interactionDirection}"`;
    if (interactionSensitivity !== undefined) props += ` interactionSensitivity={${interactionSensitivity}}`;
    if (valueAsLabel !== undefined) props += ` valueAsLabel="${valueAsLabel}"`;
    return `<ImageKnob ${props}\n  onChange={(e) => setValue(e.value)}\n/>`;
}

export default function ImageKnobDemoPage() {
    // Default props match Volume Knob example
    const [value, setValue] = useState(50);
    const [defaultValue, setDefaultValue] = useState<number | undefined>(50);
    const [min, setMin] = useState(0);
    const [max, setMax] = useState(100);
    const [step, setStep] = useState<number | undefined>(undefined);
    const [bipolar, setBipolar] = useState(false);
    const [frameWidth, setFrameWidth] = useState(100);
    const [frameHeight, setFrameHeight] = useState(100);
    const [imageHref, setImageHref] = useState(KNOB_IMAGE);
    const [rotation, setRotation] = useState(0);
    const [openness, setOpenness] = useState(90);
    const [label, setLabel] = useState("Volume");
    const [interactionMode, setInteractionMode] = useState<InteractionMode | undefined>(undefined);
    const [interactionDirection, setInteractionDirection] = useState<InteractionDirection | undefined>("circular");
    const [interactionSensitivity, setInteractionSensitivity] = useState<number | undefined>(undefined);
    const [valueAsLabel, setValueAsLabel] = useState<ValueLabelMode | undefined>("interactive");
    const [unit, setUnit] = useState<string | undefined>("%");

    const handleExampleClick = (num: 0 | 1 | 2): void => {
        switch (num) {
            case 0:
                // Volume Knob
                setValue(50);
                setDefaultValue(50);
                setMin(0);
                setMax(100);
                setStep(undefined);
                setBipolar(false);
                setFrameWidth(100);
                setFrameHeight(100);
                setImageHref(KNOB_IMAGE);
                setRotation(0);
                setOpenness(90);
                setLabel("Volume");
                setInteractionMode(undefined);
                setInteractionDirection("circular");
                setInteractionSensitivity(undefined);
                setValueAsLabel("interactive");
                setUnit("%");
                break;
            case 1:
                // Tone Knob
                setValue(5);
                setDefaultValue(5);
                setMin(1);
                setMax(10);
                setStep(1);
                setBipolar(false);
                setFrameWidth(100);
                setFrameHeight(100);
                setImageHref(KNOB_TONE_IMAGE);
                setRotation(0);
                setOpenness(90);
                setLabel("Tone");
                setInteractionMode(undefined);
                setInteractionDirection("circular");
                setInteractionSensitivity(undefined);
                setValueAsLabel("interactive");
                setUnit(undefined);
                break;
            case 2:
                // Finger Pointing
                setValue(3);
                setDefaultValue(3);
                setMin(0);
                setMax(10);
                setStep(1);
                setBipolar(false);
                setFrameWidth(100);
                setFrameHeight(100);
                setImageHref(FINGER_POINTING_IMAGE);
                setRotation(0);
                setOpenness(90);
                setLabel("Direction");
                setInteractionMode(undefined);
                setInteractionDirection("circular");
                setInteractionSensitivity(undefined);
                setValueAsLabel(undefined);
                setUnit(undefined);
                break;
        }
    };

    const componentProps: ImageKnobProps = useMemo(
        () => ({
            value,
            defaultValue,
            min,
            max,
            step,
            bipolar,
            label,
            frameWidth,
            frameHeight,
            imageHref,
            rotation,
            openness,
            interactionMode,
            interactionDirection,
            interactionSensitivity,
            valueAsLabel,
            unit,
            onChange: (e: AudioControlEvent<number>) => setValue(e.value),
        }),
        [
            value,
            defaultValue,
            min,
            max,
            step,
            bipolar,
            label,
            frameWidth,
            frameHeight,
            imageHref,
            rotation,
            openness,
            interactionMode,
            interactionDirection,
            interactionSensitivity,
            valueAsLabel,
            unit,
        ]
    );

    const codeSnippet = generateCodeSnippet(
        value,
        min,
        max,
        step,
        bipolar,
        frameWidth,
        frameHeight,
        imageHref,
        rotation,
        openness,
        label,
        interactionMode,
        interactionDirection,
        interactionSensitivity,
        valueAsLabel,
        unit,
        defaultValue
    );

    const properties = [
        <div key="value" className="space-y-4">
            <div className="flex justify-between items-center">
                <Label>Value ({value})</Label>
            </div>
            <Slider value={[value]} onValueChange={(vals) => setValue(vals[0])} min={min} max={max} step={step ?? 1} />
        </div>,
        <div key="range" className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
                <Label>Min</Label>
                <Input type="number" value={min} onChange={(e) => setMin(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
                <Label>Max</Label>
                <Input type="number" value={max} onChange={(e) => setMax(Number(e.target.value))} />
            </div>
        </div>,
        <div key="step" className="grid gap-2">
            <Label>Step</Label>
            <Input
                type="number"
                value={step !== undefined ? step : ""}
                onChange={(e) => {
                    const val = e.target.value === "" ? undefined : Number(e.target.value);
                    setStep(val);
                }}
                placeholder="Continuous"
            />
        </div>,
        <div key="defaultValue" className="grid gap-2">
            <Label>Default Value</Label>
            <Input
                type="number"
                value={defaultValue !== undefined ? defaultValue : ""}
                onChange={(e) => {
                    const val = e.target.value === "" ? undefined : Number(e.target.value);
                    setDefaultValue(val);
                }}
                placeholder="Auto (0.0 unipolar, 0.5 bipolar)"
            />
        </div>,
        <div key="bipolar" className="flex items-center gap-2">
            <Checkbox id="bipolarProp" checked={bipolar} onCheckedChange={(checked) => setBipolar(checked === true)} />
            <Label htmlFor="bipolarProp" className="cursor-pointer">
                Bipolar
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
        <div key="interactionMode" className="grid gap-2">
            <Label>Interaction Mode</Label>
            <Select
                value={interactionMode === undefined ? "default" : interactionMode}
                onValueChange={(value) => {
                    if (value === "default") {
                        setInteractionMode(undefined);
                    } else {
                        setInteractionMode(value as InteractionMode);
                    }
                }}
            >
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="default">Default (Both)</SelectItem>
                    <SelectItem value="drag">Drag Only</SelectItem>
                    <SelectItem value="wheel">Wheel Only</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                </SelectContent>
            </Select>
        </div>,
        <div key="interactionDirection" className="grid gap-2">
            <Label>Interaction Direction</Label>
            <Select
                value={interactionDirection === undefined ? "default" : interactionDirection}
                onValueChange={(value) => {
                    if (value === "default") {
                        setInteractionDirection(undefined);
                    } else {
                        setInteractionDirection(value as InteractionDirection);
                    }
                }}
            >
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="default">Default (Circular)</SelectItem>
                    <SelectItem value="vertical">Vertical</SelectItem>
                    <SelectItem value="horizontal">Horizontal</SelectItem>
                    <SelectItem value="circular">Circular</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                </SelectContent>
            </Select>
        </div>,
        <div key="interactionSensitivity" className="grid gap-2">
            <Label>Interaction Sensitivity</Label>
            <Input
                type="number"
                step="0.001"
                value={interactionSensitivity !== undefined ? interactionSensitivity : ""}
                onChange={(e) => {
                    const val = e.target.value === "" ? undefined : Number(e.target.value);
                    setInteractionSensitivity(val);
                }}
                placeholder="Default"
            />
        </div>,
        <div key="valueAsLabel" className="grid gap-2">
            <Label>Value as Label</Label>
            <Select
                value={valueAsLabel === undefined ? "default" : valueAsLabel}
                onValueChange={(value) => {
                    if (value === "default") {
                        setValueAsLabel(undefined);
                    } else {
                        setValueAsLabel(value as ValueLabelMode);
                    }
                }}
            >
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="default">Default (Label Only)</SelectItem>
                    <SelectItem value="labelOnly">Label Only</SelectItem>
                    <SelectItem value="valueOnly">Value Only</SelectItem>
                    <SelectItem value="interactive">Interactive</SelectItem>
                </SelectContent>
            </Select>
        </div>,
        <div key="unit" className="grid gap-2">
            <Label>Unit</Label>
            <Input
                value={unit !== undefined ? unit : ""}
                onChange={(e) => {
                    const val = e.target.value === "" ? undefined : e.target.value;
                    setUnit(val);
                }}
                placeholder="None"
            />
        </div>,
    ];

    const examples = useMemo(
        () => [
            <ImageKnob
                key="volume"
                value={50}
                min={0}
                max={100}
                label="Volume"
                frameWidth={100}
                frameHeight={100}
                imageHref={KNOB_IMAGE}
                interactionDirection="circular"
                valueAsLabel="interactive"
                unit="%"
                size="large"
                onClick={() => handleExampleClick(0)}
            />,
            <ImageKnob
                key="tone"
                value={5}
                min={1}
                max={10}
                label="Tone"
                frameWidth={100}
                frameHeight={100}
                imageHref={KNOB_TONE_IMAGE}
                interactionDirection="circular"
                valueAsLabel="interactive"
                size="large"
                onClick={() => handleExampleClick(1)}
            />,
            <ImageKnob
                key="finger-pointing"
                value={3}
                min={0}
                max={10}
                label="Direction"
                frameWidth={100}
                frameHeight={100}
                imageHref={FINGER_POINTING_IMAGE}
                interactionDirection="circular"
                size="large"
                onClick={() => handleExampleClick(2)}
            />,
        ],
        []
    );

    return (
        <ControlSkeletonPage<number>
            componentName="ImageKnob"
            codeSnippet={codeSnippet}
            PageComponent={ImageKnob}
            componentProps={componentProps}
            properties={properties}
            examples={examples}
            onChange={(e) => setValue(e.value)}
        />
    );
}
