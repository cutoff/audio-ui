"use client"

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useMemo, useEffect } from "react";
import Link from "next/link";
import {CodeBlock} from "@/components/code-block";

export type DemoSkeletonPageProps = {
    /** Name of the component being demonstrated */
    componentName: string;
    /** Code example to display */
    codeSnippet: string;
    /** The component to render */
    PageComponent: React.ComponentType<any>;
    /** Props to pass to the component */
    componentProps: Record<string, unknown>;
    /** Property controls to display */
    properties: React.ReactNode[];
    /** Example instances to display */
    examples: React.ReactNode[];
    /** Handler for value changes */
    onChange?: (value: number) => void;
};

export default function DemoSkeletonPage({
                                             componentName,
                                             codeSnippet,
                                             PageComponent,
                                             componentProps,
                                             properties,
                                             examples,
                                             onChange
                                         }: DemoSkeletonPageProps) {
    const fillItems = useMemo(() => {
        const items = [];
        for (let i = 0; i < 27; i++) {
            items.push(
                <div
                    key={i}
                    className="w-full h-full border border-dashed border-zinc-600"
                    style={{
                        gridArea: `${(i % 3) + 1} / ${Math.floor(i / 3) + 1} / span 1 / span 1`
                    }}
                />
            )
        }
        return items;
    }, []);

    // Theme color buttons
    const themeColors = [
        { color: "bg-blue-500", name: "Blue", cssVar: "--theme-blue-primary" },
        { color: "bg-orange-500", name: "Orange", cssVar: "--theme-orange-primary" },
        { color: "bg-pink-500", name: "Pink", cssVar: "--theme-pink-primary" },
        { color: "bg-zinc-500", name: "Slate", cssVar: "--theme-slate-primary" },
        { color: "bg-green-500", name: "Green", cssVar: "--theme-green-primary" },
        { color: "bg-purple-500", name: "Purple", cssVar: "--theme-purple-primary" },
        { color: "bg-teal-500", name: "Teal", cssVar: "--theme-teal-primary" },
        { color: "bg-red-500", name: "Red", cssVar: "--theme-red-primary" }
    ];

    // Function to change theme
    const changeTheme = (themeCssVar: string) => {
        document.documentElement.style.setProperty('--primary-color', `var(${themeCssVar})`);
        document.documentElement.style.setProperty('--primary-color-50', `var(${themeCssVar}-50)`);
        document.documentElement.style.setProperty('--primary-color-20', `var(${themeCssVar}-20)`);
    };

    // Set initial theme when component mounts
    useEffect(() => {
        // Blue is the default theme in styles.css, but we set it explicitly to ensure consistency
        changeTheme('--theme-blue-primary');
    }, []);

    return (
        <div className="h-screen flex">
            {/* Left Column */}
            <div className="w-1/3 p-8 flex flex-col justify-between bg-zinc-900/30 overflow-auto">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-6">
                        <h1 className="text-2xl font-medium">{componentName}</h1>

                        {/* Main Component Preview */}
                        <div className="flex justify-center items-center h-60">
                            <PageComponent
                                stretch={true}
                                onChange={onChange}
                                {...componentProps}
                            />
                        </div>
                    </div>

                    {/* Code Snippet */}
                    <div className="flex flex-col gap-2">
                        <h2 className="text-base font-semibold pt-4 pb-2">Code Snippet</h2>
                        <CodeBlock code={codeSnippet} language="jsx" />
                    </div>
                </div>

                {/* Properties - Now at bottom */}
                <div className="flex flex-col gap-4 mt-8">
                    <h2 className="text-base font-semibold pt-2">Properties</h2>
                    <div className="space-y-4 w-full">
                        {properties}
                    </div>

                    {/* Theme Color Selection */}
                    <div className="flex justify-end items-center gap-2 mt-4">
                        <span className="text-sm">Theme</span>
                        <div className="flex gap-2">
                            {themeColors.map((theme, index) => (
                                <button
                                    key={index}
                                    className={`w-6 h-6 rounded ${theme.color}`}
                                    aria-label={`Select ${theme.name} theme`}
                                    onClick={() => changeTheme(theme.cssVar)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column */}
            <div className="w-2/3 flex justify-center">
                <div className="w-full max-w-2xl p-8">
                    <div className="flex flex-col gap-10">
                        {/* Examples */}
                        <div>
                            <h2 className="text-2xl font-medium mb-6">Examples</h2>
                            <div className="flex flex-wrap gap-8">
                                {examples.map((example, i) => (
                                    <div key={i} className="flex flex-col items-center w-20">
                                        {example}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Size Section */}
                        <div>
                            <h2 className="text-2xl font-medium mb-4">Size</h2>
                            <div className="flex flex-col">
                                <PageComponent {...componentProps} />
                                <p className="text-base font-medium mt-2">Default</p>
                            </div>
                        </div>

                        {/* Grid Layout */}
                        <div>
                            <h2 className="text-2xl font-medium mb-4">Grid Layout</h2>
                            <div className="w-full h-60 grid grid-rows-3 grid-cols-9 gap-2 relative">
                                {fillItems}

                                {/* Grid title */}
                                <div className="col-span-3 absolute -top-8 left-1/2 transform -translate-x-1/2 text-base font-medium">
                                    align-self
                                </div>

                                {/* Grid labels */}
                                <p className="absolute -top-6 left-0 text-sm">start</p>
                                <p className="absolute -top-6 left-[11%] text-sm">end</p>
                                <p className="absolute -top-6 left-[22%] text-sm">center</p>

                                {/* Positioned components */}
                                <PageComponent
                                    style={{
                                        gridArea: "2 / 1 / span 1 / span 1",
                                        justifySelf: "center",
                                        alignSelf: "start"
                                    }}
                                    stretch={true}
                                    {...componentProps}
                                />
                                <PageComponent
                                    style={{
                                        gridArea: "2 / 2 / span 1 / span 1",
                                        justifySelf: "center",
                                        alignSelf: "end"
                                    }}
                                    stretch={true}
                                    {...componentProps}
                                />
                                <PageComponent
                                    style={{
                                        gridArea: "2 / 3 / span 1 / span 1",
                                        justifySelf: "center",
                                        alignSelf: "center"
                                    }}
                                    stretch={true}
                                    {...componentProps}
                                />

                                {/* 2x2 grid example */}
                                <PageComponent
                                    style={{
                                        gridArea: "1 / 5 / span 2 / span 2",
                                        justifySelf: "center",
                                        alignSelf: "center"
                                    }}
                                    stretch={true}
                                    {...componentProps}
                                />
                                <p className="absolute bottom-0 left-[44%] text-sm">2x2</p>

                                {/* 2x3 grid example */}
                                <PageComponent
                                    style={{
                                        gridArea: "2 / 7 / span 2 / span 3",
                                        justifySelf: "center",
                                        alignSelf: "center"
                                    }}
                                    stretch={true}
                                    {...componentProps}
                                />
                                <p className="absolute top-8 left-[72%] text-sm">2x3</p>

                                {/* stretching label */}
                                <p className="absolute bottom-0 left-0 text-sm">stretch=true</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
