/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import React, { useState } from "react";
import {
    Slider,
    ValueLabelMode,
    AudioParameter,
    AudioControlEvent,
    SliderVariant,
    SliderCursorSize,
} from "@cutoff/audio-ui-react";
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
    defaultValue?: number | undefined;
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
    variant?: SliderVariant;
    cursorSize?: SliderCursorSize;
    cursorAspectRatio?: number;
    cursorRoundness?: number;
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
    defaultValue,
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
    variant,
    cursorSize,
    cursorAspectRatio,
    cursorRoundness,
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
            defaultValue={defaultValue}
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
            variant={variant}
            cursorSize={cursorSize}
            cursorAspectRatio={cursorAspectRatio}
            cursorRoundness={cursorRoundness}
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
    const [defaultValue, setDefaultValue] = useState<number | undefined>(42);
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
    const [variant, setVariant] = useState<SliderVariant | undefined>(undefined);
    const [cursorSize, setCursorSize] = useState<SliderCursorSize | undefined>(undefined);
    const [cursorAspectRatio, setCursorAspectRatio] = useState<number | undefined>(undefined);
    const [cursorRoundness, setCursorRoundness] = useState<number | undefined>(undefined);

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

        if (variant !== undefined) {
            props += ` variant='${variant}'`;
        }

        if (cursorSize !== undefined) {
            props += ` cursorSize='${cursorSize}'`;
        }

        if (cursorAspectRatio !== undefined) {
            props += ` cursorAspectRatio={${cursorAspectRatio}}`;
        }

        if (cursorRoundness !== undefined) {
            props += ` cursorRoundness={${cursorRoundness}}`;
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

    const handleExampleClick = (num: 0 | 1 | 2 | 3 | 4 | 5 | 6): void => {
        switch (num) {
            case 0:
                // Default - matches initial state
                setValue(42);
                setDefaultValue(42);
                setMin(0);
                setMax(100);
                setStep(1);
                setLabel("Default");
                setBipolar(false);
                setUseMidiBipolar(false);
                setThickness(undefined);
                setRoundness(undefined);
                setColor(undefined);
                setValueAsLabel(undefined);
                setUnit(undefined);
                setVariant(undefined);
                setCursorSize(undefined);
                setCursorAspectRatio(undefined);
                setCursorRoundness(undefined);
                break;
            case 1:
                // Volume - unipolar, percentage
                setValue(75);
                setDefaultValue(75);
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
            case 2:
                // Pan - bipolar, L100-C-R100 format
                setValue(0);
                setDefaultValue(0);
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
            case 3:
                // Cutoff - unipolar, MIDI range, no unit
                setValue(64);
                setDefaultValue(64);
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
            case 4:
                // Gain - bipolar, dB, decimal step
                setValue(0);
                setDefaultValue(0);
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
            case 5:
                // Delay Time - unipolar, milliseconds, larger range, step 10
                setValue(500);
                setDefaultValue(500);
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
            case 6:
                // Tuning - bipolar, cents, smaller range
                setValue(0);
                setDefaultValue(0);
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
        defaultValue,
        label,
        thickness,
        roundness,
        orientation,
        color,
        valueAsLabel,
        unit,
        variant,
        cursorSize,
        cursorAspectRatio,
        cursorRoundness,
    };

    const properties = [
        // Visual/Styling props
        <div key="variant" className="grid gap-2">
            <Label htmlFor="variantProp">Variant</Label>
            <Select
                value={variant === undefined ? "default" : variant}
                onValueChange={(value) => {
                    if (value === "default") {
                        setVariant(undefined);
                    } else {
                        setVariant(value as SliderVariant);
                    }
                }}
            >
                <SelectTrigger id="variantProp">
                    <SelectValue placeholder="Select variant" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="default">Default (Abstract)</SelectItem>
                    <SelectItem value="abstract">Abstract</SelectItem>
                    <SelectItem value="trackless">Trackless</SelectItem>
                    <SelectItem value="trackfull">Trackfull</SelectItem>
                    <SelectItem value="stripless">Stripless</SelectItem>
                </SelectContent>
            </Select>
        </div>,
        <div key="cursorSize" className="grid gap-2">
            <Label htmlFor="cursorSizeProp">Cursor Size</Label>
            <Select
                value={cursorSize === undefined ? "default" : cursorSize}
                onValueChange={(value) => {
                    if (value === "default") {
                        setCursorSize(undefined);
                    } else {
                        setCursorSize(value as SliderCursorSize);
                    }
                }}
            >
                <SelectTrigger id="cursorSizeProp">
                    <SelectValue placeholder="Select cursor size" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="default">Default (Auto)</SelectItem>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="Strip">Strip</SelectItem>
                    <SelectItem value="Track">Track</SelectItem>
                    <SelectItem value="Tick">Tick</SelectItem>
                    <SelectItem value="Label">Label</SelectItem>
                </SelectContent>
            </Select>
        </div>,
        <div key="cursorAspectRatio" className="grid gap-2">
            <Label htmlFor="cursorAspectRatioProp">Cursor Aspect Ratio</Label>
            <Input
                id="cursorAspectRatioProp"
                type="number"
                min="0.1"
                max="10"
                step="0.1"
                value={cursorAspectRatio !== undefined ? cursorAspectRatio : ""}
                onChange={(e) => {
                    const value =
                        e.target.value === "" ? undefined : Math.max(0.1, Math.min(10, Number(e.target.value)));
                    setCursorAspectRatio(value);
                }}
                placeholder="Default (1.0)"
            />
        </div>,
        <div key="cursorRoundness" className="grid gap-2">
            <Label htmlFor="cursorRoundnessProp">Cursor Roundness (0.0-1.0)</Label>
            <Input
                id="cursorRoundnessProp"
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={cursorRoundness !== undefined ? cursorRoundness : ""}
                onChange={(e) => {
                    const value = e.target.value === "" ? undefined : Math.max(0, Math.min(1, Number(e.target.value)));
                    setCursorRoundness(value);
                }}
                placeholder="Default (inherits roundness)"
            />
        </div>,
        // Behavior props
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
        // Display/Formatting props
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
        // Visual/Styling props
        <div key="color" className="grid gap-2">
            <ColorPickerField id="colorProp" label="Color" value={color} onChange={setColor} />
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
        // Basic/Required props
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
        <div key="defaultValue" className="grid gap-2">
            <Label htmlFor="defaultValueProp">Default Value</Label>
            <Input
                id="defaultValueProp"
                type="number"
                value={defaultValue !== undefined ? defaultValue : ""}
                onChange={(e) => {
                    const val = e.target.value === "" ? undefined : Number(e.target.value);
                    setDefaultValue(val);
                }}
                placeholder="Auto (0.0 unipolar, 0.5 bipolar)"
            />
        </div>,
    ];

    const examples = [
        <div key="0" className={orientation === "vertical" ? "h-64" : "w-64"}>
            <Slider
                min={0}
                max={100}
                step={1}
                value={42}
                label="Default"
                size="large"
                orientation={orientation}
                onClick={() => handleExampleClick(0)}
            />
        </div>,
        <div key="1" className={orientation === "vertical" ? "h-64" : "w-64"}>
            <Slider
                min={0}
                max={100}
                step={1}
                value={75}
                label="Volume"
                size="large"
                orientation={orientation}
                valueAsLabel="interactive"
                unit="%"
                onClick={() => handleExampleClick(1)}
            />
        </div>,
        <div key="2" className={orientation === "vertical" ? "h-64" : "w-64"}>
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
                onClick={() => handleExampleClick(2)}
            />
        </div>,
        <div key="3" className={orientation === "vertical" ? "h-64" : "w-64"}>
            <Slider
                min={0}
                max={127}
                step={1}
                value={64}
                label="Cutoff"
                size="large"
                orientation={orientation}
                valueAsLabel="interactive"
                onClick={() => handleExampleClick(3)}
            />
        </div>,
        <div key="4" className={orientation === "vertical" ? "h-64" : "w-64"}>
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
                onClick={() => handleExampleClick(4)}
            />
        </div>,
        <div key="5" className={orientation === "vertical" ? "h-64" : "w-64"}>
            <Slider
                min={0}
                max={2000}
                step={10}
                value={500}
                label="Delay"
                size="large"
                orientation={orientation}
                valueAsLabel="interactive"
                unit="ms"
                onClick={() => handleExampleClick(5)}
            />
        </div>,
        <div key="6" className={orientation === "vertical" ? "h-64" : "w-64"}>
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
                onClick={() => handleExampleClick(6)}
            />
        </div>,
        // Cursor size and variant examples
        <div key="7" className={orientation === "vertical" ? "h-64" : "w-64"}>
            <Slider
                min={0}
                max={100}
                step={1}
                value={60}
                label="Track Variant"
                size="large"
                orientation={orientation}
                variant="trackless"
                cursorSize="Track"
                onClick={() => {
                    setValue(60);
                    setDefaultValue(60);
                    setMin(0);
                    setMax(100);
                    setStep(1);
                    setLabel("Track Variant");
                    setBipolar(false);
                    setUseMidiBipolar(false);
                    setThickness(undefined);
                    setRoundness(undefined);
                    setColor(undefined);
                    setValueAsLabel(undefined);
                    setUnit(undefined);
                    setVariant("trackless");
                    setCursorSize("Track");
                    setCursorAspectRatio(undefined);
                    setCursorRoundness(undefined);
                }}
            />
        </div>,
        <div key="8" className={orientation === "vertical" ? "h-64" : "w-64"}>
            <Slider
                min={0}
                max={100}
                step={1}
                value={40}
                label="Strip Cursor"
                size="large"
                orientation={orientation}
                variant="trackfull"
                cursorSize="Strip"
                onClick={() => {
                    setValue(40);
                    setDefaultValue(40);
                    setMin(0);
                    setMax(100);
                    setStep(1);
                    setLabel("Strip Cursor");
                    setBipolar(false);
                    setUseMidiBipolar(false);
                    setThickness(undefined);
                    setRoundness(undefined);
                    setColor(undefined);
                    setValueAsLabel(undefined);
                    setUnit(undefined);
                    setVariant("trackfull");
                    setCursorSize("Strip");
                    setCursorAspectRatio(undefined);
                    setCursorRoundness(undefined);
                }}
            />
        </div>,
        <div key="9" className={orientation === "vertical" ? "h-64" : "w-64"}>
            <Slider
                min={0}
                max={100}
                step={1}
                value={80}
                label="No Cursor"
                size="large"
                orientation={orientation}
                variant="trackless"
                cursorSize="None"
                onClick={() => {
                    setValue(80);
                    setDefaultValue(80);
                    setMin(0);
                    setMax(100);
                    setStep(1);
                    setLabel("No Cursor");
                    setBipolar(false);
                    setUseMidiBipolar(false);
                    setThickness(undefined);
                    setRoundness(undefined);
                    setColor(undefined);
                    setValueAsLabel(undefined);
                    setUnit(undefined);
                    setVariant("trackless");
                    setCursorSize("None");
                    setCursorAspectRatio(undefined);
                    setCursorRoundness(undefined);
                }}
            />
        </div>,
        <div key="10" className={orientation === "vertical" ? "h-64" : "w-64"}>
            <Slider
                min={0}
                max={100}
                step={1}
                value={50}
                label="Wide Cursor"
                size="large"
                orientation={orientation}
                variant="trackfull"
                cursorSize="Track"
                cursorAspectRatio={0.5}
                onClick={() => {
                    setValue(50);
                    setDefaultValue(50);
                    setMin(0);
                    setMax(100);
                    setStep(1);
                    setLabel("Wide Cursor");
                    setBipolar(false);
                    setUseMidiBipolar(false);
                    setThickness(undefined);
                    setRoundness(undefined);
                    setColor(undefined);
                    setValueAsLabel(undefined);
                    setUnit(undefined);
                    setVariant("trackfull");
                    setCursorSize("Track");
                    setCursorAspectRatio(0.5);
                    setCursorRoundness(undefined);
                }}
            />
        </div>,
        <div key="11" className={orientation === "vertical" ? "h-64" : "w-64"}>
            <Slider
                min={0}
                max={100}
                step={1}
                value={30}
                label="Round Cursor"
                size="large"
                orientation={orientation}
                variant="trackless"
                cursorSize="Strip"
                cursorRoundness={1.0}
                onClick={() => {
                    setValue(30);
                    setDefaultValue(30);
                    setMin(0);
                    setMax(100);
                    setStep(1);
                    setLabel("Round Cursor");
                    setBipolar(false);
                    setUseMidiBipolar(false);
                    setThickness(undefined);
                    setRoundness(undefined);
                    setColor(undefined);
                    setValueAsLabel(undefined);
                    setUnit(undefined);
                    setVariant("trackless");
                    setCursorSize("Strip");
                    setCursorAspectRatio(undefined);
                    setCursorRoundness(1.0);
                }}
            />
        </div>,
        <div key="12" className={orientation === "vertical" ? "h-64" : "w-64"}>
            <Slider
                min={0}
                max={100}
                step={1}
                value={70}
                label="Tall Cursor"
                size="large"
                orientation={orientation}
                variant="abstract"
                cursorSize="Track"
                cursorAspectRatio={2.0}
                cursorRoundness={0.3}
                onClick={() => {
                    setValue(70);
                    setDefaultValue(70);
                    setMin(0);
                    setMax(100);
                    setStep(1);
                    setLabel("Tall Cursor");
                    setBipolar(false);
                    setUseMidiBipolar(false);
                    setThickness(undefined);
                    setRoundness(undefined);
                    setColor(undefined);
                    setValueAsLabel(undefined);
                    setUnit(undefined);
                    setVariant("abstract");
                    setCursorSize("Track");
                    setCursorAspectRatio(2.0);
                    setCursorRoundness(0.3);
                }}
            />
        </div>,
        <div key="13" className={orientation === "vertical" ? "h-64" : "w-64"}>
            <Slider
                min={0}
                max={100}
                step={1}
                value={55}
                label="Stripless"
                size="large"
                orientation={orientation}
                variant="stripless"
                cursorSize="Track"
                cursorAspectRatio={1.2}
                onClick={() => {
                    setValue(55);
                    setDefaultValue(55);
                    setMin(0);
                    setMax(100);
                    setStep(1);
                    setLabel("Stripless");
                    setBipolar(false);
                    setUseMidiBipolar(false);
                    setThickness(undefined);
                    setRoundness(undefined);
                    setColor(undefined);
                    setValueAsLabel(undefined);
                    setUnit(undefined);
                    setVariant("stripless");
                    setCursorSize("Track");
                    setCursorAspectRatio(1.2);
                    setCursorRoundness(undefined);
                }}
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
