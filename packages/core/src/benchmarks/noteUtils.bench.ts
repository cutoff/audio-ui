/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import { bench, describe } from "vitest";
import { noteNumToNote, noteToNoteNum, createNoteNumSet, isNoteOn, isBlackKey } from "../utils/noteUtils";

describe("noteNumToNote", () => {
    bench("convert middle C (60)", () => {
        noteNumToNote(60);
    });

    bench("convert note at boundary (0)", () => {
        noteNumToNote(0);
    });

    bench("convert note at boundary (127)", () => {
        noteNumToNote(127);
    });
});

describe("noteToNoteNum", () => {
    bench("convert C4 to MIDI number", () => {
        noteToNoteNum("C4");
    });

    bench("convert F#5 to MIDI number", () => {
        noteToNoteNum("F#5");
    });

    bench("convert A0 to MIDI number", () => {
        noteToNoteNum("A0");
    });
});

describe("createNoteNumSet", () => {
    const mixedNotes: (string | number)[] = ["C4", "E4", "G4", 72, 76, 79];

    bench("create set from mixed string and number notes", () => {
        createNoteNumSet(mixedNotes);
    });

    bench("create set from numeric notes", () => {
        createNoteNumSet([60, 64, 67, 72, 76, 79]);
    });

    bench("create set from string notes", () => {
        createNoteNumSet(["C4", "E4", "G4", "C5", "E5", "G5"]);
    });
});

describe("isNoteOn", () => {
    const notesOn: (string | number)[] = [60, 64, 67, "C5", "E5"];

    bench("check note present (number)", () => {
        isNoteOn(60, notesOn);
    });

    bench("check note present (string)", () => {
        isNoteOn("C5", notesOn);
    });

    bench("check note absent", () => {
        isNoteOn(61, notesOn);
    });
});

describe("isBlackKey", () => {
    bench("check white key (C)", () => {
        isBlackKey(60);
    });

    bench("check black key (C#)", () => {
        isBlackKey(61);
    });

    bench("check white key (E)", () => {
        isBlackKey(64);
    });
});
