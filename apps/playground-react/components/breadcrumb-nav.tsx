/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
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
        title: "Controls",
        url: "/controls/knob",
        items: [
            { title: "Knob", url: "/controls/knob" },
            { title: "Slider (V)", url: "/controls/vslider" },
            { title: "Slider (H)", url: "/controls/hslider" },
            { title: "CycleButton", url: "/controls/cyclebutton" },
            { title: "Button", url: "/controls/button" },
        ],
    },
    {
        title: "Devices",
        url: "/devices/keys",
        items: [{ title: "Keys", url: "/devices/keys" }],
    },
    {
        title: "Generic",
        url: "/generic/image-knob",
        items: [
            { title: "Image Knob", url: "/generic/image-knob" },
            { title: "Image Rotary Switch", url: "/generic/image-rotary-switch" },
            { title: "Image Switch", url: "/generic/image-switch" },
            { title: "FilmStrip Continuous", url: "/generic/filmstrip-continuous" },
            { title: "FilmStrip Discrete", url: "/generic/filmstrip-discrete" },
            { title: "FilmStrip Boolean", url: "/generic/filmstrip-boolean" },
        ],
    },
    {
        title: "Primitives",
        url: "/primitives/ring",
        items: [
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
            { title: "Adaptive Box", url: "/layout/adaptive-box" },
            { title: "Grid Layout", url: "/layout/grid-layout" },
        ],
    },
];

/**
 * Breadcrumb navigation component that displays the current page location.
 * Shows full breadcrumb (Home | Section | Page) on desktop, and just the page name on mobile.
 *
 * @returns Breadcrumb navigation component
 */
export function BreadcrumbNav() {
    const pathname = usePathname();

    /**
     * Finds the current section and page based on the pathname.
     * Matches against the navigation structure to determine breadcrumb hierarchy.
     *
     * @returns Object with section and page titles, or null for section if on home page
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
            // Check if pathname matches section URL
            if (pathname === section.url) {
                return { section: section.title, page: section.title };
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
                    {/* Page separator - only show on desktop when there's a section */}
                    {section && <BreadcrumbSeparator className="hidden md:block" />}
                    {/* Page - always visible */}
                    <BreadcrumbItem>
                        <BreadcrumbPage>{page}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        </>
    );
}
