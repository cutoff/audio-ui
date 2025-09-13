"use client";

import { useState } from "react";
import { Button } from "@cutoff/audio-ui-react";
import ControlSkeletonPage from "@/components/ControlSkeletonPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ColorPicker } from "@/components/ui/color-picker";

export default function Page() {
    const [value, setValue] = useState(0);
    const [min, setMin] = useState(0);
    const [max, setMax] = useState(100);
    const [center, setCenter] = useState(50);
    const [label, setLabel] = useState("Momentary");
    const [roundness, setRoundness] = useState<number | undefined>(undefined);
    const [latch, setLatch] = useState(false);
    const [color, setColor] = useState<string | undefined>(undefined); // Allow undefined to use theme values

    // Generate code snippet with all props
    const codeString = `<Button 
  min={${min}} 
  max={${max}} 
  value={${value}} 
  center={${center}} 
  label="${label}"${roundness !== undefined ? `\n  roundness={${roundness}}` : ""}
  latch={${latch}}${color !== undefined ? `\n  color="${color}"` : ""}
/>`;

    const handleExampleClick = (num: 0 | 1 | 2): void => {
        switch (num) {
            case 0:
                setValue(0);
                setMin(0);
                setMax(100);
                setCenter(50);
                setLabel("Momentary");
                setRoundness(undefined);
                setColor(undefined);
                setLatch(false);
                break;
            case 1:
                setValue(0);
                setMin(0);
                setMax(100);
                setCenter(50);
                setLabel("Latch");
                setRoundness(10);
                setColor("#ff3366"); // Pink
                setLatch(true);
                break;
        }
    };

    const componentProps = {
        min,
        max,
        center,
        value,
        label,
        roundness,
        latch,
        color,
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
        <div key="center" className="grid gap-2">
            <Label htmlFor="centerProp">Center</Label>
            <Input id="centerProp" type="number" value={center} onChange={(e) => setCenter(Number(e.target.value))} />
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
        <div key="latch" className="grid gap-2">
            <Label htmlFor="latchProp">Latch</Label>
            <div className="flex items-center">
                <input
                    id="latchProp"
                    type="checkbox"
                    checked={latch}
                    onChange={(e) => setLatch(e.target.checked)}
                    className="mr-2 h-4 w-4"
                />
                <span>{latch ? "Latch (toggle)" : "Momentary"}</span>
            </div>
        </div>,
        <div key="color" className="grid gap-2">
            <ColorPicker id="colorProp" label="Color" value={color} onChange={setColor} />
        </div>,
    ];

    const examples = [
        <Button
            key="0"
            min={0}
            max={100}
            value={0}
            label="Momentary"
            latch={false}
            // Use undefined color and roundness to inherit from theme
            onChange={() => handleExampleClick(0)}
        />,
        <Button
            key="1"
            min={0}
            max={100}
            value={0}
            label="Latch"
            latch={true}
            roundness={10}
            color="#ff3366" // Pink
            onChange={() => handleExampleClick(1)}
        />,
    ];

    return (
        <ControlSkeletonPage
            componentName="Button"
            codeSnippet={codeString}
            PageComponent={Button}
            componentProps={componentProps}
            properties={properties}
            examples={examples}
            onChange={(newValue) => setValue(newValue)}
        />
    );
}
