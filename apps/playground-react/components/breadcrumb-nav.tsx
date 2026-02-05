/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home } from "lucide-react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

/**
 * Examples data for breadcrumb generation.
 * Should be kept in sync with the examples data in app-sidebar.tsx.
 */
const examplesData = [
    { title: "Customization", url: "/examples/customization" },
    { title: "Control Surface", url: "/examples/control-surface" },
    { title: "Drag Interaction", url: "/examples/drag-interaction" },
    { title: "Stress Test", url: "/examples/stress-test" },
];

/**
 * Navigation data structure for breadcrumb generation.
 * Should be kept in sync with the navigation structure in app-sidebar.tsx.
 */
const navData = [
    {
        title: "Vector Components",
        url: "/vector-components",
        items: [
            { title: "Knob", url: "/vector-components/knob" },
            { title: "Slider (V)", url: "/vector-components/vslider" },
            { title: "Slider (H)", url: "/vector-components/hslider" },
            { title: "CycleButton", url: "/vector-components/cyclebutton" },
            { title: "Button", url: "/vector-components/button" },
            { title: "Keys", url: "/vector-components/keys" },
        ],
    },
    {
        title: "Raster Components",
        url: "/raster-components",
        items: [
            { title: "Image Knob", url: "/raster-components/image-knob" },
            { title: "Image Rotary Switch", url: "/raster-components/image-rotary-switch" },
            { title: "Image Switch", url: "/raster-components/image-switch" },
            { title: "FilmStrip Continuous", url: "/raster-components/filmstrip-continuous" },
            { title: "FilmStrip Discrete", url: "/raster-components/filmstrip-discrete" },
            { title: "FilmStrip Boolean", url: "/raster-components/filmstrip-boolean" },
        ],
    },
    {
        title: "Primitives",
        url: "/primitives",
        items: [
            { title: "AdaptiveBox", url: "/primitives/adaptive-box" },
            { title: "ValueRing", url: "/primitives/ring" },
            { title: "RotaryImage", url: "/primitives/rotary" },
            { title: "FilmStripImage", url: "/primitives/filmstrip" },
            { title: "TickRing", url: "/primitives/tick-ring" },
            { title: "LabelRing", url: "/primitives/label-ring" },
        ],
    },
    {
        title: "Layout",
        url: "/layout/sizing",
        items: [
            { title: "Size System", url: "/layout/sizing" },
            { title: "Grid Layout", url: "/layout/grid-layout" },
        ],
    },
];

/**
 * Breadcrumb navigation component that displays the current page location.
 * Shows full breadcrumb hierarchy on desktop (Home | Section | Page for sub-pages, or Home | Section for first-level pages),
 * and just the page name on mobile.
 *
 * @returns Breadcrumb navigation component
 */
export function BreadcrumbNav() {
    const pathname = usePathname();

    /**
     * Finds the current section and page based on the pathname.
     * Matches against the navigation structure to determine breadcrumb hierarchy.
     * For first-level pages (section URLs), returns page as null to avoid duplicate display.
     *
     * @returns Object with section and page titles. Page is null for first-level pages or home page.
     */
    const findBreadcrumb = () => {
        // Check if it's the home page
        if (pathname === "/") {
            return { section: null, page: "Home" };
        }

        // Check if it's an examples page
        if (pathname.startsWith("/examples/")) {
            const example = examplesData.find((item) => item.url === pathname);
            if (example) {
                return { section: "Examples", page: example.title };
            }
            // Fallback: format from pathname
            const exampleName = pathname.split("/").pop();
            if (exampleName) {
                const formattedName = exampleName
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ");
                return { section: "Examples", page: formattedName };
            }
            return { section: "Examples", page: "Example" };
        }

        // Find matching section and page
        for (const section of navData) {
            // Check if pathname matches section URL (first-level page)
            if (pathname === section.url) {
                return { section: section.title, page: null };
            }

            // Check sub-items
            const page = section.items?.find((item) => item.url === pathname);
            if (page) {
                return { section: section.title, page: page.title };
            }
        }

        // Fallback: extract from pathname
        const segments = pathname.split("/").filter(Boolean);
        if (segments.length >= 2) {
            return {
                section: segments[0].charAt(0).toUpperCase() + segments[0].slice(1),
                page: segments[1].charAt(0).toUpperCase() + segments[1].slice(1),
            };
        }

        return { section: null, page: "Page" };
    };

    const { section, page } = findBreadcrumb();

    return (
        <>
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
                <BreadcrumbList>
                    {/* Home icon - visible on desktop only */}
                    <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink asChild>
                            <Link href="/">
                                <Home className="h-4 w-4" />
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    {/* Section - hidden on mobile, visible on desktop */}
                    {section && (
                        <>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink asChild>
                                    <Link
                                        href={
                                            section === "Examples"
                                                ? "/examples/customization"
                                                : navData.find((s) => s.title === section)?.url || "#"
                                        }
                                    >
                                        {section}
                                    </Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </>
                    )}
                    {/* Page separator - only show on desktop when there's a section and a page */}
                    {section && page && <BreadcrumbSeparator className="hidden md:block" />}
                    {/* Page - only show when page exists */}
                    {page && (
                        <BreadcrumbItem>
                            <BreadcrumbPage>{page}</BreadcrumbPage>
                        </BreadcrumbItem>
                    )}
                </BreadcrumbList>
            </Breadcrumb>
        </>
    );
}
