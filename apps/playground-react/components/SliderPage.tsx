"use client";

import { useState } from "react";
import { Slider } from "@cutoff/audio-ui-react";
import ControlSkeletonPage from "@/components/ControlSkeletonPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ColorPickerField } from "@/components/ColorPickerField";

export type SliderPageProps = {
    orientation: "horizontal" | "vertical";
};

export default function SliderPage({ orientation }: SliderPageProps) {
    const [value, setValue] = useState(42);
    const [min, setMin] = useState(0);
    const [max, setMax] = useState(100);
    const [step, setStep] = useState<number | undefined>(1);
    const [label, setLabel] = useState("Default");
    const [bipolar, setBipolar] = useState(false);
    const [thickness, setThickness] = useState(0.4);
    const [roundness, setRoundness] = useState<number | undefined>(undefined);
    const [color, setColor] = useState<string | undefined>(undefined); // Allow undefined to use theme values

    // Generate code snippet with all props
    const codeString = `<Slider
  min={${min}}
  max={${max}}${step !== undefined ? `\n  step={${step}}` : ""}
  value={${value}}
  label='${label}'
  thickness={${thickness}}
  bipolar={${bipolar}}${roundness !== undefined ? `\n  roundness={${roundness}}` : ""}
  orientation='${orientation}'${color !== undefined ? `\n  color='${color}'` : ""}
/>`;

    const handleExampleClick = (num: 0 | 1 | 2 | 3 | 4): void => {
        switch (num) {
            case 0:
                setValue(42);
                setMin(0);
                setMax(100);
                setStep(1);
                setLabel("Default");
                setBipolar(false);
                setThickness(0.4);
                setRoundness(undefined); // Use theme roundness
                setColor(undefined); // Use theme color
                break;
            case 1:
                setValue(64);
                setMin(0);
                setMax(127);
                setStep(1);
                setLabel("Bipolar");
                setBipolar(true);
                setThickness(0.4);
                setRoundness(0.3);
                setColor("#ff3366"); // Pink
                break;
            case 2:
                setValue(22);
                setMin(0);
                setMax(127);
                setStep(1);
                setLabel("Thick");
                setBipolar(false);
                setThickness(0.6);
                setRoundness(0.3);
                setColor("#33cc66"); // Green
                break;
        }
    };

    const componentProps = { min, bipolar, max, step, value, label, thickness, roundness, orientation, color };

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
        <div key="thickness" className="grid gap-2">
            <Label htmlFor="thicknessProp">Thickness (0.0-1.0)</Label>
            <Input
                id="thicknessProp"
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={thickness}
                onChange={(e) => setThickness(Math.max(0, Math.min(1, Number(e.target.value))))}
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
        <div key="bipolar" className="grid gap-2">
            <Checkbox id="bipolarProp" checked={bipolar} onCheckedChange={(checked) => setBipolar(checked === true)} />
            <Label htmlFor="bipolarProp" className="cursor-pointer">
                Bipolar
            </Label>
        </div>,
        <div key="color" className="grid gap-2">
            <ColorPickerField id="colorProp" label="Color" value={color} onChange={setColor} />
        </div>,
    ];

    const examples = [
        <div key="0" className={orientation === "vertical" ? "h-64" : "w-64"}>
            <Slider
                style={{ cursor: "pointer" }}
                min={0}
                max={100}
                step={1}
                value={42}
                thickness={0.4}
                label="Default"
                size="large"
                orientation={orientation}
                // Use undefined color and roundness to inherit from theme
                onClick={() => handleExampleClick(0)}
            />
        </div>,
        <div key="1" className={orientation === "vertical" ? "h-64" : "w-64"}>
            <Slider
                style={{ cursor: "pointer" }}
                min={0}
                bipolar={true}
                max={127}
                step={1}
                value={64}
                thickness={0.4}
                label="Bipolar"
                size="large"
                orientation={orientation}
                roundness={0.4}
                color="#ff3366" // Pink
                onClick={() => handleExampleClick(1)}
            />
        </div>,
        <div key="2" className={orientation === "vertical" ? "h-64" : "w-64"}>
            <Slider
                style={{ cursor: "pointer" }}
                min={0}
                bipolar={false}
                max={127}
                step={1}
                value={22}
                thickness={0.6}
                label="Thick"
                size="large"
                orientation={orientation}
                roundness={0.4}
                color="#33cc66" // Green
                onClick={() => handleExampleClick(2)}
            />
        </div>,
    ];

    return (
        <ControlSkeletonPage<number>
            componentName="Slider"
            codeSnippet={codeString}
            PageComponent={Slider}
            componentProps={componentProps}
            properties={properties}
            examples={examples}
            onChange={(event) => setValue(event.value)}
            orientation={orientation}
        />
    );
}
