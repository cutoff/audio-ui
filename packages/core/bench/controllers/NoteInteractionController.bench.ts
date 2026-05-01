/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

import { bench, describe } from "vitest";
import { NoteInteractionController } from "../../src/controller/NoteInteractionController";

const BENCH_OPTS = { time: 500, warmupIterations: 50 } as const;

let activeNotes = 0;
const ctrl = new NoteInteractionController({
    onNoteOn: () => {
        activeNotes++;
    },
    onNoteOff: () => {
        activeNotes--;
    },
});

describe("NoteInteractionController glissando", () => {
    bench(
        "single pointer slides between two adjacent notes (down → move → move → up)",
        () => {
            ctrl.handlePointerDown(1, 60);
            ctrl.handlePointerMove(1, 61);
            ctrl.handlePointerMove(1, 60);
            ctrl.handlePointerUp(1);
        },
        BENCH_OPTS
    );

    bench(
        "three concurrent pointers glissando (multi-touch, 3 notes each)",
        () => {
            ctrl.handlePointerDown(1, 60);
            ctrl.handlePointerDown(2, 64);
            ctrl.handlePointerDown(3, 67);
            ctrl.handlePointerMove(1, 61);
            ctrl.handlePointerMove(2, 65);
            ctrl.handlePointerMove(3, 68);
            ctrl.handlePointerUp(1);
            ctrl.handlePointerUp(2);
            ctrl.handlePointerUp(3);
        },
        BENCH_OPTS
    );
});

describe("NoteInteractionController.handlePointerMove (no-op when note unchanged)", () => {
    ctrl.handlePointerDown(1, 60);

    bench(
        "same note (early-return path)",
        () => {
            ctrl.handlePointerMove(1, 60);
        },
        BENCH_OPTS
    );
});

// Keep the variable live so the JIT cannot dead-code-eliminate the callbacks.
if (activeNotes < 0) throw new Error("unreachable");
