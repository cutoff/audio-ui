/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import { useState } from "react";
import {
    Knob,
    KnobProps,
    AudioParameter,
    KnobVariant,
    AudioControlEvent,
    ValueLabelMode,
} from "@cutoff/audio-ui-react";

import ControlSkeletonPage from "@/components/ControlSkeletonPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColorPickerField } from "@/components/ColorPickerField";
import { SawWaveIcon, SineWaveIcon, SquareWaveIcon, TriangleWaveIcon } from "@/components/wave-icons";

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

// Icon options for iconCap variant
const iconOptions = [
    { value: "sine", label: "Sine", icon: <SineWaveIcon /> },
    { value: "triangle", label: "Triangle", icon: <TriangleWaveIcon /> },
    { value: "square", label: "Square", icon: <SquareWaveIcon /> },
    { value: "saw", label: "Saw", icon: <SawWaveIcon /> },
] as const;

type IconOptionValue = (typeof iconOptions)[number]["value"];

function generateCodeSnippet(
    value: number,
    label: string,
    min: number,
    max: number,
    step: number | undefined,
    bipolar: boolean,
    useMidiBipolar: boolean,
    roundness: number | undefined,
    thickness: number | undefined,
    color: string | undefined,
    variant: KnobVariant,
    rotaryOverlay: boolean | undefined,
    selectedIcon: IconOptionValue | undefined,
    valueAsLabel: ValueLabelMode | undefined,
    unit: string | undefined
): string {
    // Start with variant prop if not default (first prop)
    let props = "";
    if (variant !== "abstract") {
        props = `variant="${variant}"`;
    }

    // Add required props
    let requiredProps = `min={${min}} max={${max}} value={${value}} label='${label}' bipolar={${bipolar}}`;
    if (thickness !== undefined) {
        requiredProps += ` thickness={${thickness}}`;
    }
    props = props ? `${props} ${requiredProps}` : requiredProps;

    if (step !== undefined) {
        props += ` step={${step}}`;
    }

    if (unit !== undefined) {
        props += ` unit='${unit}'`;
    }

    // Add optional props only if they're defined
    if (roundness !== undefined) {
        props += ` roundness={${roundness}}`;
    }

    if (color !== undefined) {
        props += ` color='${color}'`;
    }

    // Add valueFormatter prop if using MIDI bipolar formatter
    if (bipolar && useMidiBipolar) {
        props += `\n  valueFormatter={midiBipolarFormatter}`;
    }

    // Add rotaryOverlay prop if defined
    if (rotaryOverlay !== undefined) {
        props += `\n  rotaryOverlay={${rotaryOverlay}}`;
    }

    // Add valueAsLabel prop only if explicitly defined
    if (valueAsLabel !== undefined) {
        props += `\n  valueAsLabel='${valueAsLabel}'`;
    }

    // Add children if icon is selected and variant is iconCap
    if (variant === "iconCap" && selectedIcon !== undefined) {
        const iconComponent = iconOptions.find((opt) => opt.value === selectedIcon);
        if (iconComponent) {
            const iconNameMap: Record<IconOptionValue, string> = {
                sine: "SineWaveIcon",
                triangle: "TriangleWaveIcon",
                square: "SquareWaveIcon",
                saw: "SawWaveIcon",
            };
            const iconName = iconNameMap[selectedIcon];
            return `<Knob ${props}>
  <${iconName} />
</Knob>`;
        }
    }

    return `<Knob ${props} />`;
}

type KnobComponentProps = {
    value: number;
    min: number;
    max: number;
    step?: number;
    label?: string;
    bipolar?: boolean;
    useMidiBipolar?: boolean;
    roundness?: number;
    thickness?: number;
    adaptiveSize?: boolean;
    style?: React.CSSProperties;
    className?: string;
    size?: "xsmall" | "small" | "normal" | "large" | "xlarge";
    color?: string;
    variant?: KnobVariant;
    rotaryOverlay?: boolean;
    selectedIcon?: IconOptionValue;
    valueAsLabel?: ValueLabelMode | undefined;
    unit?: string;
    onChange?: (event: AudioControlEvent<number | string>) => void;
    onClick?: KnobProps["onClick"];
};

function KnobComponent({
    value,
    min,
    max,
    step,
    label,
    bipolar,
    useMidiBipolar,
    roundness,
    thickness,
    adaptiveSize,
    onChange,
    onClick,
    style,
    className,
    size,
    color,
    variant,
    rotaryOverlay,
    selectedIcon,
    valueAsLabel,
    unit,
}: KnobComponentProps) {
    // Get the selected icon component
    const iconComponent = selectedIcon ? iconOptions.find((opt) => opt.value === selectedIcon)?.icon : undefined;

    // Directly pass all props to Knob component, including conditional valueFormatter
    return (
        <Knob
            min={min}
            max={max}
            step={step}
            value={value}
            label={label}
            bipolar={bipolar}
            roundness={roundness}
            thickness={thickness}
            adaptiveSize={adaptiveSize}
            style={style}
            className={className}
            onClick={onClick}
            onChange={onChange}
            size={size}
            color={color}
            variant={variant}
            rotaryOverlay={rotaryOverlay}
            valueAsLabel={valueAsLabel}
            unit={unit}
            valueFormatter={bipolar && useMidiBipolar ? midiBipolarFormatter : undefined}
        >
            {iconComponent}
        </Knob>
    );
}

export default function KnobDemoPage() {
    const [value, setValue] = useState(42);
    const [min, setMin] = useState(0);
    const [max, setMax] = useState(100);
    const [step, setStep] = useState<number | undefined>(1);
    const [label, setLabel] = useState("Default");
    const [bipolar, setBipolar] = useState(false);
    const [useMidiBipolar, setUseMidiBipolar] = useState(false);
    const [roundness, setRoundness] = useState<number | undefined>(undefined);
    const [thickness, setThickness] = useState<number | undefined>(undefined);
    const [color, setColor] = useState<string | undefined>(undefined); // Allow undefined to use theme values
    const [variant, setVariant] = useState<KnobVariant>("abstract");
    const [rotaryOverlay, setRotaryOverlay] = useState<boolean | undefined>(undefined);
    const [selectedIcon, setSelectedIcon] = useState<IconOptionValue | undefined>("sine");
    const [valueAsLabel, setValueAsLabel] = useState<ValueLabelMode | undefined>(undefined);
    const [unit, setUnit] = useState<string | undefined>(undefined);

    const handleExampleClick = (num: 0 | 1 | 2 | 4 | 5 | 6): void => {
        switch (num) {
            case 0:
                setValue(42);
                setMin(0);
                setMax(100);
                setStep(1);
                setLabel("Default");
                setBipolar(false);
                setUseMidiBipolar(false);
                setThickness(undefined);
                setRoundness(undefined); // Use theme roundness
                setColor(undefined); // Use theme color
                setVariant("abstract");
                setRotaryOverlay(undefined);
                setSelectedIcon("sine");
                setValueAsLabel(undefined);
                setUnit(undefined);
                break;
            case 1:
                setValue(64);
                setMin(0);
                setMax(127);
                setStep(1);
                setLabel("Bipolar");
                setBipolar(true);
                setUseMidiBipolar(false);
                setThickness(undefined);
                setRoundness(0.3);
                setColor("#ff3366"); // Pink
                setVariant("abstract");
                setRotaryOverlay(undefined);
                setSelectedIcon("sine");
                setValueAsLabel(undefined);
                setUnit(undefined);
                break;
            case 2:
                setValue(0);
                setMin(-1024);
                setMax(1024);
                setStep(1);
                setLabel("Bipolar0");
                setBipolar(true);
                setUseMidiBipolar(false);
                setThickness(undefined);
                setRoundness(0.3);
                setColor("#33cc66"); // Green
                setVariant("abstract");
                setRotaryOverlay(undefined);
                setSelectedIcon("sine");
                setValueAsLabel(undefined);
                setUnit(undefined);
                break;
            case 4:
                setValue(64);
                setMin(0);
                setMax(127);
                setStep(1);
                setLabel("MIDI Bipolar");
                setBipolar(true);
                setUseMidiBipolar(true);
                setThickness(undefined);
                setRoundness(0.3);
                setColor("#ff9933"); // Orange
                setVariant("abstract");
                setRotaryOverlay(undefined);
                setSelectedIcon("sine");
                setValueAsLabel(undefined);
                setUnit(undefined);
                break;
            case 5:
                setValue(0);
                setMin(-100);
                setMax(100);
                setStep(1);
                setLabel("Tuning");
                setBipolar(true);
                setUseMidiBipolar(false);
                setThickness(undefined);
                setRoundness(undefined); // Use theme roundness
                setColor(undefined); // Use theme color
                setVariant("plainCap");
                setRotaryOverlay(undefined);
                setSelectedIcon("sine");
                setValueAsLabel("valueOnly");
                setUnit("cents");
                break;
            case 6:
                setValue(0);
                setMin(-100);
                setMax(100);
                setStep(1);
                setLabel("Tuning");
                setBipolar(true);
                setUseMidiBipolar(false);
                setThickness(undefined);
                setRoundness(undefined); // Use theme roundness
                setColor(undefined); // Use theme color
                setVariant("plainCap");
                setRotaryOverlay(undefined);
                setSelectedIcon("sine");
                setValueAsLabel("interactive");
                setUnit("cents");
                break;
        }
    };

    const properties = [
        <div key="variant" className="grid gap-2">
            <Label htmlFor="variantProp">Variant</Label>
            <Select value={variant} onValueChange={(value) => setVariant(value as KnobVariant)}>
                <SelectTrigger id="variantProp">
                    <SelectValue placeholder="Select variant" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="abstract">abstract</SelectItem>
                    <SelectItem value="simplest">simplest</SelectItem>
                    <SelectItem value="plainCap">plainCap</SelectItem>
                    <SelectItem value="iconCap">iconCap</SelectItem>
                </SelectContent>
            </Select>
        </div>,
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
        <div key="color" className="grid gap-2">
            <ColorPickerField id="colorProp" label="Color" value={color} onChange={setColor} />
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
        <div key="rotaryOverlay" className="flex items-center gap-2 pt-2">
            <Checkbox
                id="rotaryOverlayProp"
                checked={rotaryOverlay === true}
                onCheckedChange={(checked) => setRotaryOverlay(checked === true ? true : undefined)}
            />
            <Label htmlFor="rotaryOverlayProp" className="cursor-pointer">
                Rotary Overlay (iconCap only)
            </Label>
        </div>,
        <div key="icon" className="grid gap-2">
            <Label htmlFor="iconProp">Icon (iconCap only)</Label>
            <Select
                value={selectedIcon ?? "none"}
                onValueChange={(value) => setSelectedIcon(value === "none" ? undefined : (value as IconOptionValue))}
            >
                <SelectTrigger id="iconProp">
                    <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {iconOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
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
        <Knob
            key="0"
            min={0}
            max={100}
            step={1}
            value={42}
            label="Default"
            size="large"
            // Use undefined color and roundness to inherit from theme
            onClick={() => handleExampleClick(0)}
        />,
        <Knob
            key="1"
            min={0}
            bipolar={true}
            max={127}
            step={1}
            value={64}
            label="Bipolar"
            size="large"
            roundness={12}
            color="#ff3366" // Pink
            onClick={() => handleExampleClick(1)}
        />,
        <Knob
            key="2"
            min={-1024}
            bipolar={true}
            max={1024}
            step={1}
            value={0}
            label="Bipolar0"
            size="large"
            roundness={12}
            color="#33cc66" // Green
            onClick={() => handleExampleClick(2)}
        />,
        <Knob
            key="4"
            min={0}
            max={127}
            step={1}
            value={64}
            label="MIDI Bipolar"
            size="large"
            bipolar={true}
            roundness={12}
            color="#ff9933" // Orange
            valueFormatter={midiBipolarFormatter}
            onClick={() => handleExampleClick(4)}
        />,
        <Knob
            key="5"
            min={-100}
            max={100}
            step={1}
            value={0}
            size="large"
            label="Tuning"
            variant="plainCap"
            bipolar={true}
            valueAsLabel="valueOnly"
            unit="cents"
            onClick={() => handleExampleClick(5)}
        />,
        <Knob
            key="6"
            min={-100}
            max={100}
            step={1}
            value={0}
            size="large"
            label="Tuning"
            variant="plainCap"
            bipolar={true}
            valueAsLabel="interactive"
            unit="cents"
            onClick={() => handleExampleClick(6)}
        />,
    ];

    const codeString = generateCodeSnippet(
        value,
        label,
        min,
        max,
        step,
        bipolar,
        useMidiBipolar,
        roundness,
        thickness,
        color,
        variant,
        rotaryOverlay,
        selectedIcon,
        valueAsLabel,
        unit
    );
    const componentProps = {
        min,
        bipolar,
        useMidiBipolar,
        max,
        step,
        value,
        label,
        roundness,
        thickness,
        color,
        variant,
        rotaryOverlay,
        selectedIcon,
        valueAsLabel,
        unit,
    };

    return (
        <ControlSkeletonPage<number>
            componentName="Knob"
            codeSnippet={codeString}
            PageComponent={KnobComponent}
            componentProps={componentProps}
            properties={properties}
            examples={examples}
            onChange={(event) => setValue(event.value)}
        />
    );
}
