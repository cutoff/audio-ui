"use client";

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
// Import only the debounce function instead of the entire lodash library
// This significantly reduces bundle size through tree-shaking
import debounce from 'lodash/debounce';
import {Base} from '../types';

/**
 * Props for the AdaptiveSvgComponent
 * Extends Base to include common properties like className, style, and event handlers
 */
export type AdaptiveSvgComponentProps = Base & {
    /** Whether the component should stretch to fill its container while maintaining aspect ratio
     * @default false */
    stretch?: boolean;
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
    /** Override event handlers with more specific SVGSVGElement type */
    onClick?: React.MouseEventHandler<SVGSVGElement>;
    onMouseDown?: React.MouseEventHandler<SVGSVGElement>;
    onMouseUp?: React.MouseEventHandler<SVGSVGElement>;
    onMouseEnter?: React.MouseEventHandler<SVGSVGElement>;
    onMouseLeave?: React.MouseEventHandler<SVGSVGElement>;
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
 * Performance optimizations:
 * - Uses React.memo with custom comparison function to prevent unnecessary re-renders
 * - Optimized dependency arrays in hooks to avoid render loops
 * - Efficient resize handling with asymmetric resize strategy:
 *   - Immediate response when container grows for responsive UI
 *   - Debounced response when container shrinks to prevent flickering
 * - Targeted lodash import to reduce bundle size
 * - Memoized style objects to prevent unnecessary recalculations
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
                                  onMouseDown,
                                  onMouseUp,
                                  onMouseEnter,
                                  onMouseLeave,
                              }: AdaptiveSvgComponentProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    // Use useRef for the previous dimensions to avoid unnecessary re-renders
    const prevDimensionsRef = useRef({width: preferredWidth, height: preferredHeight});
    const [dimensions, setDimensions] = useState({
        width: preferredWidth,
        height: preferredHeight
    });

    // Calculate aspect ratio once and store in a ref since it's derived from props and doesn't change
    const aspectRatioRef = useRef(viewBoxHeight / viewBoxWidth);

    // Update aspect ratio ref if viewBox dimensions change
    useEffect(() => {
        aspectRatioRef.current = viewBoxHeight / viewBoxWidth;
    }, [viewBoxHeight, viewBoxWidth]);

    const calculateFixedDimensions = (availableWidth: number, availableHeight: number) => {
        const newWidth = Math.min(Math.max(preferredWidth, minWidth), availableWidth);
        const newHeight = Math.min(Math.max(preferredHeight, minHeight), availableHeight);
        return {width: newWidth, height: newHeight};
    };

    const calculateStretchedDimensions = (availableWidth: number, availableHeight: number) => {
        const aspectRatio = aspectRatioRef.current;

        const byWidth = {
            width: availableWidth,
            height: availableWidth * aspectRatio,
        };

        const byHeight = {
            width: availableHeight / aspectRatio,
            height: availableHeight,
        };

        let newDimensions = byWidth.height <= availableHeight ? byWidth : byHeight;

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

        return {
            width: Math.min(newDimensions.width, availableWidth),
            height: Math.min(newDimensions.height, availableHeight),
        };
    };

    /**
     * Calculates dimensions based on container size and constraints while
     * maintaining the aspect ratio defined by viewBox dimensions
     *
     * Optimized to avoid unnecessary recalculations by removing dimensions from dependency array
     */
    const calculateDimensions = useCallback(() => {
        if (!containerRef.current) return;

        const parent = containerRef.current;
        const availableWidth = Math.max(0, parent.clientWidth);
        const availableHeight = Math.max(0, parent.clientHeight);

        const newDimensions = stretch
            ? calculateStretchedDimensions(availableWidth, availableHeight)
            : calculateFixedDimensions(availableWidth, availableHeight);

        // Only update state if dimensions have changed
        if (prevDimensionsRef.current.width !== newDimensions.width ||
            prevDimensionsRef.current.height !== newDimensions.height) {
            prevDimensionsRef.current = newDimensions;
            setDimensions(newDimensions);
        }
    }, [stretch, preferredWidth, preferredHeight, minWidth, minHeight]); // Removed dimensions from dependency array

    /**
     * Create a debounced version of calculateDimensions specifically for shrinking events.
     * We use a 100ms delay to prevent flickering during rapid shrinking.
     * This is only used when the container is getting smaller.
     */
    const debouncedShrinkCalculate = useMemo(() =>
            debounce(calculateDimensions, 100),
        [calculateDimensions]);

    /**
     * Reference to track the container's previous dimensions.
     * This allows us to determine if the container is growing or shrinking.
     */
    const containerSizeRef = useRef({width: 0, height: 0});

    /**
     * Asymmetric resize handler that responds differently to growth vs. shrinking:
     * - For growth: Calculate dimensions immediately for responsive UI
     * - For shrinking: Use debounced calculation to prevent flickering
     *
     * This approach eliminates lag when the container grows while maintaining
     * smooth behavior when it shrinks.
     */
    const handleResize = useCallback((entries: ResizeObserverEntry[]) => {
        if (!containerRef.current || entries.length === 0) return;

        const entry = entries[0];
        const newWidth = entry.contentRect.width;
        const newHeight = entry.contentRect.height;
        const prevWidth = containerSizeRef.current.width;
        const prevHeight = containerSizeRef.current.height;

        // Update the stored size
        containerSizeRef.current = {width: newWidth, height: newHeight};

        // If container is growing in either dimension, calculate immediately
        if (newWidth > prevWidth || newHeight > prevHeight) {
            // Cancel any pending debounced calculations
            debouncedShrinkCalculate.cancel();
            // Calculate immediately
            calculateDimensions();
        } else {
            // For shrinking or no change, use the debounced function
            debouncedShrinkCalculate();
        }
    }, [calculateDimensions, debouncedShrinkCalculate]);

    // Set up resize observation
    useEffect(() => {
        const resizeObserver = new ResizeObserver(handleResize);
        if (containerRef.current) {
            // Initialize the container size reference with current dimensions
            if (containerRef.current.clientWidth && containerRef.current.clientHeight) {
                containerSizeRef.current = {
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                };
            }
            resizeObserver.observe(containerRef.current);
        }

        // Initial calculation
        calculateDimensions();

        return () => {
            resizeObserver.disconnect();
            debouncedShrinkCalculate.cancel();
        };
    }, [calculateDimensions, handleResize, debouncedShrinkCalculate]);

    // Handle wheel events
    useEffect(() => {
        if (!svgRef.current) return;

        const element = svgRef.current;
        const wheelHandler = (e: WheelEvent) => {
            // Only call the user's handler if it's defined
            if (onWheel) {
                onWheel(e);
            }
            
            // Only prevent default and stop propagation if the event hasn't been prevented by the user's handler
            if (!e.defaultPrevented) {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        element.addEventListener('wheel', wheelHandler, {passive: false});
        return () => element.removeEventListener('wheel', wheelHandler);
    }, [onWheel]);

    // Styles to ensure proper grid cell containment
    const containerStyle = useMemo<React.CSSProperties>(() => {
        // Extract alignment properties from style
        const {alignSelf, justifySelf, ...restStyle} = style;

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

        // Base styles that apply to both stretch and non-stretch modes
        const baseStyles: React.CSSProperties = {
            position: 'relative',
            alignItems,
            justifyContent,
            overflow: 'hidden',  // Prevent overflow
            ...restStyle,
        };

        // Apply different styles based on stretch mode
        if (stretch) {
            // When stretched, behave as a block element that takes full container space
            return {
                ...baseStyles,
                width: '100%',
                height: '100%',
                display: 'flex',
            };
        } else {
            // When not stretched, behave as an inline element
            return {
                ...baseStyles,
                display: 'inline-flex',
            };
        }
    }, [style, stretch]);

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
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                {children}
            </svg>
        </div>
    );
}

// Custom comparison function for React.memo to prevent unnecessary re-renders
function arePropsEqual(prevProps: AdaptiveSvgComponentProps, nextProps: AdaptiveSvgComponentProps) {
    const {style: prevStyle, children: prevChildren, ...prevRest} = prevProps;
    const {style: nextStyle, children: nextChildren, ...nextRest} = nextProps;

    // Compare primitive props
    for (const key in prevRest) {
        if (prevRest[key as keyof typeof prevRest] !== nextRest[key as keyof typeof nextRest]) {
            return false;
        }
    }

    // Compare style objects
    if (JSON.stringify(prevStyle) !== JSON.stringify(nextStyle)) {
        return false;
    }

    // Always check for changes in children to ensure re-renders when content changes
    return prevChildren === nextChildren;
}

export default React.memo(AdaptiveSvgComponent, arePropsEqual);
