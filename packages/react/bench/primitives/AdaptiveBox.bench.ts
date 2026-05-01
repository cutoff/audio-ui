/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

import { bench, describe } from "vitest";
import { computeAdaptiveBoxLayout } from "../../src/components/primitives/AdaptiveBox";

const BENCH_OPTS = { time: 500, warmupIterations: 50 } as const;
let sink = 0;

describe("computeAdaptiveBoxLayout", () => {
    bench(
        "square viewBox, label visible below (canonical Knob/Button)",
        () => {
            const out = computeAdaptiveBoxLayout({
                viewBoxHeight: 100,
                labelHeightUnits: 15,
                labelMode: "visible",
                effectiveLabelPosition: "below",
            });
            sink ^= out.gridTemplateRows.length;
        },
        BENCH_OPTS
    );

    bench(
        "label above (alternative position)",
        () => {
            const out = computeAdaptiveBoxLayout({
                viewBoxHeight: 100,
                labelHeightUnits: 15,
                labelMode: "visible",
                effectiveLabelPosition: "above",
            });
            sink ^= out.gridTemplateRows.length;
        },
        BENCH_OPTS
    );

    bench(
        "no label (early-return path)",
        () => {
            const out = computeAdaptiveBoxLayout({
                viewBoxHeight: 100,
                labelHeightUnits: 15,
                labelMode: "none",
                effectiveLabelPosition: "below",
            });
            sink ^= out.gridTemplateRows.length;
        },
        BENCH_OPTS
    );

    bench(
        "wide viewBox (Slider horizontal: 200×100)",
        () => {
            const out = computeAdaptiveBoxLayout({
                viewBoxHeight: 100,
                labelHeightUnits: 15,
                labelMode: "visible",
                effectiveLabelPosition: "below",
            });
            sink ^= out.combinedHeightUnits;
        },
        BENCH_OPTS
    );

    bench(
        "tall viewBox (Slider vertical: 100×200)",
        () => {
            const out = computeAdaptiveBoxLayout({
                viewBoxHeight: 200,
                labelHeightUnits: 15,
                labelMode: "visible",
                effectiveLabelPosition: "below",
            });
            sink ^= out.combinedHeightUnits;
        },
        BENCH_OPTS
    );
});

if (sink === Number.MIN_SAFE_INTEGER) throw new Error("unreachable");
