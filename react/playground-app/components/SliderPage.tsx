"use client";

import { useState } from "react";
import { Slider } from "@cutoff/audio-ui-react";
import ControlSkeletonPage from "@/components/ControlSkeletonPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ColorPickerField } from "@/components/ui/ColorPickerField";

export type SliderPageProps = {
    orientation: "horizontal" | "vertical";
};

export default function SliderPage({ orientation }: SliderPageProps) {
    const [value, setValue] = useState(42);
    const [min, setMin] = useState(0);
    const [max, setMax] = useState(100);
    const [label, setLabel] = useState("Default");
    const [bipolar, setBipolar] = useState(false);
    const [thickness, setThickness] = useState(20);
    const [roundness, setRoundness] = useState<number | undefined>(undefined);
    const [color, setColor] = useState<string | undefined>(undefined); // Allow undefined to use theme values

    // Generate code snippet with all props
    const codeString = `<Slider
  min={${min}}
  max={${max}}
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
                setLabel("Default");
                setBipolar(false);
                setThickness(20);
                setRoundness(undefined); // Use theme roundness
                setColor(undefined); // Use theme color
                break;
            case 1:
                setValue(64);
                setMin(0);
                setMax(127);
                setLabel("Bipolar");
                setBipolar(true);
                setThickness(20);
                setRoundness(10);
                setColor("#ff3366"); // Pink
                break;
            case 2:
                setValue(22);
                setMin(0);
                setMax(127);
                setLabel("Thick");
                setBipolar(false);
                setThickness(40);
                setRoundness(10);
                setColor("#33cc66"); // Green
                break;
        }
    };

    const componentProps = { min, bipolar, max, value, label, thickness, roundness, orientation, color };

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
                value={roundness !== undefined ? roundness : ""}
                onChange={(e) => {
                    const value = e.target.value === "" ? undefined : Math.max(0, Number(e.target.value));
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
        <Slider
            key="0"
            style={{ cursor: "pointer" }}
            min={0}
            max={100}
            value={42}
            thickness={20}
            label="Default"
            orientation={orientation}
            // Use undefined color and roundness to inherit from theme
            onClick={() => handleExampleClick(0)}
        />,
        <Slider
            key="1"
            style={{ cursor: "pointer" }}
            min={0}
            bipolar={true}
            max={127}
            value={64}
            thickness={20}
            label="Bipolar"
            orientation={orientation}
            roundness={10}
            color="#ff3366" // Pink
            onClick={() => handleExampleClick(1)}
        />,
        <Slider
            key="2"
            style={{ cursor: "pointer" }}
            min={0}
            bipolar={false}
            max={127}
            value={22}
            thickness={40}
            label="Thick"
            orientation={orientation}
            roundness={10}
            color="#33cc66" // Green
            onClick={() => handleExampleClick(2)}
        />,
    ];

    return (
        <ControlSkeletonPage
            componentName="Slider"
            codeSnippet={codeString}
            // @ts-expect-error demo-only: forcing controlled value transition for example
            PageComponent={Slider}
            componentProps={componentProps}
            properties={properties}
            examples={examples}
            onChange={(newValue) => setValue(newValue)}
            orientation={orientation}
        />
    );
}
