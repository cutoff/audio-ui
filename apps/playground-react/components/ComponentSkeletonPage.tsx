"use client";

import React from "react";
import { CodeBlock } from "@/components/code-block";

/** Type for components that can be rendered in the ComponentSkeletonPage */
export type PageComponentProps = Record<string, unknown> & {
    adaptiveSize?: boolean;
    onChange?: (value: number) => void;
};

export type ComponentSkeletonPageProps = {
    /** Name of the component being demonstrated */
    componentName: string;
    /** Code example to display */
    codeSnippet: string;
    /** The component to render */
    PageComponent: React.ComponentType<PageComponentProps>;
    /** Props to pass to the component */
    componentProps: Record<string, unknown>;
    /** Property controls to display */
    properties: React.ReactNode[];
    /**
     * Handler for value changes
     * Note: This is a simplified version of the onChange handler expected by the control components.
     * The actual control components expect an onChange handler with the signature:
     * (paramId: string | undefined, value: number | ((prev: number) => number)) => void
     * This component adapts this simplified handler to match the expected signature.
     */
    onChange?: (value: number) => void;
};

export default function ComponentSkeletonPage({
    componentName,
    codeSnippet,
    PageComponent,
    componentProps,
    properties,
    onChange,
}: ComponentSkeletonPageProps) {
    return (
        <div className="w-full md:w-1/3 p-4 md:p-8 flex flex-col justify-between dark:bg-zinc-900/30 bg-zinc-100/70 overflow-auto">
            <div className="flex flex-col gap-6 md:gap-8">
                <div className="flex flex-col gap-4 md:gap-6">
                    <h1 className="text-xl md:text-2xl font-medium">{componentName}</h1>

                    {/* Main Component Preview */}
                    <div className="flex justify-center items-center h-40 md:h-60">
                        <PageComponent
                            key={`main-preview-${componentProps.orientation || "default"}`}
                            adaptiveSize={true}
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
                <div className="space-y-4 w-full">{properties}</div>
            </div>
        </div>
    );
}
