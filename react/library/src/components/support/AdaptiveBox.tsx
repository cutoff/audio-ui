"use client";

import React, {
    createContext,
    CSSProperties,
    PropsWithChildren,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";

// Shared string unions following the demo controls and spec
export type FlexAlign = "start" | "center" | "end";
export type DisplayMode = "scaleToFit" | "fill";
export type LabelMode = "none" | "hidden" | "visible";
export type LabelPosition = "above" | "below";

// Context to coordinate between root and subcomponents
interface BoxContextValue {
    // Minimal config exposed to children to avoid unnecessary re-renders
    hasLabel: boolean;
    labelPosition: LabelPosition;

    // Root-level configuration
    displayMode: DisplayMode;
    labelMode: LabelMode;
    labelHeightUnits: number;
    debug: boolean;

    // Registration APIs
    registerSvg: (info: { width: number; height: number; hAlign?: FlexAlign; vAlign?: FlexAlign }) => void;
    registerLabel: (info: { position?: LabelPosition; align?: FlexAlign }) => void;
}

const BoxContext = createContext<BoxContextValue | null>(null);

function useBoxContext() {
    const ctx = useContext(BoxContext);
    if (!ctx) throw new Error("AdaptiveBox subcomponents must be used within <AdaptiveBox>");
    return ctx;
}

export interface AdaptiveBoxProps extends PropsWithChildren {
    className?: string;
    style?: CSSProperties;
    displayMode?: DisplayMode;
    labelMode?: LabelMode;
    labelHeightUnits?: number; // in the same units as SVG viewBox height; default 15
    minWidth?: number;
    minHeight?: number;
    debug?: boolean; // controls dev visuals (scaler border, svg background). Defaults to true to preserve demo behavior
}

export function AdaptiveBox({
    className,
    style,
    displayMode = "scaleToFit",
    labelMode = "visible",
    labelHeightUnits,
    minWidth,
    minHeight,
    debug = false,
    children,
}: AdaptiveBoxProps) {
    // Internal state populated by subcomponents
    const [svgInfo, setSvgInfo] = useState<{
        width: number;
        height: number;
        hAlign?: FlexAlign;
        vAlign?: FlexAlign;
    } | null>(null);
    const [labelInfo, setLabelInfo] = useState<{ position: LabelPosition; align: FlexAlign } | null>(null);

    // Stable callbacks that only update state when values actually change
    const registerSvg = useCallback(
        (info: { width: number; height: number; hAlign?: FlexAlign; vAlign?: FlexAlign }) => {
            setSvgInfo((prev) => {
                const next = {
                    width: info.width,
                    height: info.height,
                    hAlign: info.hAlign,
                    vAlign: info.vAlign,
                } as const;
                if (
                    !prev ||
                    prev.width !== next.width ||
                    prev.height !== next.height ||
                    prev.hAlign !== next.hAlign ||
                    prev.vAlign !== next.vAlign
                ) {
                    return { ...next };
                }
                return prev;
            });
        },
        []
    );

    const registerLabel = useCallback((info: { position?: LabelPosition; align?: FlexAlign }) => {
        setLabelInfo((prev) => {
            const next = {
                position: info.position ?? "below",
                align: info.align ?? "center",
            } as const;
            if (!prev || prev.position !== next.position || prev.align !== next.align) {
                return { ...next };
            }
            return prev;
        });
    }, []);

    const labelHeightUnitsEffective = labelHeightUnits ?? 15;

    const ctxValue = useMemo<BoxContextValue>(
        () => ({
            hasLabel: !!labelInfo,
            labelPosition: labelInfo?.position ?? "below",
            displayMode,
            labelMode,
            labelHeightUnits: labelHeightUnitsEffective,
            debug,
            registerSvg,
            registerLabel,
        }),
        [labelInfo, displayMode, labelMode, labelHeightUnitsEffective, debug, registerSvg, registerLabel]
    );

    // Derived layout numbers (kept local for readability and to avoid context churn)
    const svgViewBoxWidth = svgInfo?.width ?? 100;
    const svgViewBoxHeight = svgInfo?.height ?? 100;
    const styleH = (style?.justifySelf as FlexAlign) ?? "center";
    const styleV = (style?.alignSelf as FlexAlign) ?? "center";
    const hAlign = svgInfo?.hAlign ?? styleH;
    const vAlign = svgInfo?.vAlign ?? styleV;
    const effectiveLabelPosition: LabelPosition = labelInfo?.position ?? "below";
    const isFill = displayMode === "fill";
    const showLabelSpace = labelMode !== "none" && !!labelInfo; // reserve space only if a label is provided and mode != none
    const L = labelHeightUnitsEffective;
    const combinedHeightUnits = showLabelSpace ? svgViewBoxHeight + L : svgViewBoxHeight;

    // Grid template rows for SVG + (optional) label
    let gridTemplateRows = "1fr";
    if (showLabelSpace) {
        const svgPercent = (svgViewBoxHeight / combinedHeightUnits) * 100;
        const labelPercent = (L / combinedHeightUnits) * 100;
        if (effectiveLabelPosition === "above") {
            gridTemplateRows = `${labelPercent}% ${svgPercent}%`;
        } else {
            gridTemplateRows = `${svgPercent}% ${labelPercent}%`;
        }
    }

    return (
        <BoxContext.Provider value={ctxValue}>
            <div
                data-name="Control+Label Wrapper"
                className={className}
                style={{
                    width: "100%",
                    height: "100%",
                    containerType: "size",
                    display: "grid",
                    justifyItems: "center",
                    alignItems: "center",
                    overflow: "hidden",
                    minWidth,
                    minHeight,
                    ...(style ?? {}),
                }}
            >
                <div
                    data-name="Aspect Scaler"
                    style={{
                        aspectRatio: `${svgViewBoxWidth} / ${combinedHeightUnits}`,
                        width: isFill
                            ? "100%"
                            : `min(100%, calc(100cqh * ${svgViewBoxWidth} / ${combinedHeightUnits}))`,
                        height: isFill ? "100%" : "auto",
                        display: "grid",
                        gridTemplateRows,
                        justifyItems: "center",
                        alignItems: "center",
                        justifySelf: hAlign,
                        alignSelf: vAlign,
                        minWidth: 0,
                        minHeight: 0,
                        containerType: "inline-size",
                        position: "relative",
                        border: debug ? "2px solid hsl(41, 96%, 40%)" : undefined,
                    }}
                >
                    {/* SVG and Label are rendered by subcomponents via context; this wrapper only provides layout */}
                    {children}
                </div>
            </div>
        </BoxContext.Provider>
    );
}

export interface AdaptiveBoxSvgProps extends PropsWithChildren {
    vAlign?: FlexAlign;
    hAlign?: FlexAlign;
    viewBoxWidth: number;
    viewBoxHeight: number;
    className?: string;
    style?: CSSProperties;
    // Event handlers (use native WheelEvent as requested)
    onWheel?: (e: WheelEvent) => void;
    onClick?: React.MouseEventHandler<SVGSVGElement>;
    onMouseDown?: React.MouseEventHandler<SVGSVGElement>;
    onMouseUp?: React.MouseEventHandler<SVGSVGElement>;
    onMouseEnter?: React.MouseEventHandler<SVGSVGElement>;
    onMouseLeave?: React.MouseEventHandler<SVGSVGElement>;
}

function Svg({
    vAlign,
    hAlign,
    viewBoxWidth,
    viewBoxHeight,
    className,
    style,
    children,
    onWheel,
    ...rest
}: AdaptiveBoxSvgProps) {
    const ctx = useBoxContext();

    // Register with context so the root can compute its layout
    useLayoutEffect(() => {
        ctx.registerSvg({ width: viewBoxWidth, height: viewBoxHeight, hAlign, vAlign });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewBoxWidth, viewBoxHeight, hAlign, vAlign]);

    const svgRef = useRef<SVGSVGElement>(null);

    // Wheel handler per requirements: use native event listener with passive: false
    useEffect(() => {
        if (!svgRef.current || !onWheel) return;

        const element = svgRef.current;
        const wheelHandler = (e: WheelEvent) => {
            // Call the user's handler
            onWheel(e);

            // Only prevent/default & stop propagation if not already prevented
            if (!e.defaultPrevented) {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        element.addEventListener("wheel", wheelHandler, { passive: false });
        return () => element.removeEventListener("wheel", wheelHandler);
    }, [onWheel]);

    const preserveAspect = ctx.displayMode === "fill" ? "none" : "xMidYMid meet";

    // Access grid placement computed by root (via derived values)
    const showLabelSpace = ctx.labelMode !== "none" && ctx.hasLabel;
    const svgGridRow = showLabelSpace && ctx.labelPosition === "above" ? "2 / 3" : "1 / 2";

    return (
        <svg
            ref={svgRef}
            data-name="Main Component"
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            preserveAspectRatio={preserveAspect as any}
            className={className}
            style={{
                display: "block",
                width: "100%",
                height: "100%",
                backgroundColor: ctx.debug ? "hsl(0, 100%, 50% / 0.06)" : undefined,
                gridRow: svgGridRow,
                ...(style ?? {}),
            }}
            {...rest}
        >
            {children}
        </svg>
    );
}

export interface AdaptiveBoxLabelProps extends PropsWithChildren {
    className?: string;
    style?: CSSProperties;
    position?: LabelPosition; // above | below
    align?: FlexAlign; // start | center | end
}

function Label({ className, style, position = "below", align = "center", children }: AdaptiveBoxLabelProps) {
    const ctx = useBoxContext();

    // Register presence and settings with the root
    useLayoutEffect(() => {
        ctx.registerLabel({ position, align });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [position, align]);

    // Respect label modes
    if (ctx.labelMode === "none") return null;

    const visibility = ctx.labelMode === "hidden" ? "hidden" : "visible";
    const gridRow = ctx.labelPosition === "above" ? "1 / 2" : "2 / 3";

    return (
        <div
            data-name="Label"
            className={className}
            style={{
                width: "100%",
                gridRow,
                visibility,
                containerType: "size",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: align,
                ...(style ?? {}),
            }}
        >
            <span
                style={{
                    fontSize: "75cqh",
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }}
            >
                {children}
            </span>
        </div>
    );
}

// Compose compound component
AdaptiveBox.Svg = Svg;
AdaptiveBox.Label = Label;

export namespace AdaptiveBox {
    export type Svg = typeof Svg;
    export type Label = typeof Label;
}

export default AdaptiveBox;
