"use client";

import React, { useState, useEffect } from "react";
import { Label } from "./label";
import { Input } from "./input";

interface ColorPickerProps {
    value: string | undefined;
    onChange: (value: string | undefined) => void;
    label?: string;
    id?: string;
    defaultValue?: string;
}

export function ColorPicker({ value, onChange, label = "Color", id = "colorPicker", defaultValue = "#3399ff" }: ColorPickerProps) {
    // Use state to maintain a consistent controlled input
    const [displayValue, setDisplayValue] = useState(value !== undefined ? value : defaultValue);
    
    // Update displayValue when value prop changes
    useEffect(() => {
        setDisplayValue(value !== undefined ? value : defaultValue);
    }, [value, defaultValue]);
    
    // Handle input changes
    const handleChange = (newValue: string) => {
        setDisplayValue(newValue);
        onChange(newValue);
    };
    
    return (
        <div className="grid gap-2">
            <div className="flex items-center gap-2">
                <Label htmlFor={id}>{label}</Label>
                <div className="w-6 h-6 rounded-full border border-gray-300" style={{ backgroundColor: displayValue }} />
            </div>
            <div className="flex gap-2">
                <Input
                    id={id}
                    type="color"
                    value={displayValue}
                    onChange={(e) => handleChange(e.target.value)}
                    className="w-12 h-8 p-0 cursor-pointer"
                />
                <Input
                    type="text"
                    value={displayValue}
                    onChange={(e) => handleChange(e.target.value)}
                    className="flex-1"
                    placeholder="#000000"
                />
            </div>
        </div>
    );
}
