import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "@cutoff/audio-ui-react/style.css";
import "./globals.css";
import {Providers} from "@/app/providers";
import SideBar from "@/components/SideBar";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Audio UI Demo",
    description: "Demo application for Audio UI components",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <Providers>
            <div className="flex flex-col md:flex-row min-h-screen">
                {/* SideBar will be client-side rendered */}
                <SideBar />
                <div className="flex-1 pt-16 md:pt-0">
                    {children}
                </div>
            </div>
        </Providers>
        </body>
        </html>
    );
}
