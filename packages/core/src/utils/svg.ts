import { polarToCartesian } from "./math";

/**
 * Calculate SVG arc path for circular controls (like knobs).
 *
 * This function generates the SVG path data for drawing arcs, which is essential for rendering
 * circular controls. The path is rounded to avoid hydration mismatches between server and client.
 *
 * The angle system follows SVG conventions:
 * - 0° is at 3 o'clock (right)
 * - Angles increase clockwise
 * - 360° is at 12 o'clock (top)
 *
 * @param cx - X coordinate of the center point
 * @param cy - Y coordinate of the center point
 * @param startAngle - Starting angle in degrees
 * @param endAngle - Ending angle in degrees
 * @param radius - Radius of the arc
 * @param direction - Direction to draw the arc. "counter-clockwise" (default) draws from End to Start (standard for static shapes). "clockwise" draws from Start to End (useful for path animations).
 * @returns SVG path string for the arc (e.g., "M 10 20 A 30 30 0 0 1 40 50")
 *
 * @example
 * ```ts
 * // Draw a 90-degree arc from 7:30 to 4:30 (standard knob range)
 * const path = calculateArcPath(50, 50, 225, 495, 30);
 * ```
 */
export const calculateArcPath = (
    cx: number,
    cy: number,
    startAngle: number,
    endAngle: number,
    radius: number,
    direction: "clockwise" | "counter-clockwise" = "counter-clockwise"
): string => {
    if (startAngle > endAngle) {
        [startAngle, endAngle] = [endAngle, startAngle];
    }

    // Round coordinates to avoid hydration mismatches
    const r = (n: number) => Math.round(n * 10000) / 10000;

    const start = polarToCartesian(cx, cy, radius, startAngle);
    const end = polarToCartesian(cx, cy, radius, endAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    // Counter-clockwise: End -> Start (Sweep 0). Clockwise: Start -> End (Sweep 1)
    const [p1, p2, sweepFlag] = direction === "counter-clockwise" ? [end, start, 0] : [start, end, 1];

    return ["M", r(p1.x), r(p1.y), "A", r(radius), r(radius), 0, largeArcFlag, sweepFlag, r(p2.x), r(p2.y)].join(" ");
};
