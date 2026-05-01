/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

import { bench, describe } from "vitest";
import { ContinuousInteractionController } from "../../src/controller/ContinuousInteractionController";
import { AudioParameterConverter, AudioParameterFactory } from "../../src/model/AudioParameter";

const BENCH_OPTS = { time: 500, warmupIterations: 50 } as const;

const linearParam = AudioParameterFactory.createControl({ name: "Linear", min: 0, max: 1 });
const midiParam = AudioParameterFactory.createMidiStandard7Bit("CC");
const logParam = AudioParameterFactory.createControl({ name: "Frequency", min: 20, max: 20000, scale: "log" });

function makeController(opts: { converter: AudioParameterConverter; step?: number }) {
    let currentNorm = 0.5;
    const controller = new ContinuousInteractionController({
        adjustValue: (delta: number, sensitivity: number = 1) => {
            // Exercise the realistic round-trip: normalize → denormalize so the JIT
            // can't dead-code-eliminate the converter call path.
            currentNorm = Math.max(0, Math.min(1, currentNorm + delta * sensitivity));
            const real = opts.converter.denormalize(currentNorm);
            opts.converter.normalize(real);
        },
        sensitivity: 0.005,
        interactionMode: "both",
        direction: "vertical",
        step: opts.step,
    });
    return controller;
}

function makeWheelEvent(deltaY: number): WheelEvent {
    // Minimal stub matching the fields the controller reads. The controller
    // calls preventDefault/stopPropagation; both must be no-op functions.
    return {
        deltaY,
        preventDefault: () => {},
        stopPropagation: () => {},
    } as unknown as WheelEvent;
}

function makeKeyEvent(key: string): KeyboardEvent {
    return {
        key,
        preventDefault: () => {},
    } as unknown as KeyboardEvent;
}

describe("ContinuousInteractionController.handleWheel", () => {
    const linearCtrl = makeController({ converter: new AudioParameterConverter(linearParam) });
    const midiCtrl = makeController({
        converter: new AudioParameterConverter(midiParam),
        step: 1 / 127,
    });
    const logCtrl = makeController({ converter: new AudioParameterConverter(logParam) });

    const wheel = makeWheelEvent(5);

    bench("linear continuous param", () => linearCtrl.handleWheel(wheel), BENCH_OPTS);
    bench("MIDI 7-bit (stepped accumulator)", () => midiCtrl.handleWheel(wheel), BENCH_OPTS);
    bench("log-scale frequency param", () => logCtrl.handleWheel(wheel), BENCH_OPTS);
});

describe("ContinuousInteractionController.handleKeyDown", () => {
    const ctrl = makeController({ converter: new AudioParameterConverter(linearParam) });
    const arrowUp = makeKeyEvent("ArrowUp");
    const home = makeKeyEvent("Home");

    bench("ArrowUp", () => ctrl.handleKeyDown(arrowUp), BENCH_OPTS);
    bench("Home", () => ctrl.handleKeyDown(home), BENCH_OPTS);
});
