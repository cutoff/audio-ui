/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import { useState } from "react";
import { Button } from "@cutoff/audio-ui-react";
import ControlSkeletonPage from "@/components/ControlSkeletonPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ColorPickerField } from "@/components/ColorPickerField";

export default function Page() {
    const [value, setValue] = useState(false);
    const [label, setLabel] = useState("Momentary");
    const [roundness, setRoundness] = useState<number | undefined>(undefined);
    const [latch, setLatch] = useState(false);
    const [color, setColor] = useState<string | undefined>(undefined); // Allow undefined to use theme values

    // Generate code snippet with all props
    const codeString = `<Button
  value={${value}}
  label="${label}"${roundness !== undefined ? `\n  roundness={${roundness}}` : ""}
  latch={${latch}}${color !== undefined ? `\n  color="${color}"` : ""}
/>`;

    const handleExampleClick = (num: 0 | 1): void => {
        switch (num) {
            case 0:
                setValue(false);
                setLabel("Momentary");
                setRoundness(undefined);
                setColor(undefined);
                setLatch(false);
                break;
            case 1:
                setValue(false);
                setLabel("Latch");
                setRoundness(undefined); // Use theme roundness
                setColor(undefined); // Use theme color
                setLatch(true);
                break;
        }
    };

    const componentProps = {
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
            <ColorPickerField id="colorProp" label="Color" value={color} onChange={setColor} />
        </div>,
    ];

    const examples = [
        <Button
            key="0"
            value={false}
            label="Momentary"
            size="large"
            latch={false}
            // Use undefined color and roundness to inherit from theme
            onClick={() => handleExampleClick(0)}
        />,
        <Button key="1" value={false} label="Latch" size="large" latch={true} onClick={() => handleExampleClick(1)} />,
    ];

    return (
        <ControlSkeletonPage<boolean>
            componentName="Button"
            codeSnippet={codeString}
            PageComponent={Button}
            componentProps={componentProps}
            properties={properties}
            examples={examples}
            onChange={(event) => setValue(event.value)}
        />
    );
}
