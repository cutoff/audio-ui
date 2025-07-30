# AdaptiveSvgComponent Asymmetric Resize Handling

This document explains the asymmetric resize handling implemented in the `AdaptiveSvgComponent` to address the lag issue
when the parent container grows.

## Problem Statement

The `AdaptiveSvgComponent` previously used a debounced resize handler with a fixed 100ms delay for all resize events.
This approach caused a noticeable lag when the parent container grew, while working smoothly when the container shrank.

```javascript
// Previous implementation
const debouncedCalculate = useMemo(() => debounce(calculateDimensions, 100), [calculateDimensions]);

useEffect(() => {
    const resizeObserver = new ResizeObserver(debouncedCalculate);
    // ...
}, [calculateDimensions, debouncedCalculate]);
```

The 100ms debounce delay was beneficial for shrinking events to prevent flickering during rapid resizing, but it created
an undesirable lag when the container grew, where users typically expect immediate feedback.

## Solution: Asymmetric Resize Handling

To address this issue, we implemented an asymmetric resize handling approach that responds differently to growth vs.
shrinking:

1. **For growth**: Calculate dimensions immediately for responsive UI
2. **For shrinking**: Use debounced calculation (100ms delay) to prevent flickering

This approach provides the best of both worlds:

- Immediate response when the container grows, eliminating lag
- Smooth behavior when the container shrinks, preventing flickering

## Implementation Details

The implementation involves three key components:

### 1. Container Size Tracking

We use a ref to track the container's previous dimensions, allowing us to determine if it's growing or shrinking:

```javascript
const containerSizeRef = useRef({ width: 0, height: 0 });
```

### 2. Asymmetric Resize Handler

A wrapper function determines whether to use immediate or debounced calculation based on whether the container is
growing or shrinking:

```javascript
const handleResize = useCallback((entries: ResizeObserverEntry[]) => {
    if (!containerRef.current || entries.length === 0) return;

    const entry = entries[0];
    const newWidth = entry.contentRect.width;
    const newHeight = entry.contentRect.height;
    const prevWidth = containerSizeRef.current.width;
    const prevHeight = containerSizeRef.current.height;

    // Update the stored size
    containerSizeRef.current = { width: newWidth, height: newHeight };

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
```

### 3. ResizeObserver Setup

We initialize the container size reference and use the asymmetric handler:

```javascript
useEffect(() => {
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
        // Initialize the container size reference with current dimensions
        if (containerRef.current.clientWidth && containerRef.current.clientHeight) {
            containerSizeRef.current = {
                width: containerRef.current.clientWidth,
                height: containerRef.current.clientHeight,
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
```

## Benefits

This asymmetric resize handling approach provides several benefits:

1. **Improved User Experience**: Eliminates lag when the container grows, providing immediate visual feedback
2. **Smooth Shrinking**: Maintains smooth behavior when the container shrinks, preventing flickering
3. **Optimized Performance**: Balances responsiveness and performance by using debouncing only when necessary
4. **Consistent Behavior**: Works consistently across different browsers and devices

## Testing

A test page has been created to demonstrate the asymmetric resize handling:

- Location: `/react/demo-app/app/components/adaptive-svg-resize-test/page.tsx`
- Features:
    - Buttons to increase and decrease container size
    - Toggle for stretch mode
    - Visual feedback to observe resize behavior

## Conclusion

The asymmetric resize handling approach effectively addresses the lag issue when the parent container grows while
maintaining smooth behavior when it shrinks. This improvement enhances the responsiveness and user experience of all
components built on top of the `AdaptiveSvgComponent`.
