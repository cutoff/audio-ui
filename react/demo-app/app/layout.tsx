import type { Metadata } from "next";
import { Exo_2, Geist_Mono } from "next/font/google";
import "@cutoff/audio-ui-react/style.css";
import "./globals.css";
import { Providers } from "@/app/providers";
import SideBar from "@/components/SideBar";

const sansFont = Exo_2({
    variable: "--font-sans",
    weight: ['400', '500', '600', '700'],
    subsets: ["latin"],
});

const monoFont = Geist_Mono({
    variable: "--font-mono",
    subsets: ["latin"],
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
            <body className={`${sansFont.variable} ${monoFont.variable} font-sans antialiased`}>
                <Providers>
                    <div className="flex flex-col md:flex-row min-h-screen">
                        {/* SideBar will be client-side rendered */}
                        <SideBar />
                        <div className="flex-1 pt-16 md:pt-0">{children}</div>
                    </div>
                </Providers>            </body>
        </html>
    );
}
