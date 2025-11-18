import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/providers";
import SideBar from "@/components/SideBar";

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
                    <div className="flex flex-col md:flex-row min-h-screen">
                        {/* SideBar will be client-side rendered */}
                        <SideBar />
                        <div className="flex-1 pt-16 md:pt-0">{children}</div>
                    </div>
                </Providers>{" "}
            </body>
        </html>
    );
}
