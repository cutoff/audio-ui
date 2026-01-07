"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { AudioControlEvent, ControlComponent } from "@cutoff/audio-ui-react";
import ComponentCarousel from "@/components/customization/ComponentCarousel";
import CustomContinuousControl from "@/components/customization/CustomContinuousControl";
import { componentRegistry } from "@/components/customization/component-registry";

const slugify = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-") // Replace spaces with -
        .replace(/[^\w-]+/g, "") // Remove all non-word chars
        .replace(/-+/g, "-"); // Replace multiple - with single -
};

export default function CustomizationPage() {
    const [selectedComponentIndex, setSelectedComponentIndex] = useState<number>(0);
    const [value, setValue] = useState(0);

    // Handle initial hash load
    useEffect(() => {
        const hash = window.location.hash.slice(1);
        if (hash) {
            const index = componentRegistry.findIndex(
                (c) => slugify(c.title || "").toLowerCase() === hash.toLowerCase()
            );
            if (index >= 0) {
                setSelectedComponentIndex(index);
            }
        }
    }, []);

    const selectedComponent = useMemo(() => {
        if (componentRegistry.length === 0) return null;
        const index = Math.max(0, Math.min(selectedComponentIndex, componentRegistry.length - 1));
        return componentRegistry[index] || null;
    }, [selectedComponentIndex]);

    const handleComponentSelect = useCallback((component: ControlComponent) => {
        const index = componentRegistry.findIndex((c) => c === component);
        if (index >= 0) {
            setSelectedComponentIndex(index);
            // Update URL hash without scrolling
            const slug = slugify(component.title || "");
            window.history.replaceState(null, "", `#${slug}`);
        }
    }, []);

    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)] p-2 sm:p-4 md:p-6 lg:p-8 gap-3 sm:gap-6 md:gap-8 lg:gap-12">
            <div className="flex flex-col gap-2 sm:gap-3 md:gap-4 text-center items-center px-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Component Laboratory</h1>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-[600px]">
                    Explore and experiment with custom control components. Select a component from the carousel below to
                    test its interaction and visualization.
                </p>
            </div>

            <div className="w-full max-w-5xl mx-auto px-2 md:px-4">
                <ComponentCarousel
                    components={componentRegistry}
                    selectedComponent={selectedComponent}
                    onSelect={handleComponentSelect}
                />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center min-h-[250px] sm:min-h-[300px] md:min-h-[400px] bg-accent/5 rounded-lg sm:rounded-xl border border-border/50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-12 relative overflow-hidden">
                <div className="absolute inset-0 grid grid-cols-[repeat(auto-fill,minmax(20px,1fr))] grid-rows-[repeat(auto-fill,minmax(20px,1fr))] opacity-[0.03] pointer-events-none" />

                {selectedComponent ? (
                    <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 z-10 w-full max-w-full px-2">
                        <div className="relative w-full max-w-[200px] sm:max-w-[250px] md:max-w-[280px] lg:max-w-[300px] aspect-square flex items-center justify-center">
                            <CustomContinuousControl
                                view={selectedComponent}
                                min={0}
                                max={16383}
                                step={1}
                                value={value}
                                onChange={(event: AudioControlEvent<number>) => setValue(event.value)}
                                label={selectedComponent.title || "Custom Control"}
                                className="w-full h-full"
                            />
                        </div>

                        <div className="flex flex-col items-center gap-1 sm:gap-2 font-mono text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                            <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 md:gap-4 text-center sm:text-left">
                                <span>Value: {value}</span>
                                <span>Normalized: {(value / 16383).toFixed(4)}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-muted-foreground text-xs sm:text-sm md:text-base">
                        Select a component to begin
                    </div>
                )}
            </div>
        </div>
    );
}
