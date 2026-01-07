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

    // Computed grid row for main content (Svg, HtmlOverlay, Canvas, GL all use this)
    mainContentGridRow: string;

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
    debug?: boolean; // controls dev visuals (scaler border, svg background). Defaults to false
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

    // Derived layout numbers (kept local for readability and to avoid context churn)
    const svgViewBoxWidth = svgInfo?.width ?? 100;
    const svgViewBoxHeight = svgInfo?.height ?? 100;
    const styleH = (style?.justifySelf as FlexAlign) ?? "center";
    const styleV = (style?.alignSelf as FlexAlign) ?? "center";
    const hAlign = svgInfo?.hAlign ?? styleH;
    const vAlign = svgInfo?.vAlign ?? styleV;
    const effectiveLabelPosition: LabelPosition = labelInfo?.position ?? "below";
    const isFill = displayMode === "fill";

    // Compute grid row for main content (used by Svg, HtmlOverlay, Canvas, GL)
    const showLabelSpace = labelMode !== "none" && !!labelInfo;
    const mainContentGridRow = showLabelSpace && effectiveLabelPosition === "above" ? "2 / 3" : "1 / 2";

    const ctxValue = useMemo<BoxContextValue>(
        () => ({
            hasLabel: !!labelInfo,
            labelPosition: labelInfo?.position ?? "below",
            displayMode,
            labelMode,
            labelHeightUnits: labelHeightUnitsEffective,
            debug,
            mainContentGridRow,
            registerSvg,
            registerLabel,
        }),
        [
            labelInfo,
            displayMode,
            labelMode,
            labelHeightUnitsEffective,
            debug,
            mainContentGridRow,
            registerSvg,
            registerLabel,
        ]
    );
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
    onWheel?: (e: React.WheelEvent<SVGSVGElement>) => void;
    onClick?: React.MouseEventHandler<SVGSVGElement>;
    onMouseDown?: React.MouseEventHandler<SVGSVGElement>;
    onMouseUp?: React.MouseEventHandler<SVGSVGElement>;
    onMouseEnter?: React.MouseEventHandler<SVGSVGElement>;
    onMouseLeave?: React.MouseEventHandler<SVGSVGElement>;
    onTouchStart?: React.TouchEventHandler<SVGSVGElement>;
    onKeyDown?: React.KeyboardEventHandler<SVGSVGElement>;
    onKeyUp?: React.KeyboardEventHandler<SVGSVGElement>;
    tabIndex?: number;
    role?: string;
    "aria-valuenow"?: number;
    "aria-valuemin"?: number;
    "aria-valuemax"?: number;
    "aria-label"?: string;
    "aria-valuetext"?: string;
    "aria-orientation"?: "horizontal" | "vertical";
    "aria-pressed"?: boolean | "mixed";
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

    useLayoutEffect(() => {
        ctx.registerSvg({ width: viewBoxWidth, height: viewBoxHeight, hAlign, vAlign });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewBoxWidth, viewBoxHeight, hAlign, vAlign]);

    const svgRef = useRef<SVGSVGElement>(null);

    // Use native non-passive listener to reliably prevent scrolling (especially Safari/Mobile)
    // React's onWheel prop is passive by default in some contexts
    useEffect(() => {
        if (!svgRef.current || !onWheel) return;

        const element = svgRef.current;
        const wheelHandler = (e: WheelEvent) => {
            onWheel(e as unknown as React.WheelEvent<SVGSVGElement>);
        };

        element.addEventListener("wheel", wheelHandler, { passive: false });
        return () => element.removeEventListener("wheel", wheelHandler);
    }, [onWheel]);

    const preserveAspect = ctx.displayMode === "fill" ? "none" : "xMidYMid meet";

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
                // Position in main content grid row
                gridRow: ctx.mainContentGridRow,
                gridColumn: 1,
                backgroundColor: ctx.debug ? "hsl(0, 100%, 50% / 0.06)" : undefined,
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

    useLayoutEffect(() => {
        ctx.registerLabel({ position, align });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [position, align]);

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

export interface AdaptiveBoxHtmlOverlayProps extends PropsWithChildren {
    className?: string;
    style?: CSSProperties;
    /**
     * Pointer events behavior.
     * - "none" (default): Clicks pass through to elements below (e.g., SVG)
     * - "auto": Overlay is interactive
     */
    pointerEvents?: "none" | "auto";
}

/**
 * HTML overlay positioned over the main content area (same grid cell as Svg/Canvas/GL).
 * Used for rendering text, icons, or other HTML content on top of SVG graphics.
 *
 * This approach avoids Safari's foreignObject rendering bugs with container queries
 * by rendering HTML content outside the SVG as a sibling element.
 *
 * The overlay provides a container query context (`containerType: "size"`) enabling
 * responsive sizing with `cqmin`, `cqmax`, `cqw`, `cqh` units.
 *
 * Uses CSS Grid stacking: multiple elements in the same grid cell overlap
 * in DOM order (later elements appear on top).
 */
function HtmlOverlay({ className, style, pointerEvents = "none", children }: AdaptiveBoxHtmlOverlayProps) {
    const ctx = useBoxContext();

    return (
        <div
            data-name="HTML Overlay"
            className={className}
            style={{
                // Same grid cell as Svg - CSS Grid stacks elements in DOM order
                gridRow: ctx.mainContentGridRow,
                gridColumn: 1,
                // Override parent's centering to fill the entire grid cell
                placeSelf: "stretch",
                // Container query context for cqmin/cqmax units
                containerType: "size",
                // Center content within the overlay
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                // Pointer events (default: pass through to SVG below)
                pointerEvents,
                ...(style ?? {}),
            }}
        >
            {children}
        </div>
    );
}

// Compose compound component
AdaptiveBox.Svg = Svg;
AdaptiveBox.Label = Label;
AdaptiveBox.HtmlOverlay = HtmlOverlay;

export namespace AdaptiveBox {
    export type Svg = typeof Svg;
    export type Label = typeof Label;
    export type HtmlOverlay = typeof HtmlOverlay;
}

export default AdaptiveBox;
