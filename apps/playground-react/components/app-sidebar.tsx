/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Command, Sliders, Layers, Box, Layout, Sparkles } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavExamples } from "@/components/nav-examples";
import { NavVersion } from "@/components/nav-version";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
    navMain: [
        {
            title: "Defaults",
            url: "/defaults",
            icon: Sliders,
            items: [
                {
                    title: "Knob",
                    url: "/defaults/knob",
                },
                {
                    title: "Slider (V)",
                    url: "/defaults/vslider",
                },
                {
                    title: "Slider (H)",
                    url: "/defaults/hslider",
                },
                {
                    title: "CycleButton",
                    url: "/defaults/cyclebutton",
                },
                {
                    title: "Button",
                    url: "/defaults/button",
                },
                {
                    title: "Keys",
                    url: "/defaults/keys",
                },
            ],
        },
        {
            title: "Generic",
            url: "/generic/image-knob",
            icon: Layers,
            items: [
                {
                    title: "Image Knob",
                    url: "/generic/image-knob",
                },
                {
                    title: "Image Rotary Switch",
                    url: "/generic/image-rotary-switch",
                },
                {
                    title: "Image Switch",
                    url: "/generic/image-switch",
                },
                {
                    title: "FilmStrip Continuous",
                    url: "/generic/filmstrip-continuous",
                },
                {
                    title: "FilmStrip Discrete",
                    url: "/generic/filmstrip-discrete",
                },
                {
                    title: "FilmStrip Boolean",
                    url: "/generic/filmstrip-boolean",
                },
            ],
        },
        {
            title: "Primitives",
            url: "/primitives/ring",
            icon: Box,
            items: [
                {
                    title: "ValueRing",
                    url: "/primitives/ring",
                },
                {
                    title: "RotaryImage",
                    url: "/primitives/rotary",
                },
                {
                    title: "FilmStripImage",
                    url: "/primitives/filmstrip",
                },
                {
                    title: "TickRing",
                    url: "/primitives/tick-ring",
                },
                {
                    title: "LabelRing",
                    url: "/primitives/label-ring",
                },
            ],
        },
        {
            title: "Layout",
            url: "/layout/sizing",
            icon: Layout,
            items: [
                {
                    title: "Size System",
                    url: "/layout/sizing",
                },
                {
                    title: "Adaptive Box",
                    url: "/layout/adaptive-box",
                },
                {
                    title: "Grid Layout",
                    url: "/layout/grid-layout",
                },
            ],
        },
    ],
    examples: [
        {
            name: "Customization",
            url: "/examples/customization",
            icon: Sparkles,
        },
        {
            name: "Control Surface",
            url: "/examples/control-surface",
            icon: Sparkles,
        },
        {
            name: "Drag Interaction",
            url: "/examples/drag-interaction",
            icon: Sparkles,
        },
        {
            name: "Stress Test",
            url: "/examples/stress-test",
            icon: Sparkles,
        },
    ],
};

/**
 * Main application sidebar component.
 * Displays navigation menu with collapsible sections.
 * Automatically highlights active navigation items based on current pathname.
 *
 * @param props - Sidebar component props
 * @returns Application sidebar component
 */
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();

    // Determine which nav item should be active based on current path
    const navMainWithActive = data.navMain.map((item) => {
        const isActive = item.items?.some((subItem) => pathname === subItem.url) || pathname === item.url;
        return { ...item, isActive };
    });

    return (
        <Sidebar variant="inset" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <Command className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">AudioUI by Cutoff</span>
                                    <span className="truncate text-xs">Playground</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navMainWithActive} />
                <NavExamples examples={data.examples} />
            </SidebarContent>
            <SidebarFooter>
                <NavVersion />
            </SidebarFooter>
        </Sidebar>
    );
}
