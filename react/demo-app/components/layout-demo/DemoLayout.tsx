"use client";

import { useMemo, useState } from "react";
import Controls, {
    DisplayModeValue,
    FlexAlignValue,
    LabelHeightUnitsValue,
    LabelModeValue,
    LabelPositionValue,
    ShapeValue,
} from "@/components/layout-demo/controls";

export interface DemoLayoutRenderProps {
    // Container sizing
    width: number;
    height: number;

    // SVG viewBox sizes derived from shape
    svgViewBoxWidth: number;
    svgViewBoxHeight: number;

    // Selections
    shape: ShapeValue;
    labelPosition: LabelPositionValue;
    labelMode: LabelModeValue;
    displayMode: DisplayModeValue;
    asVAlign: FlexAlignValue;
    asHAlign: FlexAlignValue;
    labelAlign: FlexAlignValue;
    labelHeightUnits: LabelHeightUnitsValue;
}

export default function DemoLayout({ children }: { children: (props: DemoLayoutRenderProps) => React.ReactNode }) {
    // Shared state across demo pages
    const [width, setWidth] = useState(200);
    const [height, setHeight] = useState(300);
    const [shape, setShape] = useState<ShapeValue>("square");
    const [labelPosition, setLabelPosition] = useState<LabelPositionValue>("below");
    const [labelMode, setLabelMode] = useState<LabelModeValue>("visible");
    const [displayMode, setDisplayMode] = useState<DisplayModeValue>("scaleToFit");
    const [asVAlign, setAsVAlign] = useState<FlexAlignValue>("center");
    const [asHAlign, setAsHAlign] = useState<FlexAlignValue>("center");
    const [labelAlign, setLabelAlign] = useState<FlexAlignValue>("center");
    const [labelHeightUnits, setLabelHeightUnits] = useState<LabelHeightUnitsValue>(15);

    // Derive the viewBox size from the selected shape
    const { svgViewBoxWidth, svgViewBoxHeight } = useMemo(() => {
        switch (shape) {
            case "vertical":
                return { svgViewBoxWidth: 100, svgViewBoxHeight: 400 };
            case "horizontal":
                return { svgViewBoxWidth: 400, svgViewBoxHeight: 100 };
            case "square":
            default:
                return { svgViewBoxWidth: 100, svgViewBoxHeight: 100 };
        }
    }, [shape]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background text-foreground">
            {/* External container (fixed-size) */}
            <div
                data-name="External Container"
                className="bg-gray-200 dark:bg-gray-800 mb-12"
                style={{ width: `${width}px`, height: `${height}px`, overflow: "hidden" }}
            >
                {children({
                    width,
                    height,
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
                })}
            </div>

            {/* Shared Controls */}
            <Controls
                width={width}
                onWidthChange={setWidth}
                height={height}
                onHeightChange={setHeight}
                shape={shape}
                onShapeChange={(s) => setShape(s as ShapeValue)}
                labelPosition={labelPosition}
                onLabelPositionChange={(v) => setLabelPosition(v as LabelPositionValue)}
                displayMode={displayMode}
                onDisplayModeChange={(v) => setDisplayMode(v as DisplayModeValue)}
                labelMode={labelMode}
                onLabelModeChange={(v) => setLabelMode(v as LabelModeValue)}
                asVAlign={asVAlign}
                onAsVAlignChange={(v) => setAsVAlign(v as FlexAlignValue)}
                asHAlign={asHAlign}
                onAsHAlignChange={(v) => setAsHAlign(v as FlexAlignValue)}
                labelAlign={labelAlign}
                onLabelAlignChange={(v) => setLabelAlign(v as FlexAlignValue)}
                labelHeightUnits={labelHeightUnits}
                onLabelHeightUnitsChange={setLabelHeightUnits}
            />
        </div>
    );
}
