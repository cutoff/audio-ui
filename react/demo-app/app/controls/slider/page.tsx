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

    // Generate code snippet with roundness and thickness
    const codeString = `<Slider min={${min}} max={${max}} value={${value}} label='${label}' thickness={${thickness}} bipolar={${bipolar}} roundness={${roundness}} />`;

    const handleExampleClick = (num: 0 | 1 | 2 | 3): void => {
        switch (num) {
            case 0:
                setValue(42);
                setMin(0);
                setMax(100);
                setLabel("Default");
                setBipolar(false);
                setThickness(20);
                break;
            case 1:
                setValue(64);
                setMin(0);
                setMax(127);
                setLabel("Bipolar");
                setBipolar(true);
                setThickness(20);
                break;
            case 2:
                setValue(22);
                setMin(0);
                setMax(127);
                setLabel("Thick");
                setBipolar(false);
                setThickness(40);
                break;
        }
    };

    const componentProps = {min, bipolar, max, value, label, thickness, roundness};

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
            onClick={() => handleExampleClick(2)}
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
