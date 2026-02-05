/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import DemoLayout from "@/components/layout-demo/DemoLayout";
import { AdaptiveBox } from "@cutoff/audio-ui-react";

export default function AdaptiveBoxDemoPage() {
    return (
        <DemoLayout>
            {({
                svgViewBoxWidth,
                svgViewBoxHeight,
                shape,
                labelPosition,
                labelMode,
                displayMode,
                asVAlign,
                asHAlign,
                labelAlign,
                labelHeightUnits,
            }) => (
                <AdaptiveBox
                    className="border-2 border-primary-20"
                    displayMode={displayMode}
                    labelMode={labelMode}
                    labelHeightUnits={labelHeightUnits}
                    viewBoxWidth={svgViewBoxWidth}
                    viewBoxHeight={svgViewBoxHeight}
                    debug={true}
                >
                    <>
                        <AdaptiveBox.Svg vAlign={asVAlign} hAlign={asHAlign}>
                            {shape === "square" && (
                                <circle
                                    cx={svgViewBoxWidth / 2}
                                    cy={svgViewBoxHeight / 2}
                                    r={Math.min(svgViewBoxWidth, svgViewBoxHeight) / 2}
                                    className="fill-primary-50"
                                />
                            )}
                            {shape === "vertical" && (
                                <rect
                                    x={svgViewBoxWidth * 0.25}
                                    y={0}
                                    width={svgViewBoxWidth * 0.5}
                                    height={svgViewBoxHeight}
                                    className="fill-primary-50"
                                />
                            )}
                            {shape === "horizontal" && (
                                <rect
                                    x={0}
                                    y={svgViewBoxHeight * 0.25}
                                    width={svgViewBoxWidth}
                                    height={svgViewBoxHeight * 0.5}
                                    className="fill-primary-50"
                                />
                            )}
                            {/* Centered SVG text */}
                            <text
                                x={svgViewBoxWidth / 2}
                                y={svgViewBoxHeight / 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="fill-primary"
                                style={{
                                    fontSize: `${Math.min(svgViewBoxWidth, svgViewBoxHeight) * 0.2}px`,
                                }}
                            >
                                SVG
                            </text>
                        </AdaptiveBox.Svg>
                        {labelMode !== "none" && (
                            <AdaptiveBox.Label className="text-primary" position={labelPosition} align={labelAlign}>
                                Label
                            </AdaptiveBox.Label>
                        )}
                    </>
                </AdaptiveBox>
            )}
        </DemoLayout>
    );
}
