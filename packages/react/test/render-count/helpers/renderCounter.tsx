/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

// Render-count regression test utilities.
//
// Approach: wrap each tracked control in a `React.memo` HOC produced by
// `trackRenders(Component)`. Because the HOC itself is memoized with a shallow
// prop comparison, a parent re-render with unchanged props bails out and the
// wrapper does not re-execute — mirroring the bailout behavior of the memoized
// library controls underneath. The HOC records an update only when its own
// body actually runs, i.e. only when props (or the counter identity) change.
//
// The scene's root is treated differently: it always re-renders on state
// changes, so scenes call `record("scene-root", ...)` directly from an effect.
//
// Baselines live as inline constants in each *.test.tsx file next to the
// assertions. To update a baseline, change the constant in the test file.
//
// Default mode is informational: divergence from a baseline emits `console.warn`
// but the test passes. Set `RENDER_COUNT_STRICT=1` to turn divergence into a
// hard failure (via `expect(actual).toBe(expected)`).

import React from "react";
import { expect } from "vitest";

/**
 * Mount/update tally per profiled id. The `mount` phase fires once per id on
 * first render; subsequent runs of the tracked component contribute to `update`.
 */
export type RenderCounts = Record<string, { mount: number; update: number }>;

/**
 * Callback signature passed to scenes and tracked components to register a
 * render. Implementations are produced by {@link createRenderCounter}.
 */
export interface RecordFn {
    (id: string, phase: "mount" | "update"): void;
}

/**
 * Handle returned by {@link createRenderCounter}. `record` is wired into scenes
 * and tracked components; `getCounts` returns the live tally; `reset` clears
 * counts (typically called immediately after the initial `render(...)` so
 * mount-phase entries are excluded from per-trigger assertions).
 */
export interface RenderCounter {
    record: RecordFn;
    getCounts: () => RenderCounts;
    reset: () => void;
}

/**
 * Creates an isolated render counter instance. Each test should call this
 * to avoid cross-test leakage.
 *
 * @returns A {@link RenderCounter} with `record`, `getCounts`, and `reset`.
 */
export function createRenderCounter(): RenderCounter {
    const counts: RenderCounts = {};

    const record: RecordFn = (id, phase) => {
        if (!counts[id]) counts[id] = { mount: 0, update: 0 };
        counts[id][phase] += 1;
    };

    const getCounts = () => counts;

    const reset = () => {
        for (const key of Object.keys(counts)) delete counts[key];
    };

    return { record, getCounts, reset };
}

/**
 * Wraps a component in a `React.memo` HOC that records each of its renders
 * via the supplied `record` callback. Because the wrapper is memoized with a
 * shallow prop comparison, parent re-renders with unchanged props bail out
 * and the wrapper does not re-execute — mirroring the bailout behavior of the
 * memoized library controls underneath.
 *
 * Call once per component type at module scope, then render with the extra
 * `trackId` and `record` props alongside the underlying component's props.
 *
 * @param Component The component type to wrap (e.g. `Knob`, `Slider`, `Button`).
 * @returns A memoized component that accepts `Component`'s props plus
 *          `trackId: string` and `record: RecordFn`.
 *
 * @example
 * ```tsx
 * const TrackedKnob = trackRenders(Knob); // at module scope
 * // ...
 * <TrackedKnob trackId="knob-0" record={record} value={v} min={0} max={1} />
 * ```
 */
export function trackRenders<P extends object>(
    Component: React.ComponentType<P>
): React.ComponentType<P & { trackId: string; record: RecordFn }> {
    const Tracked = function Tracked(props: P & { trackId: string; record: RecordFn }): React.ReactElement {
        const { trackId, record, ...rest } = props as P & {
            trackId: string;
            record: RecordFn;
        };
        const mounted = React.useRef(false);
        React.useEffect(() => {
            record(trackId, mounted.current ? "update" : "mount");
            mounted.current = true;
        });
        return <Component {...(rest as unknown as P)} />;
    };
    return React.memo(Tracked) as unknown as React.ComponentType<P & { trackId: string; record: RecordFn }>;
}

/**
 * Records a mount on first render and an update on each subsequent render of
 * the calling component. Use at the top of scene components that should
 * always be counted (no memo bailout on the root).
 *
 * @param record Callback obtained from {@link createRenderCounter}.
 * @param id Profiled id to attribute the renders to (typically `"scene-root"`).
 */
export function useRecordRootRenders(record: RecordFn, id: string): void {
    const mounted = React.useRef(false);
    React.useEffect(() => {
        record(id, mounted.current ? "update" : "mount");
        mounted.current = true;
    });
}

/**
 * Strict mode flag: when `true`, baseline divergence becomes a hard test
 * failure via `expect`; when `false` (default), divergence emits
 * `console.warn` and the test passes. Driven by the `RENDER_COUNT_STRICT=1`
 * environment variable. Flip this to graduate the suite from informational
 * to enforcing once baselines are stable across releases.
 */
export const STRICT: boolean =
    (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.RENDER_COUNT_STRICT ===
    "1";

/**
 * Asserts a single render count against a baseline, honoring the `STRICT`
 * flag: warn-only in informational mode, hard failure in strict mode.
 *
 * @param id The profiled id whose count is being checked.
 * @param actual Measured update count since last `reset()`.
 * @param expected Baseline expected update count.
 * @param context Short human-readable label for the trigger (e.g. `"parent re-render"`).
 */
export function expectRenderCount(id: string, actual: number, expected: number, context: string): void {
    if (actual === expected) return;

    if (STRICT) {
        expect(actual, `[render-count] ${context} id=${id}`).toBe(expected);
        return;
    }

    console.warn(`[render-count divergence] ${context} id=${id} expected=${expected} actual=${actual}`);
}

/**
 * Walks a baseline map and asserts each id's measured update count via
 * `expectRenderCount`. Ids missing from the measured counts are treated as
 * zero updates.
 *
 * @param counts Result of `RenderCounter.getCounts()`.
 * @param baseline Map from profiled id to expected update count.
 * @param context Short human-readable label for the trigger.
 */
export function assertRenderCounts(counts: RenderCounts, baseline: Record<string, number>, context: string): void {
    for (const [id, expected] of Object.entries(baseline)) {
        expectRenderCount(id, counts[id]?.update ?? 0, expected, context);
    }
}
