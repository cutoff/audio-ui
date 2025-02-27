"use client"

import { useState } from "react";
import { Slider } from "@cutoff/audio-ui-react";
import DemoSkeletonPage from "@/components/DemoSkeletonPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Page() {
    const [value, setValue] = useState(42);
    const [min, setMin] = useState(0);
    const [max, setMax] = useState(100);
    const [label, setLabel] = useState("Default");
    const [center, setCenter] = useState(0);
    const [size, setSize] = useState("normal");

    const codeString = `<Slider min={${min}} max={${max}} value={${value}} label='${label}' size='${size}' center={${center}} />`;

    const handleExampleClick = (num: 0 | 1 | 2): void => {
        switch (num) {
            case 0:
                setValue(42);
                setMin(0);
                setMax(100);
                setLabel("Default");
                setCenter(0);
                setSize("normal");
                break;
            case 1:
                setValue(64);
                setMin(0);
                setMax(127);
                setLabel("Center");
                setCenter(64);
                setSize("normal");
                break;
            case 2:
                setValue(22);
                setMin(0);
                setMax(127);
                setLabel("Large");
                setCenter(0);
                setSize("large");
                break;
        }
    };

    const componentProps = {min, center, max, value, label, size};

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
        <div key="center" className="grid gap-2">
            <Label htmlFor="centerProp">Center</Label>
            <Input
                id="centerProp"
                type="number"
                value={center}
                onChange={(e) => setCenter(Number(e.target.value))}
            />
        </div>,
        <div key="size" className="grid gap-2">
            <Label htmlFor="sizeProp">Size</Label>
            <Select value={size} onValueChange={(value) => setSize(value)}>
                <SelectTrigger id="sizeProp">
                    <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
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
            center={64}
            max={127}
            value={64}
            label="Center"
            onClick={() => handleExampleClick(1)}
        />,
        <Slider
            key="2"
            style={{cursor: "pointer"}}
            min={0}
            center={0}
            max={127}
            value={22}
            size="large"
            label="Large"
            onClick={() => handleExampleClick(2)}
        />,
    ];

    return (
        <DemoSkeletonPage
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
