"use client"

import { useState } from "react";
import { Slider } from "@cutoff/audio-ui-react";
import ControlSkeletonPage from "@/components/ControlSkeletonPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {Checkbox} from "@/components/ui/checkbox";

export default function Page() {
    const [value, setValue] = useState(42);
    const [min, setMin] = useState(0);
    const [max, setMax] = useState(100);
    const [label, setLabel] = useState("Default");
    const [bipolar, setBipolar] = useState(false);
    const [thickness, setThickness] = useState("medium");

    const codeString = `<Slider min={${min}} max={${max}} value={${value}} label='${label}' thickness='${thickness}' bipolar={${bipolar}} />`;

    const handleExampleClick = (num: 0 | 1 | 2 | 3): void => {
        switch (num) {
            case 0:
                setValue(42);
                setMin(0);
                setMax(100);
                setLabel("Default");
                setBipolar(false);
                setThickness("medium");
                break;
            case 1:
                setValue(64);
                setMin(0);
                setMax(127);
                setLabel("Bipolar");
                setBipolar(true);
                setThickness("medium");
                break;
            case 2:
                setValue(22);
                setMin(0);
                setMax(127);
                setLabel("Large");
                setBipolar(false);
                setThickness("large");
                break;
        }
    };

    const componentProps = {min, bipolar, max, value, label, thickness};

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
        <div key="bipolar" className="grid gap-2">
            <Checkbox
                id="bipolarProp"
                checked={bipolar}
                onCheckedChange={(checked) => setBipolar(checked === true)}
            />
            <Label htmlFor="bipolarProp" className="cursor-pointer">Bipolar</Label>
        </div>,
        <div key="size" className="grid gap-2">
            <Label htmlFor="thicknessProp">Thickness</Label>
            <Select value={thickness} onValueChange={(value) => setThickness(value)}>
                <SelectTrigger id="thicknessProp">
                    <SelectValue placeholder="Select thickness" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                </SelectContent>
            </Select>
        </div>
    ];

    const examples = [
        <Slider
            key="0"
            style={{cursor: "pointer"}}
            min={0}
            max={100}
            value={42}
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
            thickness="large"
            label="Large"
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
