/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import React, { useState } from "react";
import { Slider, ValueLabelMode, AudioParameter, AudioControlEvent } from "@cutoff/audio-ui-react";
import ControlSkeletonPage from "@/components/ControlSkeletonPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ColorPickerField } from "@/components/ColorPickerField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// MIDI bipolar formatter for demo purposes
const midiBipolarFormatter = (value: number, parameterDef: AudioParameter): string | undefined => {
    if (parameterDef.type !== "continuous") {
        return undefined; // Fall back to default formatter for non-continuous parameters
    }
    const { min, max } = parameterDef;
    const centerValue = Math.floor((max - min + 1) / 2) + min;
    const shiftedValue = value - centerValue;
    return shiftedValue > 0 ? `+${shiftedValue}` : shiftedValue.toString();
};

// Pan formatter for L100-C-R100 display
const panFormatter = (value: number, parameterDef: AudioParameter): string | undefined => {
    if (parameterDef.type !== "continuous") {
        return undefined;
    }
    if (value === 0) return "C";
    const side = value < 0 ? "L" : "R";
    const pct = Math.round(Math.abs(value));
    return `${side}${pct}`;
};

export type SliderPageProps = {
    orientation: "horizontal" | "vertical";
};

type SliderComponentProps = {
    value: number;
    min: number;
    max: number;
    step?: number;
    label?: string;
    bipolar?: boolean;
    useMidiBipolar?: boolean;
    thickness?: number;
    roundness?: number;
    color?: string;
    valueAsLabel?: ValueLabelMode;
    unit?: string;
    orientation: "horizontal" | "vertical";
    adaptiveSize?: boolean;
    onChange?: (event: AudioControlEvent<number | string>) => void;
    onClick?: () => void;
    style?: React.CSSProperties;
    className?: string;
    size?: "xsmall" | "small" | "normal" | "large" | "xlarge";
};

function SliderComponent({
    value,
    min,
    max,
    step,
    label,
    bipolar,
    useMidiBipolar,
    thickness,
    roundness,
    color,
    valueAsLabel,
    unit,
    orientation,
    adaptiveSize,
    onChange,
    onClick,
    style,
    className,
    size,
}: SliderComponentProps) {
    return (
        <Slider
            min={min}
            max={max}
            step={step}
            value={value}
            label={label}
            bipolar={bipolar}
            roundness={roundness}
            thickness={thickness}
            style={style}
            className={className}
            onClick={onClick}
            onChange={onChange}
            size={size}
            adaptiveSize={adaptiveSize}
            color={color}
            valueAsLabel={valueAsLabel}
            unit={unit}
            orientation={orientation}
            valueFormatter={
                bipolar && useMidiBipolar
                    ? midiBipolarFormatter
                    : bipolar && min === -100 && max === 100 && unit === undefined
                      ? panFormatter
                      : undefined
            }
        />
    );
}

export default function SliderPage({ orientation }: SliderPageProps) {
    const [value, setValue] = useState(42);
    const [min, setMin] = useState(0);
    const [max, setMax] = useState(100);
    const [step, setStep] = useState<number | undefined>(1);
    const [label, setLabel] = useState("Default");
    const [bipolar, setBipolar] = useState(false);
    const [useMidiBipolar, setUseMidiBipolar] = useState(false);
    const [thickness, setThickness] = useState<number | undefined>(undefined);
    const [roundness, setRoundness] = useState<number | undefined>(undefined);
    const [color, setColor] = useState<string | undefined>(undefined); // Allow undefined to use theme values
    const [valueAsLabel, setValueAsLabel] = useState<ValueLabelMode | undefined>(undefined);
    const [unit, setUnit] = useState<string | undefined>(undefined);

    // Generate code snippet with all props
    function generateCodeSnippet(): string {
        let props = `min={${min}} max={${max}} value={${value}} label='${label}' bipolar={${bipolar}}`;

        if (step !== undefined) {
            props += ` step={${step}}`;
        }

        if (thickness !== undefined) {
            props += ` thickness={${thickness}}`;
        }

        if (roundness !== undefined) {
            props += ` roundness={${roundness}}`;
        }

        props += ` orientation='${orientation}'`;

        if (color !== undefined) {
            props += ` color='${color}'`;
        }

        if (unit !== undefined) {
            props += ` unit='${unit}'`;
        }

        if (valueAsLabel !== undefined) {
            props += ` valueAsLabel='${valueAsLabel}'`;
        }

        // Add valueFormatter prop if using MIDI bipolar formatter or pan formatter
        if (bipolar && useMidiBipolar) {
            return `<Slider ${props}
  valueFormatter={midiBipolarFormatter}
/>`;
        }

        // Check if it's a pan control (bipolar, -100 to 100, no unit)
        if (bipolar && min === -100 && max === 100 && unit === undefined) {
            return `<Slider ${props}
  valueFormatter={panFormatter}
/>`;
        }

        return `<Slider ${props} />`;
    }

    const codeString = generateCodeSnippet();

    const handleExampleClick = (num: 0 | 1 | 2 | 3 | 4 | 5): void => {
        switch (num) {
            case 0:
                // Volume - unipolar, percentage
                setValue(75);
                setMin(0);
                setMax(100);
                setStep(1);
                setLabel("Volume");
                setBipolar(false);
                setUseMidiBipolar(false);
                setThickness(undefined);
                setRoundness(undefined);
                setColor(undefined);
                setValueAsLabel("interactive");
                setUnit("%");
                break;
            case 1:
                // Pan - bipolar, L100-C-R100 format
                setValue(0);
                setMin(-100);
                setMax(100);
                setStep(1);
                setLabel("Pan");
                setBipolar(true);
                setUseMidiBipolar(false);
                setThickness(undefined);
                setRoundness(undefined);
                setColor(undefined);
                setValueAsLabel("interactive");
                setUnit(undefined);
                break;
            case 2:
                // Cutoff - unipolar, MIDI range, no unit
                setValue(64);
                setMin(0);
                setMax(127);
                setStep(1);
                setLabel("Cutoff");
                setBipolar(false);
                setUseMidiBipolar(false);
                setThickness(undefined);
                setRoundness(undefined);
                setColor(undefined);
                setValueAsLabel("interactive");
                setUnit(undefined);
                break;
            case 3:
                // Gain - bipolar, dB, decimal step
                setValue(0);
                setMin(-12);
                setMax(12);
                setStep(0.1);
                setLabel("Gain");
                setBipolar(true);
                setUseMidiBipolar(false);
                setThickness(undefined);
                setRoundness(undefined);
                setColor(undefined);
                setValueAsLabel("interactive");
                setUnit("dB");
                break;
            case 4:
                // Delay Time - unipolar, milliseconds, larger range, step 10
                setValue(500);
                setMin(0);
                setMax(2000);
                setStep(10);
                setLabel("Delay");
                setBipolar(false);
                setUseMidiBipolar(false);
                setThickness(undefined);
                setRoundness(undefined);
                setColor(undefined);
                setValueAsLabel("interactive");
                setUnit("ms");
                break;
            case 5:
                // Tuning - bipolar, cents, smaller range
                setValue(0);
                setMin(-50);
                setMax(50);
                setStep(1);
                setLabel("Tuning");
                setBipolar(true);
                setUseMidiBipolar(false);
                setThickness(undefined);
                setRoundness(undefined);
                setColor(undefined);
                setValueAsLabel("interactive");
                setUnit("cents");
                break;
        }
    };

    const componentProps = {
        min,
        bipolar,
        useMidiBipolar,
        max,
        step,
        value,
        label,
        thickness,
        roundness,
        orientation,
        color,
        valueAsLabel,
        unit,
    };

    const properties = [
        <div key="label" className="grid gap-2">
            <Label htmlFor="labelProp">Label</Label>
            <Input id="labelProp" value={label} onChange={(e) => setLabel(e.target.value)} />
        </div>,
        <div key="min" className="grid gap-2">
            <Label htmlFor="minProp">Min</Label>
            <Input id="minProp" type="number" value={min} onChange={(e) => setMin(Number(e.target.value))} />
        </div>,
        <div key="max" className="grid gap-2">
            <Label htmlFor="maxProp">Max</Label>
            <Input id="maxProp" type="number" value={max} onChange={(e) => setMax(Number(e.target.value))} />
        </div>,
        <div key="step" className="grid gap-2">
            <Label htmlFor="stepProp">Step</Label>
            <Input
                id="stepProp"
                type="number"
                value={step !== undefined ? step : ""}
                onChange={(e) => {
                    const val = e.target.value === "" ? undefined : Number(e.target.value);
                    setStep(val);
                }}
                placeholder="Continuous"
            />
        </div>,
        <div key="unit" className="grid gap-2">
            <Label htmlFor="unitProp">Unit</Label>
            <Input
                id="unitProp"
                value={unit !== undefined ? unit : ""}
                onChange={(e) => {
                    const val = e.target.value === "" ? undefined : e.target.value;
                    setUnit(val);
                }}
                placeholder="None"
            />
        </div>,
        <div key="thickness" className="grid gap-2">
            <Label htmlFor="thicknessProp">Thickness (0.0-1.0)</Label>
            <Input
                id="thicknessProp"
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={thickness !== undefined ? thickness : ""}
                onChange={(e) => {
                    const value = e.target.value === "" ? undefined : Math.max(0, Math.min(1, Number(e.target.value)));
                    setThickness(value);
                }}
                placeholder="Default"
            />
        </div>,
        <div key="roundness" className="grid gap-2">
            <Label htmlFor="roundnessProp">Roundness (0.0-1.0)</Label>
            <Input
                id="roundnessProp"
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={roundness !== undefined ? roundness : ""}
                onChange={(e) => {
                    const value = e.target.value === "" ? undefined : Math.max(0, Math.min(1, Number(e.target.value)));
                    setRoundness(value);
                }}
            />
        </div>,
        <div key="bipolar" className="flex items-center gap-2 pt-2">
            <Checkbox id="bipolarProp" checked={bipolar} onCheckedChange={(checked) => setBipolar(checked === true)} />
            <Label htmlFor="bipolarProp" className="cursor-pointer">
                Bipolar
            </Label>
        </div>,
        <div key="midiBipolar" className="flex items-center gap-2 pt-2">
            <Checkbox
                id="midiBipolarProp"
                checked={useMidiBipolar}
                disabled={!bipolar}
                onCheckedChange={(checked) => setUseMidiBipolar(checked === true)}
            />
            <Label htmlFor="midiBipolarProp" className="cursor-pointer">
                MIDI Bipolar Format
            </Label>
        </div>,
        <div key="color" className="grid gap-2">
            <ColorPickerField id="colorProp" label="Color" value={color} onChange={setColor} />
        </div>,
        <div key="valueAsLabel" className="grid gap-2">
            <Label htmlFor="valueAsLabelProp">Value as Label</Label>
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
                <SelectTrigger id="valueAsLabelProp">
                    <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="default">Default (Label Only)</SelectItem>
                    <SelectItem value="labelOnly">Label Only</SelectItem>
                    <SelectItem value="valueOnly">Value Only</SelectItem>
                    <SelectItem value="interactive">Interactive</SelectItem>
                </SelectContent>
            </Select>
        </div>,
    ];

    const examples = [
        <div key="0" className={orientation === "vertical" ? "h-64" : "w-64"}>
            <Slider
                style={{ cursor: "pointer" }}
                min={0}
                max={100}
                step={1}
                value={75}
                label="Volume"
                size="large"
                orientation={orientation}
                valueAsLabel="interactive"
                unit="%"
                onClick={() => handleExampleClick(0)}
            />
        </div>,
        <div key="1" className={orientation === "vertical" ? "h-64" : "w-64"}>
            <Slider
                style={{ cursor: "pointer" }}
                min={-100}
                max={100}
                step={1}
                value={0}
                label="Pan"
                size="large"
                orientation={orientation}
                bipolar={true}
                valueAsLabel="interactive"
                valueFormatter={panFormatter}
                onClick={() => handleExampleClick(1)}
            />
        </div>,
        <div key="2" className={orientation === "vertical" ? "h-64" : "w-64"}>
            <Slider
                style={{ cursor: "pointer" }}
                min={0}
                max={127}
                step={1}
                value={64}
                label="Cutoff"
                size="large"
                orientation={orientation}
                valueAsLabel="interactive"
                onClick={() => handleExampleClick(2)}
            />
        </div>,
        <div key="3" className={orientation === "vertical" ? "h-64" : "w-64"}>
            <Slider
                style={{ cursor: "pointer" }}
                min={-12}
                max={12}
                step={0.1}
                value={0}
                label="Gain"
                size="large"
                orientation={orientation}
                bipolar={true}
                valueAsLabel="interactive"
                unit="dB"
                onClick={() => handleExampleClick(3)}
            />
        </div>,
        <div key="4" className={orientation === "vertical" ? "h-64" : "w-64"}>
            <Slider
                style={{ cursor: "pointer" }}
                min={0}
                max={2000}
                step={10}
                value={500}
                label="Delay"
                size="large"
                orientation={orientation}
                valueAsLabel="interactive"
                unit="ms"
                onClick={() => handleExampleClick(4)}
            />
        </div>,
        <div key="5" className={orientation === "vertical" ? "h-64" : "w-64"}>
            <Slider
                style={{ cursor: "pointer" }}
                min={-50}
                max={50}
                step={1}
                value={0}
                label="Tuning"
                size="large"
                orientation={orientation}
                bipolar={true}
                valueAsLabel="interactive"
                unit="cents"
                onClick={() => handleExampleClick(5)}
            />
        </div>,
    ];

    return (
        <ControlSkeletonPage<number>
            componentName="Slider"
            codeSnippet={codeString}
            PageComponent={SliderComponent}
            componentProps={componentProps}
            properties={properties}
            examples={examples}
            onChange={(event) => setValue(event.value)}
        />
    );
}
