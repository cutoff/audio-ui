/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import { useState, useMemo } from "react";
import {
    FilmStripContinuousControl,
    FilmStripContinuousControlProps,
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

const VU3_IMAGE = "/images/demo/vu3.png";
const GUITAR_IMAGE = "/images/demo/guitar_strat_tone-2.png";
const ABS_IMAGE = "/images/demo/ABS.png";

function generateCodeSnippet(
    value: number,
    min: number,
    max: number,
    step: number | undefined,
    bipolar: boolean,
    frameWidth: number,
    frameHeight: number,
    frameCount: number,
    imageHref: string,
    orientation: "vertical" | "horizontal",
    frameRotation: number,
    label: string,
    interactionMode: InteractionMode | undefined,
    interactionDirection: InteractionDirection | undefined,
    interactionSensitivity: number | undefined,
    valueAsLabel: ValueLabelMode | undefined,
    unit: string | undefined,
    invertValue: boolean,
    defaultValue: number | undefined
): string {
    let props = `value={${value}} min={${min}} max={${max}} label="${label}"`;
    if (bipolar) props += ` bipolar={${bipolar}}`;
    if (step !== undefined) props += ` step={${step}}`;
    if (unit !== undefined) props += ` unit="${unit}"`;
    if (defaultValue !== undefined) props += ` defaultValue={${defaultValue}}`;
    props += `\n  frameWidth={${frameWidth}} frameHeight={${frameHeight}} frameCount={${frameCount}}`;
    props += `\n  imageHref="${imageHref}"`;
    if (orientation !== "vertical") props += ` orientation="${orientation}"`;
    if (frameRotation !== 0) props += ` frameRotation={${frameRotation}}`;
    if (interactionMode !== undefined) props += ` interactionMode="${interactionMode}"`;
    if (interactionDirection !== undefined) props += ` interactionDirection="${interactionDirection}"`;
    if (interactionSensitivity !== undefined) props += ` interactionSensitivity={${interactionSensitivity}}`;
    if (valueAsLabel !== undefined) props += ` valueAsLabel="${valueAsLabel}"`;
    if (invertValue) props += ` invertValue={${invertValue}}`;
    return `<FilmStripContinuousControl ${props}\n  onChange={(e) => setValue(e.value)}\n/>`;
}

export default function FilmStripContinuousDemoPage() {
    // Default props match VU Meter example
    const [value, setValue] = useState(-2);
    const [defaultValue, setDefaultValue] = useState<number | undefined>(-2);
    const [min, setMin] = useState(-7);
    const [max, setMax] = useState(3);
    const [step, setStep] = useState<number | undefined>(1);
    const [bipolar, setBipolar] = useState(false);
    const [frameWidth, setFrameWidth] = useState(120);
    const [frameHeight, setFrameHeight] = useState(80);
    const [frameCount, setFrameCount] = useState(48);
    const [imageHref, setImageHref] = useState(VU3_IMAGE);
    const [orientation, setOrientation] = useState<"vertical" | "horizontal">("vertical");
    const [frameRotation, setFrameRotation] = useState(0);
    const [label, setLabel] = useState("VU Meter");
    const [interactionMode, setInteractionMode] = useState<InteractionMode | undefined>(undefined);
    const [interactionDirection, setInteractionDirection] = useState<InteractionDirection | undefined>("horizontal");
    const [interactionSensitivity, setInteractionSensitivity] = useState<number | undefined>(undefined);
    const [valueAsLabel, setValueAsLabel] = useState<ValueLabelMode | undefined>("interactive");
    const [unit, setUnit] = useState<string | undefined>("VU");
    const [invertValue, setInvertValue] = useState(false);

    const handleExampleClick = (num: 0 | 1 | 2): void => {
        switch (num) {
            case 0:
                // VU Meter
                setValue(-2);
                setDefaultValue(-2);
                setMin(-7);
                setMax(3);
                setStep(1);
                setBipolar(false);
                setFrameWidth(120);
                setFrameHeight(80);
                setFrameCount(48);
                setImageHref(VU3_IMAGE);
                setOrientation("vertical");
                setFrameRotation(0);
                setLabel("VU Meter");
                setInteractionMode(undefined);
                setInteractionDirection("horizontal");
                setInteractionSensitivity(undefined);
                setValueAsLabel("interactive");
                setUnit("VU");
                setInvertValue(false);
                break;
            case 1:
                // Guitar Tone
                setValue(1);
                setDefaultValue(1);
                setMin(1);
                setMax(10);
                setStep(1);
                setBipolar(false);
                setFrameWidth(80);
                setFrameHeight(80);
                setFrameCount(31);
                setImageHref(GUITAR_IMAGE);
                setOrientation("vertical");
                setFrameRotation(0);
                setLabel("Tone");
                setInteractionMode(undefined);
                setInteractionDirection("circular");
                setInteractionSensitivity(undefined);
                setValueAsLabel("interactive");
                setUnit(undefined);
                setInvertValue(false);
                break;
            case 2:
                // ABS Knob
                setValue(150);
                setDefaultValue(150);
                setMin(0);
                setMax(199);
                setStep(1);
                setBipolar(false);
                setFrameWidth(128);
                setFrameHeight(128);
                setFrameCount(200);
                setImageHref(ABS_IMAGE);
                setOrientation("vertical");
                setFrameRotation(0);
                setLabel("ABS Knob");
                setInteractionMode(undefined);
                setInteractionDirection("circular");
                setInteractionSensitivity(undefined);
                setValueAsLabel(undefined);
                setUnit(undefined);
                setInvertValue(false);
                break;
        }
    };

    const componentProps: FilmStripContinuousControlProps = useMemo(
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
            frameCount,
            imageHref,
            orientation,
            frameRotation,
            interactionMode,
            interactionDirection,
            interactionSensitivity,
            valueAsLabel,
            unit,
            invertValue,
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
            frameCount,
            imageHref,
            orientation,
            frameRotation,
            interactionMode,
            interactionDirection,
            interactionSensitivity,
            valueAsLabel,
            unit,
            invertValue,
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
        frameCount,
        imageHref,
        orientation,
        frameRotation,
        label,
        interactionMode,
        interactionDirection,
        interactionSensitivity,
        valueAsLabel,
        unit,
        invertValue,
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
                    <SelectItem value="default">Default</SelectItem>
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
            <FilmStripContinuousControl
                key="vu3"
                value={-2}
                min={-7}
                max={3}
                label="VU Meter"
                frameWidth={120}
                frameHeight={80}
                frameCount={48}
                imageHref={VU3_IMAGE}
                interactionDirection="horizontal"
                valueAsLabel="interactive"
                unit="VU"
                size="large"
                onClick={() => handleExampleClick(0)}
            />,
            <FilmStripContinuousControl
                key="guitar"
                value={1}
                min={1}
                max={10}
                label="Tone"
                frameWidth={80}
                frameHeight={80}
                frameCount={31}
                imageHref={GUITAR_IMAGE}
                interactionDirection="circular"
                valueAsLabel="interactive"
                size="large"
                onClick={() => handleExampleClick(1)}
            />,
            <FilmStripContinuousControl
                key="abs"
                value={150}
                min={0}
                max={199}
                label="ABS Knob"
                frameWidth={128}
                frameHeight={128}
                frameCount={200}
                imageHref={ABS_IMAGE}
                interactionDirection="circular"
                size="large"
                onClick={() => handleExampleClick(2)}
            />,
        ],
        []
    );

    return (
        <ControlSkeletonPage<number>
            componentName="FilmStripContinuousControl"
            codeSnippet={codeSnippet}
            PageComponent={FilmStripContinuousControl}
            componentProps={componentProps}
            properties={properties}
            examples={examples}
            onChange={(e) => setValue(e.value)}
        />
    );
}
