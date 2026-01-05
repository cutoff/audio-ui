import { useMemo } from "react";
import { getSizeClassForComponent, getSizeStyleForComponent, SizeType } from "@cutoff/audio-ui-core";

/**
 * Hook that encapsulates adaptive sizing logic for components implementing AdaptiveSizeProps.
 *
 * Determines sizing behavior based on `adaptiveSize` and `size` props:
 * - When `adaptiveSize` is true, the component stretches to fill its container (no size constraints)
 * - When `adaptiveSize` is false, size classes and styles are applied based on the `size` prop
 *
 * @param adaptiveSize - Whether the component should stretch to fill its container
 * @param size - The size value (ignored when adaptiveSize is true)
 * @param componentType - The type of component ('knob', 'button', 'keys', or 'slider')
 * @param orientation - Optional orientation for slider components ('vertical' or 'horizontal')
 * @returns Object containing `sizeClassName` and `sizeStyle`
 *
 * @example
 * ```tsx
 * const { sizeClassName, sizeStyle } = useAdaptiveSize(
 *   adaptiveSize,
 *   size,
 *   "knob"
 * );
 * ```
 */
export function useAdaptiveSize(
    adaptiveSize: boolean = false,
    size: SizeType = "normal",
    componentType: "knob" | "button" | "keys" | "slider",
    orientation?: "vertical" | "horizontal"
) {
    return useMemo(() => {
        // When adaptiveSize is true, component stretches to fill container (no size constraints)
        // When false, apply size classes and styles based on the size prop
        const sizeClassName = adaptiveSize
            ? undefined
            : orientation !== undefined
              ? getSizeClassForComponent(componentType, size, orientation)
              : getSizeClassForComponent(componentType, size);

        const sizeStyle = adaptiveSize
            ? undefined
            : orientation !== undefined
              ? getSizeStyleForComponent(componentType, size, orientation)
              : getSizeStyleForComponent(componentType, size);

        return {
            sizeClassName,
            sizeStyle,
        };
    }, [adaptiveSize, size, componentType, orientation]);
}
