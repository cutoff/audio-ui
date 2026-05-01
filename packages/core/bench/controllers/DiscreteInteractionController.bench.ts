/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

import { bench, describe } from "vitest";
import { DiscreteInteractionController } from "../../src/controller/DiscreteInteractionController";

const BENCH_OPTS = { time: 500, warmupIterations: 50 } as const;

const sixteenOptions = Array.from({ length: 16 }, (_, i) => ({ value: i }));

function makeController() {
    let value: number | string = 0;
    const controller = new DiscreteInteractionController({
        value,
        options: sixteenOptions,
        onValueChange: () => {},
    });
    const rebind = () => {
        controller.updateConfig({
            value,
            options: sixteenOptions,
            onValueChange: (v) => {
                value = v;
                rebind();
            },
        });
    };
    rebind();
    return controller;
}

describe("DiscreteInteractionController", () => {
    const cycleCtrl = makeController();
    const stepCtrl = makeController();
    const clickCtrl = makeController();

    bench("cycleNext (16 options)", () => cycleCtrl.cycleNext(), BENCH_OPTS);
    bench("stepNext (16 options)", () => stepCtrl.stepNext(), BENCH_OPTS);
    bench("handleClick (no preventDefault)", () => clickCtrl.handleClick(false), BENCH_OPTS);
});

describe("DiscreteInteractionController.handleKeyDown", () => {
    const ctrl = makeController();

    bench(
        "ArrowUp (step)",
        () => {
            ctrl.handleKeyDown("ArrowUp");
        },
        BENCH_OPTS
    );
    bench(
        "Enter (cycle)",
        () => {
            ctrl.handleKeyDown("Enter");
        },
        BENCH_OPTS
    );
});
