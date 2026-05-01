/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

import { bench, describe } from "vitest";
import { BooleanInteractionController } from "../../src/controller/BooleanInteractionController";

const BENCH_OPTS = { time: 500, warmupIterations: 50 } as const;

function makeController(mode: "toggle" | "momentary") {
    let value = false;
    const controller = new BooleanInteractionController({
        value,
        mode,
        onValueChange: (v) => {
            value = v;
            controller.updateConfig({ value, mode, onValueChange: () => {} });
        },
    });
    // Re-bind onValueChange so it captures the controller after construction.
    controller.updateConfig({
        value,
        mode,
        onValueChange: (v) => {
            value = v;
            controller.updateConfig({ value, mode, onValueChange: () => {} });
        },
    });
    return controller;
}

describe("BooleanInteractionController.handleMouseDown", () => {
    const toggleCtrl = makeController("toggle");
    const momentaryCtrl = makeController("momentary");

    bench("toggle mode", () => toggleCtrl.handleMouseDown(false), BENCH_OPTS);
    bench("momentary mode (down/up cycle)", () => {
        momentaryCtrl.handleMouseDown(false);
        momentaryCtrl.handleMouseUp(false);
    }, BENCH_OPTS);
});

describe("BooleanInteractionController drag-in/drag-out", () => {
    const ctrl = makeController("momentary");

    bench("global down → enter → leave → up (step-sequencer pattern)", () => {
        ctrl.handleGlobalPointerDown(false);
        ctrl.handleMouseEnter();
        ctrl.handleMouseLeave();
        ctrl.handleGlobalPointerUp();
    }, BENCH_OPTS);
});

describe("BooleanInteractionController.handleKeyDown", () => {
    const ctrl = makeController("toggle");

    bench("Enter", () => {
        ctrl.handleKeyDown("Enter");
    }, BENCH_OPTS);
    bench("Space", () => {
        ctrl.handleKeyDown(" ");
    }, BENCH_OPTS);
});
