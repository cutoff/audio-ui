/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/providers";
import { AppSidebar } from "@/components/app-sidebar";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

const sansFont = Geist({
    variable: "--font-geist-sans",
    weight: ["400", "500", "600"],
    subsets: ["latin"],
});

const monoFont = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const interFont = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    weight: ["700"],
});

export const metadata: Metadata = {
    title: "AudioUI Playground",
    description: "Interactive playground for AudioUI components",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${sansFont.variable} ${monoFont.variable} ${interFont.variable} font-sans antialiased`}>
                <Providers>
                    <SidebarProvider>
                        <AppSidebar />
                        <SidebarInset>
                            <header className="flex h-16 shrink-0 items-center gap-2 px-4">
                                <div className="flex items-center gap-2">
                                    <SidebarTrigger className="-ml-1" />
                                    <BreadcrumbNav />
                                </div>
                            </header>
                            <div className="flex-1">{children}</div>
                        </SidebarInset>
                    </SidebarProvider>
                    <Toaster />
                </Providers>
            </body>
        </html>
    );
}
