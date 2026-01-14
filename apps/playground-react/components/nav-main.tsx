/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import * as React from "react";
import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar";

/**
 * Navigation menu component with collapsible sections.
 * Displays main navigation items with expandable sub-items.
 * Automatically highlights active items based on current pathname.
 *
 * @param items - Array of navigation items with optional sub-items
 * @returns Navigation menu component
 */
export function NavMain({
    items,
}: {
    items: {
        title: string;
        url: string;
        icon: LucideIcon;
        isActive?: boolean;
        items?: {
            title: string;
            url: string;
        }[];
    }[];
}) {
    const pathname = usePathname();

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const isSubItemActive = item.items?.some((subItem) => pathname === subItem.url) ?? false;
                    const isItemActive = (pathname === item.url || isSubItemActive) ?? false;
                    const shouldBeOpen = item.isActive || isSubItemActive || false;

                    return (
                        <NavItem
                            key={item.title}
                            item={item}
                            isItemActive={isItemActive}
                            shouldBeOpen={shouldBeOpen}
                            pathname={pathname}
                        />
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}

/**
 * Individual navigation item with collapsible sub-items.
 * Uses controlled state to allow toggling via link click or chevron button.
 */
function NavItem({
    item,
    isItemActive,
    shouldBeOpen,
    pathname,
}: {
    item: {
        title: string;
        url: string;
        icon: LucideIcon;
        items?: {
            title: string;
            url: string;
        }[];
    };
    isItemActive: boolean;
    shouldBeOpen: boolean;
    pathname: string;
}) {
    // Use controlled state for collapsible
    const [open, setOpen] = React.useState(shouldBeOpen);

    // Sync state with pathname changes
    React.useEffect(() => {
        if (shouldBeOpen && !open) {
            setOpen(true);
        }
    }, [shouldBeOpen, open]);

    // Toggle function that will be called when clicking the link
    const handleLinkClick = () => {
        if (item.items?.length) {
            setOpen((prev) => !prev);
        }
        // Navigation will happen automatically via the Link
    };

    return (
        <Collapsible open={open} onOpenChange={setOpen}>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={item.title} isActive={isItemActive}>
                    <Link href={item.url} onClick={handleLinkClick}>
                        <item.icon />
                        <span>{item.title}</span>
                    </Link>
                </SidebarMenuButton>
                {item.items?.length ? (
                    <>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuAction className="data-[state=open]:rotate-90">
                                <ChevronRight />
                                <span className="sr-only">Toggle</span>
                            </SidebarMenuAction>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarMenuSub>
                                {item.items?.map((subItem) => {
                                    const isSubActive = pathname === subItem.url;
                                    return (
                                        <SidebarMenuSubItem key={subItem.title}>
                                            <SidebarMenuSubButton asChild isActive={isSubActive}>
                                                <Link href={subItem.url}>
                                                    <span>{subItem.title}</span>
                                                </Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    );
                                })}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </>
                ) : null}
            </SidebarMenuItem>
        </Collapsible>
    );
}
