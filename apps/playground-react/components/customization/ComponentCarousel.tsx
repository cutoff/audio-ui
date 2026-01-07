"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { ControlComponent } from "@cutoff/audio-ui-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Link as LinkIcon, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

export default function ComponentCarousel({ components, selectedComponent, onSelect }: ComponentCarouselProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [showLeftGradient, setShowLeftGradient] = useState(false);
    const [showRightGradient, setShowRightGradient] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

    const updateScrollState = useCallback(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const scrollLeft = container.scrollLeft;
        const scrollWidth = container.scrollWidth;
        const clientWidth = container.clientWidth;
        const maxScroll = scrollWidth - clientWidth;
        const canScroll = scrollWidth > clientWidth;

        setShowLeftGradient(canScroll && scrollLeft > 1);
        setShowRightGradient(canScroll && scrollLeft < maxScroll - 1);
        setCanScrollLeft(canScroll && scrollLeft > 1);
        setCanScrollRight(canScroll && scrollLeft < maxScroll - 1);
    }, []);

    const getScrollAmount = useCallback(() => {
        const container = scrollContainerRef.current;
        if (!container) return 300;

        // Find the first card element to measure its width
        const firstCard = container.querySelector('[role="button"]');
        if (firstCard instanceof HTMLElement) {
            // Add 16px for gap-4
            return firstCard.offsetWidth + 16;
        }

        return 300;
    }, []);

    const scrollLeft = useCallback(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const scrollAmount = getScrollAmount();
        container.scrollBy({
            left: -scrollAmount,
            behavior: "smooth",
        });
    }, [getScrollAmount]);

    const scrollRight = useCallback(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const scrollAmount = getScrollAmount();
        container.scrollBy({
            left: scrollAmount,
            behavior: "smooth",
        });
    }, [getScrollAmount]);

    // Scroll selected component into view
    useEffect(() => {
        if (selectedComponent) {
            const index = components.indexOf(selectedComponent);
            if (index >= 0 && cardRefs.current[index]) {
                cardRefs.current[index]?.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                    inline: "center",
                });
            }
        }
    }, [selectedComponent, components]);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            const canScroll = container.scrollWidth > container.clientWidth;
            if (!canScroll) return;

            const scrollLeft = container.scrollLeft;
            const scrollWidth = container.scrollWidth;
            const clientWidth = container.clientWidth;
            const maxScroll = scrollWidth - clientWidth;

            const atLeft = scrollLeft <= 0;
            const atRight = scrollLeft >= maxScroll - 1;

            // Use horizontal scroll delta (deltaX) for horizontal carousel
            // Also support vertical scroll (deltaY) converted to horizontal for convenience
            const deltaX = e.deltaX;
            const deltaY = e.deltaY;

            // Prefer horizontal scroll, fall back to vertical if no horizontal movement
            const scrollDelta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;

            const scrollingLeft = scrollDelta < 0;
            const scrollingRight = scrollDelta > 0;

            // Allow page scroll when at boundaries
            if (scrollingLeft && atLeft) return;
            if (scrollingRight && atRight) return;

            // Only prevent default if we're actually scrolling
            if (Math.abs(scrollDelta) > 0) {
                e.preventDefault();
                e.stopPropagation();

                container.scrollBy({
                    left: scrollDelta,
                    behavior: "smooth",
                });
            }
        };

        container.addEventListener("wheel", handleWheel, { passive: false });
        container.addEventListener("scroll", updateScrollState, { passive: true });

        // Initial check and on resize
        updateScrollState();
        const resizeObserver = new ResizeObserver(updateScrollState);
        resizeObserver.observe(container);

        return () => {
            container.removeEventListener("wheel", handleWheel);
            container.removeEventListener("scroll", updateScrollState);
            resizeObserver.disconnect();
        };
    }, [updateScrollState]);

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
        <div className="w-full relative flex items-center gap-3 sm:gap-4" role="region" aria-label="Component carousel">
            {canScrollLeft && (
                <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 h-9 w-9 rounded-full bg-background/90 backdrop-blur-sm shadow-md hover:bg-background border-border/50 transition-all"
                    onClick={scrollLeft}
                    aria-label="Scroll left"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            )}
            <div
                ref={scrollContainerRef}
                className="flex-1 flex overflow-x-auto gap-4 py-4 px-1 no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing select-none"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none", userSelect: "none" }}
                role="group"
                aria-label="Component cards"
            >
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
                        <Card
                            key={`${title}-${index}`}
                            ref={(el) => {
                                cardRefs.current[index] = el;
                            }}
                            className={cn(
                                "group relative min-w-[200px] sm:min-w-[250px] md:min-w-[300px] max-w-[200px] sm:max-w-[250px] md:max-w-[300px] shrink-0 cursor-pointer transition-all duration-200 select-none flex flex-col",
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
                                    <CardTitle className="text-sm sm:text-base font-semibold mb-1">{title}</CardTitle>
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
                                        {isCopied ? <Check className="h-3 w-3" /> : <LinkIcon className="h-3 w-3" />}
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
                    );
                })}
            </div>
            {canScrollRight && (
                <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 h-9 w-9 rounded-full bg-background/90 backdrop-blur-sm shadow-md hover:bg-background border-border/50 transition-all"
                    onClick={scrollRight}
                    aria-label="Scroll right"
                >
                    <ArrowRight className="h-4 w-4" />
                </Button>
            )}

            {showLeftGradient && (
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background via-background/80 to-transparent pointer-events-none z-10" />
            )}
            {showRightGradient && (
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background via-background/80 to-transparent pointer-events-none z-10" />
            )}
        </div>
    );
}
