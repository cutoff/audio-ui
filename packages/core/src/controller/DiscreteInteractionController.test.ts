/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { DiscreteInteractionController } from "./DiscreteInteractionController";

describe("DiscreteInteractionController", () => {
    const onValueChange = vi.fn();
    const options = [
        { value: 0, label: "Zero" },
        { value: 1, label: "One" },
        { value: 2, label: "Two" },
    ];
    let controller: DiscreteInteractionController;

    beforeEach(() => {
        onValueChange.mockClear();
        controller = new DiscreteInteractionController({
            value: 0,
            options,
            onValueChange,
        });
    });

    describe("Manual Controls", () => {
        it("cycleNext wraps around from last to first", () => {
            controller.updateConfig({ value: 2, options, onValueChange });
            controller.cycleNext();
            expect(onValueChange).toHaveBeenCalledWith(0);
        });

        it("cycleNext moves to next index", () => {
            controller.updateConfig({ value: 0, options, onValueChange });
            controller.cycleNext();
            expect(onValueChange).toHaveBeenCalledWith(1);
        });

        it("stepNext clamps at end", () => {
            controller.updateConfig({ value: 2, options, onValueChange });
            controller.stepNext();
            expect(onValueChange).not.toHaveBeenCalled();
        });

        it("stepNext moves to next index", () => {
            controller.updateConfig({ value: 0, options, onValueChange });
            controller.stepNext();
            expect(onValueChange).toHaveBeenCalledWith(1);
        });

        it("stepPrev clamps at start", () => {
            controller.updateConfig({ value: 0, options, onValueChange });
            controller.stepPrev();
            expect(onValueChange).not.toHaveBeenCalled();
        });

        it("stepPrev moves to previous index", () => {
            controller.updateConfig({ value: 2, options, onValueChange });
            controller.stepPrev();
            expect(onValueChange).toHaveBeenCalledWith(1);
        });
    });

    describe("Event Handling", () => {
        it("handleClick calls cycleNext", () => {
            controller.handleClick(false);
            expect(onValueChange).toHaveBeenCalledWith(1);
        });

        it("handleClick respects defaultPrevented", () => {
            controller.handleClick(true);
            expect(onValueChange).not.toHaveBeenCalled();
        });

        it("handleKeyDown: Space calls cycleNext", () => {
            const handled = controller.handleKeyDown(" ");
            expect(handled).toBe(true);
            expect(onValueChange).toHaveBeenCalledWith(1);
        });

        it("handleKeyDown: ArrowRight calls stepNext", () => {
            const handled = controller.handleKeyDown("ArrowRight");
            expect(handled).toBe(true);
            expect(onValueChange).toHaveBeenCalledWith(1);
        });

        it("handleKeyDown: ArrowLeft calls stepPrev", () => {
            controller.updateConfig({ value: 1, options, onValueChange });
            const handled = controller.handleKeyDown("ArrowLeft");
            expect(handled).toBe(true);
            expect(onValueChange).toHaveBeenCalledWith(0);
        });

        it("handleKeyDown: Unknown key does nothing", () => {
            const handled = controller.handleKeyDown("Shift");
            expect(handled).toBe(false);
            expect(onValueChange).not.toHaveBeenCalled();
        });
    });

    describe("Disabled State", () => {
        beforeEach(() => {
            controller.updateConfig({ value: 0, options, onValueChange, disabled: true });
        });

        it("ignores all interactions when disabled", () => {
            controller.cycleNext();
            controller.stepNext();
            controller.stepPrev();
            controller.handleClick(false);
            const handled = controller.handleKeyDown("ArrowRight");

            expect(handled).toBe(false);
            expect(onValueChange).not.toHaveBeenCalled();
        });
    });
});
