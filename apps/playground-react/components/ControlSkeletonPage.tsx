/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import ComponentSkeletonPage, { ComponentSkeletonPageProps } from "@/components/ComponentSkeletonPage";

export type ControlSkeletonPageProps<TValue = number> = ComponentSkeletonPageProps<TValue> & {
    /** Example instances to display */
    examples: React.ReactNode[];
    /** Layout orientation - horizontal for wide components, vertical for tall/square components */
    orientation?: "horizontal" | "vertical";
};

export default function ControlSkeletonPage<TValue = number>(props: ControlSkeletonPageProps<TValue>) {
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

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Left Column - Using ComponentSkeletonPage */}
            <ComponentSkeletonPage<TValue>
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
                            // Horizontal orientation layout - Examples only
                            <div>
                                <h2 className="text-xl md:text-2xl font-medium mb-4 md:mb-6">Examples</h2>
                                <div className="flex flex-col gap-6 md:gap-8 items-center md:items-start">
                                    {examples.map((example, i) => (
                                        <div key={i} className="flex flex-col items-center">
                                            {example}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            // Vertical orientation layout - Examples only
                            <div>
                                <h2 className="text-xl md:text-2xl font-medium mb-4 md:mb-6">Examples</h2>
                                <div className="flex flex-wrap gap-4 md:gap-8 justify-center md:justify-start">
                                    {examples.map((example, i) => (
                                        <div key={i} className="flex flex-col items-center">
                                            {example}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
