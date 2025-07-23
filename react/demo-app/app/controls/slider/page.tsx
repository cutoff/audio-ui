"use client"

import { useState } from "react";
import { Slider } from "@cutoff/audio-ui-react";
import ControlSkeletonPage from "@/components/ControlSkeletonPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {Checkbox} from "@/components/ui/checkbox";

export default function Page() {
    const [value, setValue] = useState(42);
    const [min, setMin] = useState(0);
    const [max, setMax] = useState(100);
    const [label, setLabel] = useState("Default");
    const [bipolar, setBipolar] = useState(false);
    const [thickness, setThickness] = useState(20);
    const [roundness, setRoundness] = useState(10);
    const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('vertical');

    // Generate code snippet with all props
    const codeString = `<Slider 
  min={${min}} 
  max={${max}} 
  value={${value}} 
  label='${label}' 
  thickness={${thickness}} 
  bipolar={${bipolar}} 
  roundness={${roundness}} 
  orientation='${orientation}'
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
                setOrientation('vertical');
                break;
            case 1:
                setValue(64);
                setMin(0);
                setMax(127);
                setLabel("Bipolar");
                setBipolar(true);
                setThickness(20);
                setOrientation('vertical');
                break;
            case 2:
                setValue(22);
                setMin(0);
                setMax(127);
                setLabel("Thick");
                setBipolar(false);
                setThickness(40);
                setOrientation('vertical');
                break;
            case 3:
                setValue(50);
                setMin(0);
                setMax(100);
                setLabel("Horizontal");
                setBipolar(false);
                setThickness(20);
                setOrientation('horizontal');
                break;
            case 4:
                setValue(25);
                setMin(-50);
                setMax(50);
                setLabel("Horizontal Bipolar");
                setBipolar(true);
                setThickness(20);
                setOrientation('horizontal');
                break;
        }
    };

    const componentProps = {min, bipolar, max, value, label, thickness, roundness, orientation};

    const properties = [
        <div key="label" className="grid gap-2">
            <Label htmlFor="labelProp">Label</Label>
            <Input
                id="labelProp"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
            />
        </div>,
        <div key="min" className="grid gap-2">
            <Label htmlFor="minProp">Min</Label>
            <Input
                id="minProp"
                type="number"
                value={min}
                onChange={(e) => setMin(Number(e.target.value))}
            />
        </div>,
        <div key="max" className="grid gap-2">
            <Label htmlFor="maxProp">Max</Label>
            <Input
                id="maxProp"
                type="number"
                value={max}
                onChange={(e) => setMax(Number(e.target.value))}
            />
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
        <div key="orientation" className="grid gap-2">
            <Label htmlFor="orientationProp">Orientation</Label>
            <select
                id="orientationProp"
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as 'vertical' | 'horizontal')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <option value="vertical">Vertical</option>
                <option value="horizontal">Horizontal</option>
            </select>
        </div>,
        <div key="bipolar" className="grid gap-2">
            <Checkbox
                id="bipolarProp"
                checked={bipolar}
                onCheckedChange={(checked) => setBipolar(checked === true)}
            />
            <Label htmlFor="bipolarProp" className="cursor-pointer">Bipolar</Label>
        </div>,
    ];

    const examples = [
        <Slider
            key="0"
            style={{cursor: "pointer"}}
            min={0}
            max={100}
            value={42}
            thickness={20}
            label="Default"
            orientation="vertical"
            onClick={() => handleExampleClick(0)}
        />,
        <Slider
            key="1"
            style={{cursor: "pointer"}}
            min={0}
            bipolar={true}
            max={127}
            value={64}
            thickness={20}
            label="Bipolar"
            orientation="vertical"
            onClick={() => handleExampleClick(1)}
        />,
        <Slider
            key="2"
            style={{cursor: "pointer"}}
            min={0}
            bipolar={false}
            max={127}
            value={22}
            thickness={40}
            label="Thick"
            orientation="vertical"
            onClick={() => handleExampleClick(2)}
        />,
        <Slider
            key="3"
            style={{cursor: "pointer"}}
            min={0}
            max={100}
            value={50}
            thickness={20}
            label="Horizontal"
            orientation="horizontal"
            onClick={() => handleExampleClick(3)}
        />,
        <Slider
            key="4"
            style={{cursor: "pointer"}}
            min={-50}
            max={50}
            value={25}
            bipolar={true}
            thickness={20}
            label="Horizontal Bipolar"
            orientation="horizontal"
            onClick={() => handleExampleClick(4)}
        />,
    ];

    return (
        <ControlSkeletonPage
            componentName="Slider"
            codeSnippet={codeString}
            PageComponent={Slider}
            componentProps={componentProps}
            properties={properties}
            examples={examples}
            onChange={(newValue) => setValue(newValue)}
        />
    );
}
