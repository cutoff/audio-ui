/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

import { bench, describe } from "vitest";
import { getSizeClassForComponent, getSizeStyleForComponent } from "../../src/utils/sizing";
import type { SizeType } from "../../src/types";

const BENCH_OPTS = { time: 500, warmupIterations: 50 } as const;

const sizes: SizeType[] = ["xsmall", "small", "normal", "large", "xlarge"];
let sink = 0;

describe("getSizeClassForComponent", () => {
    bench(
        "all component types × all sizes (square/keys/slider, both orientations)",
        () => {
            for (const size of sizes) {
                sink ^= getSizeClassForComponent("square", size).length;
                sink ^= getSizeClassForComponent("keys", size).length;
                sink ^= getSizeClassForComponent("slider", size, "vertical").length;
                sink ^= getSizeClassForComponent("slider", size, "horizontal").length;
            }
        },
        BENCH_OPTS
    );
});

describe("getSizeStyleForComponent", () => {
    bench(
        "all component types × all sizes (square/keys/slider, both orientations)",
        () => {
            for (const size of sizes) {
                sink ^= getSizeStyleForComponent("square", size).width.length;
                sink ^= getSizeStyleForComponent("keys", size).height.length;
                sink ^= getSizeStyleForComponent("slider", size, "vertical").width.length;
                sink ^= getSizeStyleForComponent("slider", size, "horizontal").height.length;
            }
        },
        BENCH_OPTS
    );
});

// Keep `sink` live so the JIT cannot dead-code-eliminate the calls above.
if (sink === Number.MIN_SAFE_INTEGER) throw new Error("unreachable");
