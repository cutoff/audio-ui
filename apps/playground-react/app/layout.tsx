/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/providers";
import { AppFooter } from "@/components/app-footer";
import { AppSidebar } from "@/components/app-sidebar";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { MidiSettingsButton } from "@/components/midi-settings-button";
import { ThemeSettingsButton } from "@/components/theme-settings-button";
import { ThemeModeToggle } from "@/components/theme-mode-toggle";
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
    metadataBase: new URL("https://playground.cutoff.dev"),
    title: {
        default: "AudioUI Playground - Interactive Component Showcase",
        template: "%s | AudioUI Playground",
    },
    description:
        "Interactive playground for AudioUI by Cutoff. Explore and test React components designed for audio and MIDI applications, including knobs, sliders, buttons, piano keyboards, and more.",
    keywords: [
        "AudioUI",
        "Audio UI",
        "React components",
        "audio applications",
        "MIDI",
        "music software",
        "DAW",
        "audio plugins",
        "interactive controls",
        "knob",
        "slider",
        "piano keyboard",
        "Cutoff",
        "TypeScript",
        "React component library",
    ],
    authors: [{ name: "Renaud Denis", url: "https://renauddenis.com" }],
    creator: "Tylium",
    publisher: "Tylium",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://playground.cutoff.dev",
        siteName: "AudioUI Playground",
        title: "AudioUI Playground - Interactive Component Showcase",
        description:
            "Explore and test React components designed for audio and MIDI applications. Interactive playground for knobs, sliders, buttons, piano keyboards, and more.",
    },
    twitter: {
        card: "summary_large_image",
        title: "AudioUI Playground - Interactive Component Showcase",
        description:
            "Explore and test React components designed for audio and MIDI applications. Interactive playground for knobs, sliders, buttons, piano keyboards, and more.",
        creator: "@CutoffDev",
    },
    robots: {
        index: false,
        follow: false,
        googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
        },
    },
    alternates: {
        canonical: "https://playground.cutoff.dev",
    },
    verification: {
        // Add verification codes here when available
        // google: "your-google-verification-code",
        // yandex: "your-yandex-verification-code",
    },
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon.ico",
        apple: "/favicon.ico",
    },
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
                            <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between gap-2 rounded-t-xl border-b bg-background/80 backdrop-blur-sm px-4">
                                <div className="flex items-center gap-2">
                                    <SidebarTrigger className="-ml-1" />
                                    <BreadcrumbNav />
                                </div>
                                <div className="flex items-center gap-1">
                                    <MidiSettingsButton />
                                    <ThemeSettingsButton />
                                    <ThemeModeToggle />
                                </div>
                            </header>
                            <div className="flex-1">{children}</div>
                            <AppFooter />
                        </SidebarInset>
                    </SidebarProvider>
                    <Toaster />
                </Providers>
            </body>
        </html>
    );
}
