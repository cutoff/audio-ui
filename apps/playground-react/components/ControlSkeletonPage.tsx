"use client";

import { SizeType } from "@cutoff/audio-ui-react";
import ComponentSkeletonPage, { ComponentSkeletonPageProps } from "@/components/ComponentSkeletonPage";

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
        orientation = "vertical",
    } = props;

    // Array of all size types for dynamic generation
    const sizeTypes: SizeType[] = ["xsmall", "small", "normal", "large", "xlarge"];

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
                                                key={`container-${size}-${componentProps.orientation || "default"}`}
                                                className="flex flex-col items-center justify-center"
                                            >
                                                <PageComponent
                                                    key={`${size}-${componentProps.orientation || "default"}`}
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
                                                key={`container-${size}-${componentProps.orientation || "default"}`}
                                                className="flex flex-col items-center justify-center"
                                            >
                                                <PageComponent
                                                    key={`${size}-${componentProps.orientation || "default"}`}
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
                    </div>
                </div>
            </div>
        </div>
    );
}
