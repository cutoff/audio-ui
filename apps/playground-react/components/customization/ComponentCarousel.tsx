/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ControlComponent } from "@cutoff/audio-ui-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link as LinkIcon, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";

/**
 * Preview component that renders a control component in an SVG container.
 * Used to display a visual preview of control components in the carousel.
 *
 * @param props - Component props
 * @param props.component - The control component to preview
 * @returns SVG preview of the component or fallback text
 */
function ComponentPreview({ component: Component }: { component: ControlComponent<Record<string, unknown>> }) {
    try {
        return (
            <svg
                viewBox={`0 0 ${Component.viewBox.width} ${Component.viewBox.height}`}
                className="w-full h-full"
                preserveAspectRatio="xMidYMid meet"
            >
                <Component
                    normalizedValue={0.5}
                    className="text-foreground"
                    {...({ color: "currentColor" } as Record<string, unknown>)}
                />
            </svg>
        );
    } catch {
        return (
            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">Preview</div>
        );
    }
}

/**
 * Converts a text string to a URL-friendly slug.
 * Used for generating anchor links to specific components in the carousel.
 *
 * @param text - Text to convert to slug
 * @returns URL-friendly slug string
 */
const slugify = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .replace(/-+/g, "-");
};

interface ComponentCarouselProps {
    components: ControlComponent<Record<string, unknown>>[];
    selectedComponent: ControlComponent<Record<string, unknown>> | null;
    onSelect: (component: ControlComponent<Record<string, unknown>>) => void;
}

/**
 * Component carousel that displays a scrollable list of control components.
 * Supports drag scrolling, wheel scrolling, and keyboard navigation.
 * Automatically scrolls to the selected component when it changes.
 * Each card displays a preview, title, description, and copy link button.
 *
 * @param props - Component props
 * @param props.components - Array of control components to display
 * @param props.selectedComponent - Currently selected component (null if none)
 * @param props.onSelect - Callback invoked when a component is selected
 * @returns Component carousel with navigation controls
 */
export default function ComponentCarousel({ components, selectedComponent, onSelect }: ComponentCarouselProps) {
    const [api, setApi] = useState<CarouselApi>();
    const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

    // Sync selection from prop to carousel
    useEffect(() => {
        if (!api || !selectedComponent) return;
        const index = components.indexOf(selectedComponent);
        if (index >= 0) {
            api.scrollTo(index);
        }
    }, [api, selectedComponent, components]);

    const handleCopyLink = useCallback((e: React.MouseEvent, title: string) => {
        e.stopPropagation();
        const slug = slugify(title);
        const url = `${window.location.origin}${window.location.pathname}#${slug}`;

        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");

        setCopiedSlug(slug);
        setTimeout(() => setCopiedSlug(null), 2000);
    }, []);

    return (
        <Carousel
            setApi={setApi}
            opts={{
                align: "center",
                dragFree: true,
                containScroll: "trimSnaps",
            }}
            plugins={[WheelGesturesPlugin()]}
            className="w-full relative"
        >
            <CarouselContent className="-ml-4 py-4 px-1 select-none">
                {components.map((Component, index) => {
                    const title = Component.title || `Component ${index + 1}`;
                    const description = Component.description || "No description available";
                    const isSelected = selectedComponent === Component;
                    const slug = slugify(title);
                    const isCopied = copiedSlug === slug;

                    const handleClick = (e: React.MouseEvent) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onSelect(Component);
                    };

                    return (
                        <CarouselItem key={`${title}-${index}`} className="pl-4 basis-auto">
                            <Card
                                className={cn(
                                    "group relative min-w-[200px] sm:min-w-[250px] md:min-w-[300px] max-w-[200px] sm:max-w-[250px] md:max-w-[300px] shrink-0 cursor-pointer transition-all duration-200 select-none flex flex-col h-full",
                                    "hover:bg-accent/50 hover:shadow-md hover:-translate-y-0.5",
                                    isSelected
                                        ? "border-primary/60 ring-2 ring-primary/40 bg-accent/10 shadow-md"
                                        : "hover:border-primary/50"
                                )}
                                style={{ userSelect: "none", WebkitUserSelect: "none" }}
                                onClick={handleClick}
                                role="button"
                                tabIndex={0}
                                aria-label={`Select ${title}`}
                                aria-pressed={isSelected}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        handleClick(e as unknown as React.MouseEvent);
                                    }
                                }}
                            >
                                <CardHeader className="p-3 sm:p-4 md:p-6 pb-2 sm:pb-3 md:pb-4 relative">
                                    <div className="flex justify-between items-start gap-2">
                                        <CardTitle className="text-sm sm:text-base font-semibold mb-1">
                                            {title}
                                        </CardTitle>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={cn(
                                                "h-6 w-6 shrink-0 transition-opacity absolute top-3 right-3",
                                                isCopied
                                                    ? "opacity-100 text-green-500"
                                                    : "text-muted-foreground/40 hover:text-foreground opacity-100"
                                            )}
                                            onClick={(e) => handleCopyLink(e, title)}
                                            title="Copy direct link"
                                        >
                                            {isCopied ? (
                                                <Check className="h-3 w-3" />
                                            ) : (
                                                <LinkIcon className="h-3 w-3" />
                                            )}
                                        </Button>
                                    </div>
                                    <CardDescription className="line-clamp-4 text-[10px] sm:text-xs leading-relaxed min-h-[3em] text-muted-foreground/90 pr-6">
                                        {description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex justify-center items-center py-3 sm:py-4 md:py-6 px-3 sm:px-4 md:px-6 mt-auto pb-4 sm:pb-5 md:pb-6">
                                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded overflow-hidden">
                                        <ComponentPreview component={Component} />
                                    </div>
                                </CardContent>
                            </Card>
                        </CarouselItem>
                    );
                })}
            </CarouselContent>
            <CarouselPrevious className="left-2 bg-background/80 backdrop-blur-sm" />
            <CarouselNext className="right-2 bg-background/80 backdrop-blur-sm" />
        </Carousel>
    );
}
