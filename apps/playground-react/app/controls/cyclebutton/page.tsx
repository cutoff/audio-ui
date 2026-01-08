/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import { useState } from "react";
import { CycleButton, CycleButtonProps, Option, AudioControlEvent } from "@cutoff/audio-ui-react";

import ControlSkeletonPage from "@/components/ControlSkeletonPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ColorPickerField } from "@/components/ColorPickerField";
import { SawWaveIcon, SineWaveIcon, SquareWaveIcon, TriangleWaveIcon } from "@/components/wave-icons";

const sampleOptions = [
    <Option key={0} value={0} label="Sine">
        <SineWaveIcon />
    </Option>,
    <Option key={1} value={1} label="Triangle">
        <TriangleWaveIcon />
    </Option>,
    <Option key={2} value={2} label="Square">
        <SquareWaveIcon />
    </Option>,
    <Option key={3} value={3} label="Saw">
        <SawWaveIcon />
    </Option>,
    <Option key={4} value={4} label="Other">
        Oth
    </Option>,
];

function generateCodeSnippet(
    value: number,
    label: string,
    roundness: number | undefined,
    color: string | undefined
): string {
    let props = `value={${value}} label='${label}'`;

    if (roundness !== undefined) {
        props += ` roundness={${roundness}}`;
    }

    if (color !== undefined) {
        props += ` color='${color}'`;
    }

    return `<CycleButton ${props}>
    <Option value={0} label="Sine"><SineWaveIcon /></Option>
    <Option value={1} label="Triangle"><TriangleWaveIcon /></Option>
    <Option value={2} label="Square"><SquareWaveIcon /></Option>
    <Option value={3} label="Saw"><SawWaveIcon /></Option>
    <Option value={4} label="Other">Oth</Option>
</CycleButton>`;
}

type CycleButtonComponentProps = {
    value: number;
    label?: string;
    roundness?: number;
    adaptiveSize?: boolean;
    style?: React.CSSProperties;
    className?: string;
    size?: "xsmall" | "small" | "normal" | "large" | "xlarge";
    color?: string;
    onChange?: (event: AudioControlEvent<number | string>) => void;
    onClick?: CycleButtonProps["onClick"];
};

function CycleButtonComponent({
    value,
    label,
    roundness,
    adaptiveSize,
    onChange,
    onClick,
    style,
    className,
    size,
    color,
}: CycleButtonComponentProps) {
    return (
        <CycleButton
            value={value}
            adaptiveSize={adaptiveSize}
            label={label}
            style={style}
            className={className}
            onClick={onClick}
            onChange={onChange}
            size={size}
            color={color}
            roundness={roundness}
        >
            {sampleOptions}
        </CycleButton>
    );
}

export default function CycleButtonDemoPage() {
    const [value, setValue] = useState(0);
    const [label, setLabel] = useState("Waveform");
    const [roundness, setRoundness] = useState<number | undefined>(undefined);
    const [color, setColor] = useState<string | undefined>(undefined); // Allow undefined to use theme values

    const handleExampleClick = (): void => {
        setValue(0);
        setLabel("Waveform");
        setRoundness(undefined); // Use theme roundness
        setColor(undefined); // Use theme color
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
        <div key="color" className="grid gap-2">
            <ColorPickerField id="colorProp" label="Color" value={color} onChange={setColor} />
        </div>,
    ];

    const examples = [
        <CycleButton key="0" value={0} label="Waveform" size="large" onClick={handleExampleClick}>
            {sampleOptions}
        </CycleButton>,
    ];

    const codeString = generateCodeSnippet(value, label, roundness, color);
    const componentProps = {
        value,
        label,
        roundness,
        color,
    };

    return (
        <ControlSkeletonPage<number>
            componentName="CycleButton"
            codeSnippet={codeString}
            PageComponent={CycleButtonComponent}
            componentProps={componentProps}
            properties={properties}
            examples={examples}
            onChange={(event) => setValue(event.value)}
        />
    );
}
