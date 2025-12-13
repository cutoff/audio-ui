"use client";

import * as React from "react";
import Color from "color";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    ColorPicker,
    ColorPickerAlpha,
    ColorPickerEyeDropper,
    ColorPickerFormat,
    ColorPickerHue,
    ColorPickerOutput,
    ColorPickerSelection,
} from "@/components/ui/shadcn-io/color-picker";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface ColorPickerFieldProps {
    value: string | undefined;
    onChange: (value: string | undefined) => void;
    label?: string;
    id?: string;
}

export function ColorPickerField({ value, onChange, label, id }: ColorPickerFieldProps) {
    const [color, setColor] = React.useState<ReturnType<typeof Color> | undefined>(value ? Color(value) : undefined);

    React.useEffect(() => {
        try {
            setColor(value ? Color(value) : undefined);
        } catch {
            console.error("Invalid color value provided to ColorPickerField:", value);
            setColor(undefined);
        }
    }, [value]);

    const handleColorChange = React.useCallback(
        (newColor: [number, number, number, number]) => {
            const [r, g, b, a] = newColor;
            const colorInstance = Color.rgb(r, g, b).alpha(a);
            setColor(colorInstance);
            onChange(colorInstance.hexa());
        },
        [onChange]
    );

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setColor(undefined);
        onChange(undefined);
    };

    const colorString = React.useMemo(() => {
        return color ? color.hexa() : "transparent";
    }, [color]);

    return (
        <div className="grid gap-2">
            {label && <Label htmlFor={id}>{label}</Label>}
            <div className="flex items-center gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id={id}
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !value && "text-muted-foreground"
                            )}
                        >
                            <div className="flex w-full items-center gap-2">
                                <div
                                    className="h-4 w-4 rounded !bg-center !bg-cover transition-all"
                                    style={{
                                        backgroundColor: colorString,
                                        backgroundImage:
                                            !color || color.alpha() < 0.5
                                                ? 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==")'
                                                : undefined,
                                    }}
                                />
                                <div className="flex-1 truncate">{color ? color.hexa() : "No color selected"}</div>
                            </div>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full">
                        <ColorPicker
                            value={value}
                            defaultValue={"#000000"}
                            // @ts-expect-error - ColorPicker's type definition doesn't match its implementation
                            // It actually passes [r, g, b, alpha] but the type says Parameters<typeof Color.rgb>[0]
                            onChange={handleColorChange}
                        >
                            <div className="flex flex-col gap-4">
                                <ColorPickerSelection className="h-36 w-full" />
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <ColorPickerEyeDropper />
                                        <div
                                            className="h-8 w-full rounded-md border"
                                            style={{
                                                backgroundColor: colorString,
                                                backgroundImage:
                                                    !color || color.alpha() < 0.5
                                                        ? 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==")'
                                                        : undefined,
                                            }}
                                        />
                                    </div>
                                    <ColorPickerHue className="h-8 w-full" />
                                    <ColorPickerAlpha className="h-8 w-full" />
                                </div>
                                <Separator />
                                <div className="flex items-center">
                                    <ColorPickerOutput />
                                    <ColorPickerFormat className="flex-1" />
                                </div>
                            </div>
                        </ColorPicker>
                    </PopoverContent>
                </Popover>
                {value && (
                    <Button variant="ghost" size="icon" onClick={handleClear}>
                        <X className="h-4 w-4" />
                        <span className="sr-only">Clear color</span>
                    </Button>
                )}
            </div>
        </div>
    );
}

