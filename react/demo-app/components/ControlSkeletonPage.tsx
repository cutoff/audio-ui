"use client"

import {useMemo} from "react";
import {CodeBlock} from "@/components/code-block";

export type ControlSkeletonPageProps = {
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

export default function ControlSkeletonPage({
                                             componentName,
                                             codeSnippet,
                                             PageComponent,
                                             componentProps,
                                             properties,
                                             examples,
                                             onChange
                                         }: ControlSkeletonPageProps) {
    const fillItems = useMemo(() => {
        const items: React.ReactNode[] = [];
        for (let i = 0; i < 36; i++) {
            items.push(
                <div
                    key={i}
                    className="w-full h-full border border-dashed dark:border-zinc-600 border-zinc-400"
                    style={{
                        gridArea: `${(i % 4) + 1} / ${Math.floor(i / 4) + 1} / span 1 / span 1`
                    }}
                />
            )
        }
        return items;
    }, []);


    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Left Column */}
            <div className="w-full md:w-1/3 p-4 md:p-8 flex flex-col justify-between dark:bg-zinc-900/30 bg-zinc-100/70 overflow-auto">
                <div className="flex flex-col gap-6 md:gap-8">
                    <div className="flex flex-col gap-4 md:gap-6">
                        <h1 className="text-xl md:text-2xl font-medium">{componentName}</h1>

                        {/* Main Component Preview */}
                        <div className="flex justify-center items-center h-40 md:h-60">
                            <PageComponent
                                stretch={true}
                                onChange={onChange}
                                {...componentProps}
                            />
                        </div>
                    </div>

                    {/* Code Snippet */}
                    <div className="flex flex-col gap-2">
                        <h2 className="text-base font-semibold pt-2 md:pt-4 pb-2">Code Snippet</h2>
                        <CodeBlock code={codeSnippet} language="jsx" />
                    </div>
                </div>

                {/* Properties - Now at bottom */}
                <div className="flex flex-col gap-4 mt-6 md:mt-8">
                    <h2 className="text-base font-semibold pt-2">Properties</h2>
                    <div className="space-y-4 w-full">
                        {properties}
                    </div>
                </div>
            </div>

            {/* Right Column */}
            <div className="w-full md:w-2/3 flex justify-center p-4 md:p-0">
                <div className="w-full max-w-2xl p-4 md:p-8">
                    <div className="flex flex-col gap-6 md:gap-10">
                        {/* Examples */}
                        <div>
                            <h2 className="text-xl md:text-2xl font-medium mb-4 md:mb-6">Examples</h2>
                            <div className="flex flex-wrap gap-4 md:gap-8 justify-center md:justify-start">
                                {examples.map((example, i) => (
                                    <div key={i} className="flex flex-col items-center w-16 md:w-20">
                                        {example}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Size Section */}
                        <div>
                            <h2 className="text-xl md:text-2xl font-medium mb-3 md:mb-4">Size</h2>
                            <div className="flex flex-wrap gap-4 md:gap-8 justify-center md:justify-start">
                                <div className="flex flex-col items-center w-16 md:w-20">
                                    <PageComponent {...componentProps} />
                                </div>
                            </div>
                        </div>

                        {/* Grid Layout - Hidden on small screens, visible on medium and up */}
                        <div className="hidden md:block">
                            <h2 className="text-xl md:text-2xl font-medium mb-4">Grid Layout</h2>
                            <div className="w-full h-80 grid grid-rows-4 grid-cols-9 gap-2 relative dark:bg-zinc-900/10 bg-zinc-100/50 p-2 rounded-md">
                                {fillItems}

                                {/* Grid title */}
                                <div className="row-start-2 col-start-1 col-span-3 absolute -top-14 left-2 text-base font-medium text-muted-foreground">
                                    align-self
                                </div>

                                {/* Grid labels */}
                                <p className="row-start-2 col-start-1 absolute -top-8 left-2 text-sm text-muted-foreground">start</p>
                                <p className="row-start-2 col-start-2 absolute -top-8 left-2 text-sm text-muted-foreground">end</p>
                                <p className="row-start-2 col-start-3 absolute -top-8 left-2 text-sm text-muted-foreground">center</p>

                                <p className="row-start-3 col-start-5 absolute left-2 text-sm text-muted-foreground">2x2</p>
                                <p className="row-start-2 col-start-8 absolute -top-8 left-2 text-sm text-muted-foreground">3x3</p>
                                <p className="row-start-4 col-start-1 absolute bottom-3 left-2 text-sm text-muted-foreground">stretch=true</p>

                                {/* Positioned components */}
                                <PageComponent
                                    className="emphasized-bg"
                                    style={{
                                        gridArea: "2 / 1 / span 2 / span 1",
                                        justifySelf: "center",
                                        alignSelf: "start"
                                    }}
                                    stretch={true}
                                    {...componentProps}
                                />
                                <PageComponent
                                    className="emphasized-bg"
                                    style={{
                                        gridArea: "2 / 2 / span 2 / span 1",
                                        justifySelf: "center",
                                        alignSelf: "end"
                                    }}
                                    stretch={true}
                                    {...componentProps}
                                />
                                <PageComponent
                                    className="emphasized-bg"
                                    style={{
                                        gridArea: "2 / 3 / span 2 / span 1",
                                        justifySelf: "center",
                                        alignSelf: "center"
                                    }}
                                    stretch={true}
                                    {...componentProps}
                                />

                                {/* 2x2 grid example */}
                                <PageComponent
                                    className="emphasized-bg"
                                    style={{
                                        gridArea: "1 / 5 / span 2 / span 2",
                                        justifySelf: "center",
                                        alignSelf: "center"
                                    }}
                                    stretch={true}
                                    {...componentProps}
                                />

                                {/* 2x3 grid example */}
                                <PageComponent
                                    className="emphasized-bg"
                                    style={{
                                        gridArea: "2 / 7 / span 3 / span 3",
                                        justifySelf: "center",
                                        alignSelf: "center"
                                    }}
                                    stretch={true}
                                    {...componentProps}
                                />
                            </div>
                        </div>

                        {/* Message for small screens */}
                        <div className="md:hidden">
                            <div className="dark:bg-zinc-800/50 bg-zinc-200/50 dark:border-zinc-700 border-zinc-300 rounded-lg p-6 text-center">
                                <h2 className="text-lg font-medium mb-3 text-primary-color">Screen Size Notice</h2>
                                <p className="dark:text-zinc-300 text-zinc-700">
                                    Control surface examples are not suitable for small screens.
                                    Please use a wider screen to view the grid layout examples.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
