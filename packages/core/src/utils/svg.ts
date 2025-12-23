import { polarToCartesian } from "./math";

/**
 * Calculate SVG arc path for circular controls (like knobs).
 *
 * @param cx - X coordinate of the center point
 * @param cy - Y coordinate of the center point
 * @param startAngle - Starting angle in degrees
 * @param endAngle - Ending angle in degrees
 * @param radius - Radius of the arc
 * @returns SVG path string for the arc
 */
export const calculateArcPath = (
    cx: number,
    cy: number,
    startAngle: number,
    endAngle: number,
    radius: number
): string => {
    if (startAngle > endAngle) {
        [startAngle, endAngle] = [endAngle, startAngle];
    }

    // Round coordinates to avoid hydration mismatches between server and client
    const r = (n: number) => Math.round(n * 10000) / 10000;

    const start = polarToCartesian(cx, cy, radius, endAngle);
    const end = polarToCartesian(cx, cy, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return ["M", r(start.x), r(start.y), "A", r(radius), r(radius), 0, largeArcFlag, 0, r(end.x), r(end.y)].join(" ");
};
