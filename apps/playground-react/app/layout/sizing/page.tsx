"use client";

import { Button, Knob, KnobSwitch, Slider, Keybed, Option, SizeType } from "@cutoff/audio-ui-react";
import { SawWaveIcon, SineWaveIcon, SquareWaveIcon, TriangleWaveIcon } from "@/components/wave-icons";

const sizeTypes: SizeType[] = ["xsmall", "small", "normal", "large", "xlarge"];

const sampleOptions = [
    <Option key={0} value={0}>
        <SineWaveIcon />
    </Option>,
    <Option key={1} value={1}>
        <TriangleWaveIcon />
    </Option>,
    <Option key={2} value={2}>
        <SquareWaveIcon />
    </Option>,
    <Option key={3} value={3}>
        <SawWaveIcon />
    </Option>,
];

export default function SizingPage() {
    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">Size System</h1>
                    <p className="text-muted-foreground text-lg">
                        All components use a consistent sizing system based on a base unit. Each size variant scales
                        proportionally, ensuring components work harmoniously together in layouts.
                    </p>
                </div>

                {/* Square Components Section */}
                <section className="mb-12">
                    <h2 className="text-2xl font-semibold mb-6">Square Components (1:1)</h2>
                    <p className="text-muted-foreground mb-6">
                        Button, Knob, and KnobSwitch share the same square aspect ratio, making them perfect for
                        side-by-side layouts.
                    </p>

                    {/* Button */}
                    <div className="mb-10">
                        <h3 className="text-xl font-medium mb-4">Button</h3>
                        <div className="flex flex-wrap gap-8 md:gap-12 items-end">
                            {sizeTypes.map((size) => (
                                <div key={size} className="flex flex-col items-center gap-2">
                                    <Button value={false} label={size} size={size} />
                                    <span className="text-xs text-muted-foreground font-mono">{size}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Knob */}
                    <div className="mb-10">
                        <h3 className="text-xl font-medium mb-4">Knob</h3>
                        <div className="flex flex-wrap gap-8 md:gap-12 items-end">
                            {sizeTypes.map((size) => (
                                <div key={size} className="flex flex-col items-center gap-2">
                                    <Knob min={0} max={100} value={42} label={size} size={size} />
                                    <span className="text-xs text-muted-foreground font-mono">{size}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* KnobSwitch */}
                    <div className="mb-10">
                        <h3 className="text-xl font-medium mb-4">KnobSwitch</h3>
                        <div className="flex flex-wrap gap-8 md:gap-12 items-end">
                            {sizeTypes.map((size) => (
                                <div key={size} className="flex flex-col items-center gap-2">
                                    <KnobSwitch value={0} label={size} size={size}>
                                        {sampleOptions}
                                    </KnobSwitch>
                                    <span className="text-xs text-muted-foreground font-mono">{size}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Slider Components Section */}
                <section className="mb-12">
                    <h2 className="text-2xl font-semibold mb-6">Slider Components</h2>
                    <p className="text-muted-foreground mb-6">
                        Sliders maintain consistent track widths across sizes, with height/width ratios of 3:1 (vertical)
                        and 1:3 (horizontal).
                    </p>

                    {/* Vertical Slider */}
                    <div className="mb-10">
                        <h3 className="text-xl font-medium mb-4">Vertical Slider (3:1 width:height)</h3>
                        <div className="flex flex-wrap gap-6 md:gap-8 items-end">
                            {sizeTypes.map((size) => (
                                <div key={size} className="flex flex-col items-center gap-2">
                                    <div className="h-80 flex items-center">
                                        <Slider
                                            orientation="vertical"
                                            min={0}
                                            max={100}
                                            value={42}
                                            label={size}
                                            size={size}
                                        />
                                    </div>
                                    <span className="text-xs text-muted-foreground">{size}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Horizontal Slider */}
                    <div className="mb-10">
                        <h3 className="text-xl font-medium mb-4">Horizontal Slider (1:3 width:height)</h3>
                        <div className="flex flex-wrap gap-6 md:gap-8 items-end">
                            {sizeTypes.map((size) => (
                                <div key={size} className="flex flex-col items-center gap-2">
                                    <div className="w-80 flex items-center justify-center">
                                        <Slider
                                            orientation="horizontal"
                                            min={0}
                                            max={100}
                                            value={42}
                                            label={size}
                                            size={size}
                                        />
                                    </div>
                                    <span className="text-xs text-muted-foreground">{size}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Keybed Section */}
                <section className="mb-12">
                    <h2 className="text-2xl font-semibold mb-6">Keybed (1:5)</h2>
                    <p className="text-muted-foreground mb-6">
                        The keybed maintains a consistent aspect ratio of 1:5 (width:height), ensuring proper keyboard
                        proportions across all sizes.
                    </p>

                    <div className="flex flex-col gap-6">
                        {sizeTypes.map((size) => (
                            <div key={size} className="flex flex-col gap-2">
                                <Keybed nbKeys={61} size={size} />
                                <span className="text-sm text-muted-foreground">{size}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Consistency Note */}
                <section className="mt-12 p-6 bg-muted rounded-lg">
                    <h2 className="text-xl font-semibold mb-3">Design System Consistency</h2>
                    <p className="text-muted-foreground">
                        All components use the same base unit and size multipliers. This means a &quot;small&quot; knob will
                        align perfectly with a &quot;small&quot; slider when placed side-by-side, creating harmonious layouts
                        without manual adjustments.
                    </p>
                    <p className="text-muted-foreground mt-3">
                        Sizes are defined via CSS variables, making it easy to customize the entire system by adjusting
                        the <code className="bg-background px-1 py-0.5 rounded">--audioui-unit</code> variable.
                    </p>
                </section>
            </div>
        </div>
    );
}
