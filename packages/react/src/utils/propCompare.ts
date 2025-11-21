import { isEqual } from "lodash";

/**
 * Creates a comparison function for React.memo to prevent unnecessary re-renders.
 *
 * This utility creates a function that performs shallow comparison of primitive props
 * and uses lodash's isEqual for deep comparison of objects like style.
 *
 * @param options - Configuration options for the comparison
 * @param options.deepCompareProps - Array of prop names that should be deeply compared
 * @param options.alwaysCompareProps - Array of prop names that should always be directly compared (===)
 * @returns A comparison function suitable for use with React.memo
 *
 * @example
 * // Basic usage with style deep comparison
 * export default React.memo(MyComponent, createPropComparator({
 *   deepCompareProps: ['style']
 * }));
 *
 * @example
 * // Ensuring children always trigger re-render when they change
 * export default React.memo(MyComponent, createPropComparator({
 *   deepCompareProps: ['style'],
 *   alwaysCompareProps: ['children']
 * }));
 */
export function createPropComparator<T extends Record<string, any>>({
    deepCompareProps = ["style"],
    alwaysCompareProps = ["children"],
}: {
    deepCompareProps?: Array<keyof T>;
    alwaysCompareProps?: Array<keyof T>;
} = {}) {
    // Convert arrays to Sets for O(1) lookups
    const deepCompareSet = new Set(deepCompareProps);
    const alwaysCompareSet = new Set(alwaysCompareProps);

    return function propsAreEqual(prevProps: T, nextProps: T): boolean {
        // First check always-compare props with direct equality
        for (const prop of alwaysCompareSet) {
            if (prevProps[prop] !== nextProps[prop]) {
                return false;
            }
        }

        // Handle props that need deep comparison
        for (const prop of deepCompareSet) {
            if (!isEqual(prevProps[prop], nextProps[prop])) {
                return false;
            }
        }

        // For all other props, do shallow comparison
        const prevKeys = Object.keys(prevProps).filter(
            (key) => !deepCompareSet.has(key as keyof T) && !alwaysCompareSet.has(key as keyof T)
        );

        for (const key of prevKeys) {
            if (prevProps[key] !== nextProps[key]) {
                return false;
            }
        }

        return true;
    };
}
