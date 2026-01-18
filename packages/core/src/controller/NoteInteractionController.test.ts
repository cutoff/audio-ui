/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NoteInteractionController } from "./NoteInteractionController";

describe("NoteInteractionController", () => {
    let onNoteOn: any;
    let onNoteOff: any;
    let controller: NoteInteractionController;

    beforeEach(() => {
        onNoteOn = vi.fn();
        onNoteOff = vi.fn();
        controller = new NoteInteractionController({
            onNoteOn,
            onNoteOff,
            disabled: false,
        });
    });

    it("should trigger note on on pointer down", () => {
        controller.handlePointerDown(1, 60);
        expect(onNoteOn).toHaveBeenCalledWith(60, 1);
        expect(onNoteOff).not.toHaveBeenCalled();
    });

    it("should not trigger note on if note is null on pointer down", () => {
        controller.handlePointerDown(1, null);
        expect(onNoteOn).not.toHaveBeenCalled();
    });

    it("should handle glissando: trigger note off and then note on", () => {
        controller.handlePointerDown(1, 60);
        onNoteOn.mockClear();

        controller.handlePointerMove(1, 62);
        expect(onNoteOff).toHaveBeenCalledWith(60, 1);
        expect(onNoteOn).toHaveBeenCalledWith(62, 1);
    });

    it("should not trigger anything if pointer moves but was not down", () => {
        controller.handlePointerMove(1, 60);
        expect(onNoteOn).not.toHaveBeenCalled();
        expect(onNoteOff).not.toHaveBeenCalled();
    });

    it("should handle multiple pointers independently", () => {
        controller.handlePointerDown(1, 60);
        controller.handlePointerDown(2, 64);

        expect(onNoteOn).toHaveBeenCalledWith(60, 1);
        expect(onNoteOn).toHaveBeenCalledWith(64, 2);

        controller.handlePointerMove(1, 62);
        expect(onNoteOff).toHaveBeenCalledWith(60, 1);
        expect(onNoteOn).toHaveBeenCalledWith(62, 1);
        expect(onNoteOff).not.toHaveBeenCalledWith(64, 2);
    });

    it("should handle pointer up", () => {
        controller.handlePointerDown(1, 60);
        controller.handlePointerUp(1);
        expect(onNoteOff).toHaveBeenCalledWith(60, 1);
    });

    it("should handle pointer moving to non-key area while down", () => {
        controller.handlePointerDown(1, 60);
        controller.handlePointerMove(1, null);
        expect(onNoteOff).toHaveBeenCalledWith(60, 1);

        onNoteOff.mockClear();
        controller.handlePointerMove(1, 62);
        expect(onNoteOn).toHaveBeenCalledWith(62, 1);
    });

    it("should handle drag-into-key: start on null, move to note", () => {
        controller.handlePointerDown(1, null);
        expect(onNoteOn).not.toHaveBeenCalled();

        controller.handlePointerMove(1, 60);
        expect(onNoteOn).toHaveBeenCalledWith(60, 1);
    });

    it("should respect disabled state", () => {
        controller.updateConfig({ onNoteOn, onNoteOff, disabled: true });

        controller.handlePointerDown(1, 60);
        expect(onNoteOn).not.toHaveBeenCalled();

        controller.handlePointerMove(1, 60);
        expect(onNoteOn).not.toHaveBeenCalled();
    });
});
