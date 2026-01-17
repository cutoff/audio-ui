/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import { Tag } from "lucide-react";

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { APP_VERSION, APP_VERSION_LABEL } from "@/lib/version";

/**
 * Version display component for the sidebar footer.
 * Displays the current application version in place of a user profile.
 *
 * @returns Version display component
 */
export function NavVersion() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton size="lg" className="cursor-default">
                    <div
                        className="flex aspect-square size-8 items-center justify-center rounded-lg text-[var(--audioui-nearwhite)] dark:text-[var(--audioui-nearblack)]"
                        style={{ backgroundColor: "var(--audioui-primary-color)" }}
                    >
                        <Tag className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{APP_VERSION_LABEL}</span>
                        <span className="truncate text-xs">{APP_VERSION}</span>
                    </div>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
