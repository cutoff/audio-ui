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
                    className="border-2 border-gray-700"
                    displayMode={displayMode}
                    labelMode={labelMode}
                    labelHeightUnits={labelHeightUnits}
                    debug={true}
                >
                    <>
                        <AdaptiveBox.Svg
                            viewBoxWidth={svgViewBoxWidth}
                            viewBoxHeight={svgViewBoxHeight}
                            vAlign={asVAlign}
                            hAlign={asHAlign}
                        >
                            {shape === "square" && (
                                <circle
                                    cx={svgViewBoxWidth / 2}
                                    cy={svgViewBoxHeight / 2}
                                    r={Math.min(svgViewBoxWidth, svgViewBoxHeight) / 2}
                                    fill="#666666"
                                />
                            )}
                            {shape === "vertical" && (
                                <rect
                                    x={svgViewBoxWidth * 0.25}
                                    y={0}
                                    width={svgViewBoxWidth * 0.5}
                                    height={svgViewBoxHeight}
                                    fill="#666666"
                                />
                            )}
                            {shape === "horizontal" && (
                                <rect
                                    x={0}
                                    y={svgViewBoxHeight * 0.25}
                                    width={svgViewBoxWidth}
                                    height={svgViewBoxHeight * 0.5}
                                    fill="#666666"
                                />
                            )}
                        </AdaptiveBox.Svg>
                        {labelMode !== "none" && (
                            <AdaptiveBox.Label
                                style={{ fontFamily: "var(--font-oxanium)" }}
                                position={labelPosition}
                                align={labelAlign}
                            >
                                Label
                            </AdaptiveBox.Label>
                        )}
                    </>
                </AdaptiveBox>
            )}
        </DemoLayout>
    );
}
