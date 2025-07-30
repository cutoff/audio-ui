"use client";

import { useState } from "react";
import { Knob, KnobProps, KnobSwitch, KnobSwitchProps, Option } from "@cutoff/audio-ui-react";

import ControlSkeletonPage from "@/components/ControlSkeletonPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ColorPicker } from "@/components/ui/color-picker";

// Define a simple MIDI bipolar formatter function for the demo
// This will be replaced by the library's midiBipolarFormatter when it's available
const midiBipolarFormatter = (value: number, min: number, max: number): string => {
    const centerValue = Math.floor((max - min + 1) / 2) + min;
    const shiftedValue = value - centerValue;
    return shiftedValue > 0 ? `+${shiftedValue}` : shiftedValue.toString();
};

const iconSineWave = "/sine-wave.svg";
const iconTriangleWave = "/triangle-wave.svg";
const iconSawWave = "/saw-wave.svg";
const iconSquareWave = "/square-wave.svg";

const sampleOptions = [
    <Option key={0} value={0}>
        <img src={iconSineWave} alt="Sine" />
    </Option>,
    <Option key={1} value={1}>
        <img src={iconTriangleWave} alt="Triangle" />
    </Option>,
    <Option key={2} value={2}>
        <img src={iconSquareWave} alt="Saw" />
    </Option>,
    <Option key={3} value={3}>
        <img src={iconSawWave} alt="Saw" />
    </Option>,
    <Option key={4} value={4}>
        Oth
    </Option>,
];

function generateCodeSnippet(
    enableOptions: boolean,
    value: number,
    label: string,
    min: number,
    max: number,
    bipolar: boolean,
    useMidiBipolar: boolean,
    roundness: number,
    thickness: number,
    color: string
): string {
    if (enableOptions) {
        return `<Knob value={${value}} label='${label}' color='${color}'>
    <Option value={0}><img src={iconSineWave} /></Option>
    <Option value={1}><img src={iconTriangleWave} /></Option>
    <Option value={2}><img src={iconSquareWave} /></Option>
    <Option value={3}><img src={iconSawWave} /></Option>
    <Option value={4}>Oth</Option>
</Knob>
`;
    } else {
        let props = `min={${min}} max={${max}} value={${value}} label='${label}' bipolar={${bipolar}} roundness={${roundness}} thickness={${thickness}} color='${color}'`;

        // Add renderValue prop if using MIDI bipolar formatter
        if (bipolar && useMidiBipolar) {
            props += `\n  renderValue={midiBipolarFormatter}`;
        }

        return `<Knob ${props} />`;
    }
}

type KnobComponentProps = {
    value: number;
    min: number;
    max: number;
    label?: string;
    bipolar?: boolean;
    enableOptions: boolean;
    useMidiBipolar?: boolean;
    roundness?: number;
    thickness?: number;
    stretch?: boolean;
    style?: React.CSSProperties;
    className?: string;
    size?: "xsmall" | "small" | "normal" | "large" | "xlarge";
    color?: string;
    onChange?: KnobProps["onChange"] | KnobSwitchProps["onChange"];
    onClick?: KnobProps["onClick"] | KnobSwitchProps["onClick"];
};

function KnobComponent({
    value,
    min,
    max,
    label,
    bipolar,
    useMidiBipolar,
    enableOptions,
    roundness,
    thickness,
    stretch,
    onChange,
    onClick,
    style,
    className,
    size,
    color,
}: KnobComponentProps) {
    if (enableOptions) {
        return (
            <KnobSwitch
                value={value}
                stretch={stretch}
                label={label}
                style={style}
                onClick={onClick}
                onChange={onChange}
                size={size}
                color={color}
            >
                {sampleOptions}
            </KnobSwitch>
        );
    } else {
        // Directly pass all props to Knob component, including conditional renderValue
        return (
            <Knob
                min={min}
                max={max}
                value={value}
                label={label}
                bipolar={bipolar}
                roundness={roundness}
                thickness={thickness}
                stretch={stretch}
                style={style}
                className={className}
                onClick={onClick}
                onChange={onChange}
                size={size}
                color={color}
                renderValue={bipolar && useMidiBipolar ? midiBipolarFormatter : undefined}
            />
        );
    }
}

export default function KnobDemoPage() {
    const [value, setValue] = useState(42);
    const [min, setMin] = useState(0);
    const [max, setMax] = useState(100);
    const [label, setLabel] = useState("Default");
    const [bipolar, setBipolar] = useState(false);
    const [useMidiBipolar, setUseMidiBipolar] = useState(false);
    const [enableOptions, setEnableOptions] = useState(false);
    const [roundness, setRoundness] = useState(12);
    const [thickness, setThickness] = useState(12);
    const [color, setColor] = useState("#3399ff"); // Default blue color

    const handleExampleClick = (num: 0 | 1 | 2 | 3 | 4): void => {
        switch (num) {
            case 0:
                setValue(42);
                setMin(0);
                setMax(100);
                setLabel("Default");
                setBipolar(false);
                setUseMidiBipolar(false);
                setEnableOptions(false);
                setThickness(12);
                setColor("#3399ff"); // Blue
                break;
            case 1:
                setValue(64);
                setMin(0);
                setMax(127);
                setLabel("Bipolar");
                setBipolar(true);
                setUseMidiBipolar(false);
                setEnableOptions(false);
                setThickness(12);
                setColor("#ff3366"); // Pink
                break;
            case 2:
                setValue(0);
                setMin(-1024);
                setMax(1024);
                setLabel("Bipolar0");
                setBipolar(true);
                setUseMidiBipolar(false);
                setEnableOptions(false);
                setThickness(12);
                setColor("#33cc66"); // Green
                break;
            case 3:
                setValue(0);
                setMin(0);
                setMax(4);
                setLabel("Enum");
                setBipolar(false);
                setUseMidiBipolar(false);
                setEnableOptions(true);
                setThickness(16);
                setColor("#9966ff"); // Purple
                break;
            case 4:
                setValue(64);
                setMin(0);
                setMax(127);
                setLabel("MIDI Bipolar");
                setBipolar(true);
                setUseMidiBipolar(true);
                setEnableOptions(false);
                setThickness(12);
                setColor("#ff9933"); // Orange
                break;
        }
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
        <div key="thickness" className="grid gap-2">
            <Label htmlFor="thicknessProp">Thickness</Label>
            <Input
                id="thicknessProp"
                type="number"
                min="0"
                value={thickness}
                onChange={(e) => setThickness(Math.max(0, Number(e.target.value)))}
            />
        </div>,
        <div key="roundness" className="grid gap-2">
            <Label htmlFor="roundnessProp">Roundness</Label>
            <Input
                id="roundnessProp"
                type="number"
                min="0"
                value={roundness}
                onChange={(e) => setRoundness(Math.max(0, Number(e.target.value)))}
            />
        </div>,
        <div key="color" className="grid gap-2">
            <ColorPicker id="colorProp" label="Color" value={color} onChange={setColor} />
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
        <div key="options" className="flex items-center gap-2 pt-2">
            <Checkbox
                id="enableOptionsProp"
                checked={enableOptions}
                onCheckedChange={(checked) => setEnableOptions(checked === true)}
            />
            <Label htmlFor="enableOptionsProp" className="cursor-pointer">
                Options
            </Label>
        </div>,
    ];

    const examples = [
        <Knob
            key="0"
            style={{ cursor: "pointer" }}
            min={0}
            max={100}
            value={42}
            label="Default"
            color="#3399ff" // Blue
            onClick={() => handleExampleClick(0)}
        />,
        <Knob
            key="1"
            style={{ cursor: "pointer" }}
            min={0}
            bipolar={true}
            max={127}
            value={64}
            label="Bipolar"
            color="#ff3366" // Pink
            onClick={() => handleExampleClick(1)}
        />,
        <Knob
            key="2"
            style={{ cursor: "pointer" }}
            min={-1024}
            bipolar={true}
            max={1024}
            value={0}
            label="Bipolar0"
            color="#33cc66" // Green
            onClick={() => handleExampleClick(2)}
        />,
        <KnobSwitch
            key="3"
            style={{ cursor: "pointer" }}
            value={0}
            label="Enum"
            color="#9966ff" // Purple
            onClick={() => handleExampleClick(3)}
        >
            {sampleOptions}
        </KnobSwitch>,
        <Knob
            key="4"
            style={{ cursor: "pointer" }}
            min={0}
            max={127}
            value={64}
            label="MIDI Bipolar"
            bipolar={true}
            color="#ff9933" // Orange
            renderValue={midiBipolarFormatter}
            onClick={() => handleExampleClick(4)}
        />,
    ];

    const codeString = generateCodeSnippet(
        enableOptions,
        value,
        label,
        min,
        max,
        bipolar,
        useMidiBipolar,
        roundness,
        thickness,
        color
    );
    const componentProps = {
        min,
        bipolar,
        useMidiBipolar,
        max,
        value,
        label,
        enableOptions,
        roundness,
        thickness,
        color,
    };

    return (
        <ControlSkeletonPage
            componentName="Knob"
            codeSnippet={codeString}
            PageComponent={KnobComponent}
            componentProps={componentProps}
            properties={properties}
            examples={examples}
            onChange={(newValue) => setValue(newValue)}
        />
    );
}
