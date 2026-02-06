/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { BooleanInteractionController } from "./BooleanInteractionController";

describe("BooleanInteractionController", () => {
    let onValueChange: ReturnType<typeof vi.fn>;
    let controller: BooleanInteractionController;

    beforeEach(() => {
        onValueChange = vi.fn();
    });

    describe("Toggle mode", () => {
        beforeEach(() => {
            controller = new BooleanInteractionController({
                value: false,
                mode: "toggle",
                onValueChange,
            });
        });

        it("toggles value on mouse down", () => {
            controller.handleMouseDown(false);
            expect(onValueChange).toHaveBeenCalledWith(true);
            onValueChange.mockClear();
            controller.updateConfig({ value: true, mode: "toggle", onValueChange });
            controller.handleMouseDown(false);
            expect(onValueChange).toHaveBeenCalledWith(false);
        });

        it("does nothing on mouse up", () => {
            controller.handleMouseDown(false);
            onValueChange.mockClear();
            controller.handleMouseUp(false);
            expect(onValueChange).not.toHaveBeenCalled();
        });

        it("toggles on mouse enter when pointer is globally down (drag-in)", () => {
            controller.handleGlobalPointerDown(false);
            controller.handleMouseEnter();
            expect(onValueChange).toHaveBeenCalledWith(true);
            onValueChange.mockClear();
            controller.updateConfig({ value: true, mode: "toggle", onValueChange });
            controller.handleMouseEnter();
            expect(onValueChange).toHaveBeenCalledWith(false);
        });

        it("does nothing on mouse enter when pointer is not globally down", () => {
            controller.handleMouseEnter();
            expect(onValueChange).not.toHaveBeenCalled();
        });

        it("does nothing on mouse leave when pointer is globally down (toggle state unchanged)", () => {
            controller.handleMouseDown(false);
            expect(onValueChange).toHaveBeenCalledWith(true);
            onValueChange.mockClear();
            controller.handleMouseLeave();
            expect(onValueChange).not.toHaveBeenCalled();
        });

        it("toggles on key down (Enter)", () => {
            controller.handleKeyDown("Enter");
            expect(onValueChange).toHaveBeenCalledWith(true);
            expect(controller.handleKeyDown("Enter")).toBe(true);
        });

        it("toggles on key down (Space)", () => {
            controller.handleKeyDown(" ");
            expect(onValueChange).toHaveBeenCalledWith(true);
            expect(controller.handleKeyDown(" ")).toBe(true);
        });

        it("does nothing on key up", () => {
            controller.handleKeyDown("Enter");
            onValueChange.mockClear();
            expect(controller.handleKeyUp("Enter")).toBe(false);
            expect(onValueChange).not.toHaveBeenCalled();
        });
    });

    describe("Momentary mode", () => {
        beforeEach(() => {
            controller = new BooleanInteractionController({
                value: false,
                mode: "momentary",
                onValueChange,
            });
        });

        it("sets value to true on mouse down", () => {
            controller.handleMouseDown(false);
            expect(onValueChange).toHaveBeenCalledWith(true);
            expect(controller.getIsPressed()).toBe(true);
        });

        it("sets value to false on mouse up when pressed", () => {
            controller.handleMouseDown(false);
            onValueChange.mockClear();
            controller.handleMouseUp(false);
            expect(onValueChange).toHaveBeenCalledWith(false);
            expect(controller.getIsPressed()).toBe(false);
        });

        it("does not call onValueChange on mouse up when not pressed", () => {
            controller.handleMouseUp(false);
            expect(onValueChange).not.toHaveBeenCalled();
        });

        it("sets value to false on global pointer up when pressed", () => {
            controller.handleMouseDown(false);
            onValueChange.mockClear();
            controller.handleGlobalPointerUp();
            expect(onValueChange).toHaveBeenCalledWith(false);
        });

        it("sets value to true on mouse enter when pointer is globally down (drag-in)", () => {
            controller.handleGlobalPointerDown(false);
            controller.handleMouseEnter();
            expect(onValueChange).toHaveBeenCalledWith(true);
            expect(controller.getIsPressed()).toBe(true);
        });

        it("sets value to false on mouse leave when pressed (drag-out)", () => {
            controller.handleMouseDown(false);
            onValueChange.mockClear();
            controller.handleMouseLeave();
            expect(onValueChange).toHaveBeenCalledWith(false);
            expect(controller.getIsPressed()).toBe(false);
        });

        it("sets value to true on key down (Enter)", () => {
            controller.handleKeyDown("Enter");
            expect(onValueChange).toHaveBeenCalledWith(true);
            expect(controller.handleKeyDown("Enter")).toBe(true);
        });

        it("sets value to false on key up (Enter)", () => {
            controller.handleKeyDown("Enter");
            onValueChange.mockClear();
            expect(controller.handleKeyUp("Enter")).toBe(true);
            expect(onValueChange).toHaveBeenCalledWith(false);
        });

        it("sets value to false on key up (Space)", () => {
            controller.handleKeyDown(" ");
            onValueChange.mockClear();
            expect(controller.handleKeyUp(" ")).toBe(true);
            expect(onValueChange).toHaveBeenCalledWith(false);
        });
    });

    describe("Global pointer tracking", () => {
        it("sets global pointer down on handleGlobalPointerDown", () => {
            controller = new BooleanInteractionController({
                value: false,
                mode: "momentary",
                onValueChange,
            });
            controller.handleGlobalPointerDown(false);
            controller.handleMouseEnter();
            expect(onValueChange).toHaveBeenCalledWith(true);
        });

        it("resets global pointer on handleGlobalPointerUp", () => {
            controller = new BooleanInteractionController({
                value: false,
                mode: "toggle",
                onValueChange,
            });
            controller.handleGlobalPointerDown(false);
            controller.handleGlobalPointerUp();
            controller.handleMouseEnter();
            expect(onValueChange).not.toHaveBeenCalled();
        });
    });

    describe("Disabled", () => {
        beforeEach(() => {
            controller = new BooleanInteractionController({
                value: false,
                mode: "toggle",
                onValueChange,
                disabled: true,
            });
        });

        it("does nothing on mouse down when disabled", () => {
            controller.handleMouseDown(false);
            expect(onValueChange).not.toHaveBeenCalled();
        });

        it("does nothing on mouse up when disabled", () => {
            controller.updateConfig({ value: false, mode: "momentary", onValueChange, disabled: true });
            controller.handleMouseDown(false);
            onValueChange.mockClear();
            controller.handleMouseUp(false);
            expect(onValueChange).not.toHaveBeenCalled();
        });

        it("does nothing on global pointer down when disabled", () => {
            controller.handleGlobalPointerDown(false);
            controller.handleMouseEnter();
            expect(onValueChange).not.toHaveBeenCalled();
        });

        it("does nothing on mouse enter when disabled", () => {
            controller.handleGlobalPointerDown(false);
            controller.handleMouseEnter();
            expect(onValueChange).not.toHaveBeenCalled();
        });

        it("returns false from handleKeyDown when disabled", () => {
            expect(controller.handleKeyDown("Enter")).toBe(false);
            expect(onValueChange).not.toHaveBeenCalled();
        });

        it("returns false from handleKeyUp when disabled", () => {
            expect(controller.handleKeyUp("Enter")).toBe(false);
        });
    });

    describe("defaultPrevented", () => {
        beforeEach(() => {
            controller = new BooleanInteractionController({
                value: false,
                mode: "toggle",
                onValueChange,
            });
        });

        it("does nothing on mouse down when defaultPrevented", () => {
            controller.handleMouseDown(true);
            expect(onValueChange).not.toHaveBeenCalled();
        });

        it("does nothing on global pointer down when defaultPrevented", () => {
            controller.handleGlobalPointerDown(true);
            controller.handleMouseEnter();
            expect(onValueChange).not.toHaveBeenCalled();
        });
    });

    describe("updateConfig", () => {
        it("uses new config after updateConfig", () => {
            controller = new BooleanInteractionController({
                value: false,
                mode: "toggle",
                onValueChange,
            });
            controller.updateConfig({ value: false, mode: "momentary", onValueChange });
            controller.handleMouseDown(false);
            expect(onValueChange).toHaveBeenCalledWith(true);
        });
    });
});
