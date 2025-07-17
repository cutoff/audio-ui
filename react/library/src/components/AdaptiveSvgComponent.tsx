import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';

/**
 * Props for the AdaptiveSvgComponent
 */
export type AdaptiveSvgComponentProps = {
    /** Whether the component should stretch to fill its container while maintaining aspect ratio
     * @default false */
    stretch?: boolean;
    /** Additional CSS classes to apply to the container element */
    className?: string;
    /** Additional inline styles to apply to the container element.
     * Supports grid layout properties (justifySelf, alignSelf) which control
     * the alignment of the SVG within its container:
     * - alignSelf: 'start' | 'end' | 'center' - Controls vertical alignment
     * - justifySelf: 'start' | 'end' | 'center' - Controls horizontal alignment
     * Default alignment is center for both axes when not specified. */
    style?: React.CSSProperties;
    /** SVG content to render within the component */
    children: React.ReactNode;
    /** Desired width when not stretching
     * @default 100 */
    preferredWidth?: number;
    /** Desired height when not stretching
     * @default 100 */
    preferredHeight?: number;
    /** Minimum width the component will maintain, even when container is smaller
     * @default 40 */
    minWidth?: number;
    /** Minimum height the component will maintain, even when container is smaller
     * @default 40 */
    minHeight?: number;
    /** Width of the SVG viewport coordinate system
     * @default 100 */
    viewBoxWidth?: number;
    /** Height of the SVG viewport coordinate system
     * @default 100 */
    viewBoxHeight?: number;
    /** Handler for wheel events. When provided, wheel events are prevented from propagating
     * and their default behavior is prevented */
    onWheel?: (e: WheelEvent) => void;
    /** Handler for click events on the SVG element */
    onClick?: React.MouseEventHandler<SVGSVGElement>;
};

/**
 * AdaptiveSvgComponent serves as the foundation for audio control components, providing consistent
 * sizing, aspect ratio maintenance, and event handling.
 *
 * Features:
 * - Maintains aspect ratio when resizing
 * - Supports both fixed and container-filling modes
 * - Handles minimum size constraints
 * - Provides wheel event management with propagation control
 * - Compatible with CSS Grid and Flexbox layouts
 * - Supports responsive resizing
 * - Properly contains content within grid cells
 * - Supports alignment control via alignSelf and justifySelf properties
 *
 * @example
 * ```tsx
 * // Fixed size usage
 * <AdaptiveSvgComponent
 *   preferredWidth={100}
 *   preferredHeight={200}
 *   viewBoxWidth={100}
 *   viewBoxHeight={200}
 * >
 *   <circle cx="50" cy="100" r="40" />
 * </AdaptiveSvgComponent>
 *
 * // Stretching usage in grid
 * <AdaptiveSvgComponent
 *   stretch={true}
 *   style={{ justifySelf: 'center', alignSelf: 'center' }}
 *   viewBoxWidth={100}
 *   viewBoxHeight={200}
 * >
 *   <rect x="25" y="50" width="50" height="100" />
 * </AdaptiveSvgComponent>
 * ```
 */
function AdaptiveSvgComponent({
                                          stretch = false,
                                          className = '',
                                          style = {},
                                          children,
                                          preferredWidth = 100,
                                          preferredHeight = 100,
                                          minWidth = 40,
                                          minHeight = 40,
                                          viewBoxWidth = 100,
                                          viewBoxHeight = 100,
                                          onWheel,
                                          onClick,
                                      }: AdaptiveSvgComponentProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({
        width: preferredWidth,
        height: preferredHeight
    });

    const aspectRatio = viewBoxHeight / viewBoxWidth;

    /**
     * Calculates dimensions based on container size and constraints while
     * maintaining the aspect ratio defined by viewBox dimensions
     */
    const calculateDimensions = useCallback(() => {
        if (!containerRef.current) return;

        const parent = containerRef.current;
        const availableWidth = Math.max(0, parent.clientWidth);
        const availableHeight = Math.max(0, parent.clientHeight);

        if (!stretch) {
            // When not stretching, use preferred size but don't exceed container
            const newDimensions = {
                width: Math.min(Math.max(preferredWidth, minWidth), availableWidth),
                height: Math.min(Math.max(preferredHeight, minHeight), availableHeight),
            };

            // Only update state if dimensions have changed
            if (dimensions.width !== newDimensions.width || dimensions.height !== newDimensions.height) {
                setDimensions(newDimensions);
            }
            return;
        }

        // Calculate dimensions both ways
        const byWidth = {
            width: availableWidth,
            height: availableWidth * aspectRatio,
        };

        const byHeight = {
            width: availableHeight / aspectRatio,
            height: availableHeight,
        };

        // Choose the smaller option that maintains aspect ratio
        const fitByWidth = byWidth.height <= availableHeight;
        let newDimensions = fitByWidth ? byWidth : byHeight;

        // Ensure we don't go below minimum size
        if (newDimensions.width < minWidth || newDimensions.height < minHeight) {
            if (newDimensions.width / minWidth > newDimensions.height / minHeight) {
                newDimensions = {
                    width: minHeight / aspectRatio,
                    height: minHeight,
                };
            } else {
                newDimensions = {
                    width: minWidth,
                    height: minWidth * aspectRatio,
                };
            }
        }

        // Make sure we never exceed available space
        newDimensions = {
            width: Math.min(newDimensions.width, availableWidth),
            height: Math.min(newDimensions.height, availableHeight),
        };

        // Only update state if dimensions have changed
        if (dimensions.width !== newDimensions.width || dimensions.height !== newDimensions.height) {
            setDimensions(newDimensions);
        }
    }, [stretch, preferredWidth, preferredHeight, minWidth, minHeight, aspectRatio, dimensions]);

    // Set up resize observation
    useEffect(() => {
        const debouncedCalculate = debounce(calculateDimensions, 100);

        const resizeObserver = new ResizeObserver(debouncedCalculate);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            resizeObserver.disconnect();
            debouncedCalculate.cancel();
        };
    }, [calculateDimensions]);

    // Handle wheel events
    useEffect(() => {
        if (!onWheel || !svgRef.current) return;

        const element = svgRef.current;
        const wheelHandler = (e: WheelEvent) => {
            e.preventDefault();
            e.stopPropagation();
            onWheel(e);
        };

        element.addEventListener('wheel', wheelHandler, { passive: false });
        return () => element.removeEventListener('wheel', wheelHandler);
    }, [onWheel]);

    // Styles to ensure proper grid cell containment
    const containerStyle = useMemo<React.CSSProperties>(() => {
        // Extract alignment properties from style
        const { alignSelf, justifySelf, ...restStyle } = style;

        // Map grid alignment properties to flex alignment properties
        let alignItems = 'center';
        let justifyContent = 'center';

        // Map alignSelf to alignItems
        if (alignSelf === 'start') alignItems = 'flex-start';
        else if (alignSelf === 'end') alignItems = 'flex-end';
        else if (alignSelf === 'center') alignItems = 'center';

        // Map justifySelf to justifyContent
        if (justifySelf === 'start') justifyContent = 'flex-start';
        else if (justifySelf === 'end') justifyContent = 'flex-end';
        else if (justifySelf === 'center') justifyContent = 'center';

        return {
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems,
            justifyContent,
            // backgroundColor: 'hsla(332, 95%, 54%, 15%)',
            overflow: 'hidden',  // Prevent overflow
            ...restStyle,
        };
    }, [style]);

    const svgStyle = useMemo<React.CSSProperties>(() => ({
        width: stretch ? 'auto' : dimensions.width,
        height: stretch ? 'auto' : dimensions.height,
        maxWidth: stretch ? '100%' : dimensions.width,
        maxHeight: stretch ? '100%' : dimensions.height,
        flexShrink: 0,  // Prevent unwanted shrinking
    }), [stretch, dimensions.width, dimensions.height]);

    return (
        <div ref={containerRef} style={containerStyle} className={className}>
            <svg
                ref={svgRef}
                width={dimensions.width}
                height={dimensions.height}
                viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
                style={svgStyle}
                onClick={onClick}
            >
                {children}
            </svg>
        </div>
    );
}

export default React.memo(AdaptiveSvgComponent);
