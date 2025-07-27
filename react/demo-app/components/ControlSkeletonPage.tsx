"use client"

import {useMemo} from "react";
import {SizeType} from "@cutoff/audio-ui-react";
import ComponentSkeletonPage, {ComponentSkeletonPageProps} from "@/components/ComponentSkeletonPage";

export type ControlSkeletonPageProps = ComponentSkeletonPageProps & {
    /** Example instances to display */
    examples: React.ReactNode[];
    /** Layout orientation - horizontal for wide components, vertical for tall/square components */
    orientation?: "horizontal" | "vertical";
};

export default function ControlSkeletonPage(props: ControlSkeletonPageProps) {
    const {
        componentName,
        codeSnippet,
        PageComponent,
        componentProps,
        properties,
        examples,
        onChange,
        orientation = "vertical"
    } = props;
    
    // Array of all size types for dynamic generation
    const sizeTypes: SizeType[] = ['xsmall', 'small', 'normal', 'large', 'xlarge'];
    
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
            {/* Left Column - Using ComponentSkeletonPage */}
            <ComponentSkeletonPage
                componentName={componentName}
                codeSnippet={codeSnippet}
                PageComponent={PageComponent}
                componentProps={componentProps}
                properties={properties}
                onChange={onChange}
            />

            {/* Right Column */}
            <div className="w-full md:w-2/3 flex justify-center p-4 md:p-0">
                <div className="w-full max-w-2xl p-4 md:p-8">
                    <div className="flex flex-col gap-6 md:gap-10">
                        {orientation === "horizontal" ? (
                            // Horizontal orientation layout - Examples and Size side by side
                            <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                                {/* Examples - Vertical layout for horizontal orientation */}
                                <div className="w-full md:w-1/2">
                                    <h2 className="text-xl md:text-2xl font-medium mb-4 md:mb-6">Examples</h2>
                                    <div className="flex flex-col gap-6 md:gap-8 items-center md:items-start">
                                        {examples.map((example, i) => (
                                            <div key={i} className="flex flex-col items-center">
                                                {example}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Size Section - Vertical layout for horizontal orientation */}
                                <div className="w-full md:w-1/2">
                                    <h2 className="text-xl md:text-2xl font-medium mb-3 md:mb-4">Size</h2>
                                    <div className="flex flex-col gap-6 md:gap-8 items-center md:items-start">
                                        {sizeTypes.map((size) => (
                                            <div 
                                                key={`container-${size}-${componentProps.orientation || 'default'}`} 
                                                className="flex flex-col items-center justify-center"
                                            >
                                                <PageComponent 
                                                    key={`${size}-${componentProps.orientation || 'default'}`} 
                                                    {...componentProps} 
                                                    size={size} 
                                                    label={size}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Vertical orientation layout (original)
                            <>
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
                                        {sizeTypes.map((size) => (
                                            <div 
                                                key={`container-${size}-${componentProps.orientation || 'default'}`} 
                                                className="flex flex-col items-center justify-center"
                                            >
                                                <PageComponent 
                                                    key={`${size}-${componentProps.orientation || 'default'}`} 
                                                    {...componentProps} 
                                                    size={size} 
                                                    label={size}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

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
                                    key={`grid-start-${componentProps.orientation || 'default'}`}
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
                                    key={`grid-end-${componentProps.orientation || 'default'}`}
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
                                    key={`grid-center-${componentProps.orientation || 'default'}`}
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
                                    key={`grid-2x2-${componentProps.orientation || 'default'}`}
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
                                    key={`grid-2x3-${componentProps.orientation || 'default'}`}
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
