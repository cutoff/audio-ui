/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { Palette, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Sheet, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeSettingsPanel } from "@/components/theme-settings-panel";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

/**
 * Custom sheet variants for theme settings panel.
 * Configured without overlay to allow real-time preview of theme changes.
 */
const sheetVariants = cva(
    "fixed z-50 gap-4 bg-background/50 backdrop-blur-sm p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
    {
        variants: {
            side: {
                top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
                bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
                left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
                right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-xs",
            },
        },
        defaultVariants: {
            side: "right",
        },
    }
);

interface ThemeSheetContentProps extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> {
    side?: "top" | "right" | "bottom" | "left";
}

/**
 * Custom SheetContent component without overlay for theme settings.
 * Removes the dark overlay to allow users to preview theme changes in real-time
 * while the settings panel is open.
 *
 * @param props - SheetContent props with optional side positioning
 * @returns SheetContent without overlay
 */
const ThemeSheetContent = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Content>, ThemeSheetContentProps>(
    ({ side = "right", className, children, ...props }, ref) => (
        <SheetPrimitive.Portal>
            {/* No overlay - allows preview of theme changes */}
            <SheetPrimitive.Content
                ref={ref}
                className={cn(sheetVariants({ side }), className)}
                onCloseAutoFocus={(e) => {
                    // Prevent scroll-to-top when closing the sheet
                    e.preventDefault();
                }}
                {...props}
            >
                <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </SheetPrimitive.Close>
                {children}
            </SheetPrimitive.Content>
        </SheetPrimitive.Portal>
    )
);
ThemeSheetContent.displayName = "ThemeSheetContent";

/**
 * Theme settings button component for the header.
 * Opens a responsive sheet with theme customization options.
 * - Desktop/Tablet: Right-side sheet (no overlay for preview)
 * - Mobile: Bottom sheet (no overlay for preview)
 *
 * @returns Theme settings button component
 */
export function ThemeSettingsButton() {
    const isMobile = useIsMobile();

    return (
        <TooltipProvider>
            <Sheet>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                                <Palette className="h-4 w-4" />
                                <span className="sr-only">Theme Settings</span>
                            </Button>
                        </SheetTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Theme Settings</p>
                    </TooltipContent>
                </Tooltip>
                <ThemeSheetContent
                    side={isMobile ? "bottom" : "right"}
                    className={isMobile ? "w-full max-h-[80vh] overflow-y-auto" : "w-full"}
                >
                    <SheetHeader>
                        <SheetTitle>Theme Settings</SheetTitle>
                        <SheetDescription>
                            Customize the default theme settings for vector components. Raster components, primitives,
                            and other specialized components are not controlled by these settings.
                        </SheetDescription>
                    </SheetHeader>
                    <ThemeSettingsPanel />
                </ThemeSheetContent>
            </Sheet>
        </TooltipProvider>
    );
}
