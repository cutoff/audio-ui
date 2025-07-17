"use client"

import {useState} from "react";
import {Button} from "@cutoff/audio-ui-react";
import DemoSkeletonPage from "@/components/DemoSkeletonPage";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";

export default function Page() {
    const [value, setValue] = useState(75);
    const [min, setMin] = useState(0);
    const [max, setMax] = useState(100);
    const [center, setCenter] = useState(50);
    const [label, setLabel] = useState("Button");

    const codeString = `<Button min={${min}} max={${max}} value={${value}} center={${center}} label="${label}" />`;

    const handleExampleClick = (num: 0 | 1 | 2): void => {
        switch (num) {
            case 0:
                setValue(75);
                setMin(0);
                setMax(100);
                setCenter(50);
                setLabel("Button");
                break;
            case 1:
                setValue(25);
                setMin(0);
                setMax(100);
                setCenter(50);
                setLabel("Off");
                break;
            case 2:
                setValue(75);
                setMin(0);
                setMax(100);
                setCenter(50);
                setLabel("Center");
                break;
        }
    };

    const componentProps = {
        min,
        max,
        center,
        value,
        label,
    };

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
    ];

    const examples = [
        <Button
            key="0"
            min={0}
            max={100}
            center={50}
            value={75}
            label="Button"
            onClick={() => handleExampleClick(0)}
        />,
        <Button
            key="1"
            min={0}
            max={100}
            center={50}
            value={25}
            label="Off"
            onClick={() => handleExampleClick(1)}
        />,
        <Button
            key="2"
            min={0}
            max={100}
            center={50}
            value={75}
            label="Center"
            onClick={() => handleExampleClick(2)}
        />,
    ];

    return (
        <DemoSkeletonPage
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
