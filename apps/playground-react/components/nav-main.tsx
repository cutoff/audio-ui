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
    SidebarSeparator,
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
 * Handles touch event propagation issues on tablets to prevent unwanted navigation.
 *
 * @param item - Navigation item with optional sub-items
 * @param isItemActive - Whether the item or any sub-item is currently active
 * @param shouldBeOpen - Whether the section should be open (auto-opens when navigating to sub-page)
 * @param pathname - Current pathname for active state detection
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
            separatorAfter?: boolean;
        }[];
    };
    isItemActive: boolean;
    shouldBeOpen: boolean;
    pathname: string;
}) {
    // Use controlled state for collapsible
    const [open, setOpen] = React.useState(shouldBeOpen);
    const collapseButtonTouchedRef = React.useRef(false);
    const prevShouldBeOpenRef = React.useRef(shouldBeOpen);

    // Only auto-open when navigating TO a sub-page (shouldBeOpen changes from false to true)
    // This allows users to manually collapse sections even when on a sub-page
    React.useEffect(() => {
        const prevShouldBeOpen = prevShouldBeOpenRef.current;
        if (shouldBeOpen && !prevShouldBeOpen && !open) {
            // User navigated to a sub-page - auto-open the section
            setOpen(true);
        }
        prevShouldBeOpenRef.current = shouldBeOpen;
    }, [shouldBeOpen, open]);

    // Toggle function that will be called when clicking the link
    const handleLinkClick = (e: React.MouseEvent) => {
        // If the collapse button was just touched, ignore this click
        // (touch events on the collapse button can trigger clicks on the link)
        if (collapseButtonTouchedRef.current) {
            e.preventDefault();
            collapseButtonTouchedRef.current = false;
            return;
        }

        // If the item has sub-items, toggle the section when clicking the link
        // Navigation will happen automatically via the Link
        if (item.items?.length) {
            setOpen((prev) => !prev);
        }
    };

    // Prevent event propagation when clicking/touching the collapse button
    // This fixes touch event bubbling on tablets that causes navigation
    const handleCollapseClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const handleCollapseTouchStart = (e: React.TouchEvent) => {
        e.stopPropagation();
        collapseButtonTouchedRef.current = true;
        // Clear the flag after touch events have been processed
        // This prevents touch events from triggering clicks on the Link
        setTimeout(() => {
            collapseButtonTouchedRef.current = false;
        }, 300);
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
                            <SidebarMenuAction
                                className="data-[state=open]:rotate-90 touch-manipulation [&::after]:pointer-events-auto [&::after]:-inset-3 [&::after]:md:block"
                                onClick={handleCollapseClick}
                                onTouchStart={handleCollapseTouchStart}
                            >
                                <ChevronRight />
                                <span className="sr-only">Toggle</span>
                            </SidebarMenuAction>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarMenuSub>
                                {item.items?.map((subItem, index) => {
                                    const isSubActive = pathname === subItem.url;
                                    return (
                                        <React.Fragment key={subItem.title}>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton asChild isActive={isSubActive}>
                                                    <Link href={subItem.url}>
                                                        <span>{subItem.title}</span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                            {subItem.separatorAfter && index < item.items!.length - 1 && (
                                                <SidebarMenuSubItem>
                                                    <SidebarSeparator className="my-1" />
                                                </SidebarMenuSubItem>
                                            )}
                                        </React.Fragment>
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
