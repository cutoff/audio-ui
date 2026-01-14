/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type LucideIcon } from "lucide-react";

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

/**
 * Examples navigation component.
 * Displays example pages in a simple list format.
 *
 * @param examples - Array of example items with name, url, and icon
 * @returns Examples navigation component
 */
export function NavExamples({
    examples,
}: {
    examples: {
        name: string;
        url: string;
        icon: LucideIcon;
    }[];
}) {
    const pathname = usePathname();

    return (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Examples</SidebarGroupLabel>
            <SidebarMenu>
                {examples.map((item) => {
                    const isActive = pathname === item.url;
                    return (
                        <SidebarMenuItem key={item.name}>
                            <SidebarMenuButton asChild isActive={isActive}>
                                <Link href={item.url}>
                                    <item.icon />
                                    <span>{item.name}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
