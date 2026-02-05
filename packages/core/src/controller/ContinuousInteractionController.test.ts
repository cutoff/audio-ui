/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ContinuousInteractionController } from "./ContinuousInteractionController";

// @vitest-environment jsdom

type TestController = ContinuousInteractionController & {
    handleGlobalMouseMove: (e: MouseEvent) => void;
    handleGlobalMouseUp: () => void;
};

describe("ContinuousInteractionController", () => {
    let controller: ContinuousInteractionController;
    let adjustValue: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        adjustValue = vi.fn();
        controller = new ContinuousInteractionController({
            adjustValue,
            sensitivity: 0.01,
            interactionMode: "both",
            direction: "vertical",
        });

        // Mock window event listeners
        vi.spyOn(window, "addEventListener");
        vi.spyOn(window, "removeEventListener");
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("Drag Interaction", () => {
        it("should not adjust value on mouse down", () => {
            controller.handleMouseDown(100, 100);
            expect(adjustValue).not.toHaveBeenCalled();
        });

        it("should adjust value on mouse move after mouse down (vertical)", () => {
            controller.handleMouseDown(100, 100);

            // Simulate global mouse move
            const moveEvent = new MouseEvent("mousemove", { clientX: 100, clientY: 90 });
            // Accessing private method for testing purpose
            (controller as unknown as TestController).handleGlobalMouseMove(moveEvent);

            // Vertical: Delta = StartY (100) - CurrentY (90) = 10
            // Adjustment = 10 * sensitivity (0.01) = 0.1
            expect(adjustValue).toHaveBeenCalledWith(10, 0.01);
        });

        it("should adjust value on mouse move after mouse down (horizontal)", () => {
            controller = new ContinuousInteractionController({
                adjustValue,
                sensitivity: 0.01,
                direction: "horizontal",
            });

            controller.handleMouseDown(100, 100);

            const moveEvent = new MouseEvent("mousemove", { clientX: 110, clientY: 100 });
            (controller as unknown as TestController).handleGlobalMouseMove(moveEvent);

            // Horizontal: Delta = CurrentX (110) - StartX (100) = 10
            expect(adjustValue).toHaveBeenCalledWith(10, 0.01);
        });

        it("should stop adjusting after mouse up", () => {
            controller.handleMouseDown(100, 100);
            (controller as unknown as TestController).handleGlobalMouseUp();

            const moveEvent = new MouseEvent("mousemove", { clientX: 100, clientY: 90 });
            (controller as unknown as TestController).handleGlobalMouseMove(moveEvent);

            expect(adjustValue).not.toHaveBeenCalled();
        });

        it("should adjust value on mouse move (both direction: Up+Right)", () => {
            controller.updateConfig({ direction: "both" });
            controller.handleMouseDown(100, 100);

            // Move Up (y: 90) and Right (x: 110)
            const moveEvent = new MouseEvent("mousemove", { clientX: 110, clientY: 90 });
            (controller as unknown as TestController).handleGlobalMouseMove(moveEvent);

            // Up: 100 - 90 = +10
            // Right: 110 - 100 = +10
            // Total: 20
            expect(adjustValue).toHaveBeenCalledWith(20, 0.01);
        });

        it("should adjust value on mouse move (both direction: Down+Left)", () => {
            controller.updateConfig({ direction: "both" });
            controller.handleMouseDown(100, 100);

            // Move Down (y: 110) and Left (x: 90)
            const moveEvent = new MouseEvent("mousemove", { clientX: 90, clientY: 110 });
            (controller as unknown as TestController).handleGlobalMouseMove(moveEvent);

            // Up: 100 - 110 = -10
            // Right: 90 - 100 = -10
            // Total: -20
            expect(adjustValue).toHaveBeenCalledWith(-20, 0.01);
        });

        it("should adjust value on mouse move (both direction: mixed cancellation)", () => {
            controller.updateConfig({ direction: "both" });
            controller.handleMouseDown(100, 100);

            // Move Up (y: 90) and Left (x: 90)
            const moveEvent = new MouseEvent("mousemove", { clientX: 90, clientY: 90 });
            (controller as unknown as TestController).handleGlobalMouseMove(moveEvent);

            // Up: 100 - 90 = +10
            // Right: 90 - 100 = -10
            // Total: 0. Delta is 0, so adjustValue should not be called.
            expect(adjustValue).not.toHaveBeenCalled();
        });

        it("should accumulate drag deltas for stepped parameters", () => {
            controller.updateConfig({ step: 0.1, sensitivity: 0.01 });
            controller.handleMouseDown(100, 100);

            // Small movement: delta = 5 pixels, normalizedDelta = 5 * 0.01 = 0.05
            // Accumulator = 0.05, which is < 0.1 (step), so no adjustment yet
            const moveEvent1 = new MouseEvent("mousemove", { clientX: 100, clientY: 95 });
            (controller as unknown as TestController).handleGlobalMouseMove(moveEvent1);
            expect(adjustValue).not.toHaveBeenCalled();

            // Another small movement: delta = 5 pixels, normalizedDelta = 0.05
            // Accumulator = 0.05 + 0.05 = 0.1, which is >= 0.1 (step)
            // stepsToMove = Math.trunc(0.1 / 0.1) = 1 step = 0.1
            const moveEvent2 = new MouseEvent("mousemove", { clientX: 100, clientY: 90 });
            (controller as unknown as TestController).handleGlobalMouseMove(moveEvent2);
            expect(adjustValue).toHaveBeenCalledWith(0.1, 1.0);
        });

        it("should reset drag accumulator on new drag start", () => {
            controller.updateConfig({ step: 0.1, sensitivity: 0.01 });
            controller.handleMouseDown(100, 100);

            // Small movement that accumulates but doesn't trigger
            const moveEvent1 = new MouseEvent("mousemove", { clientX: 100, clientY: 95 });
            (controller as unknown as TestController).handleGlobalMouseMove(moveEvent1);
            expect(adjustValue).not.toHaveBeenCalled();

            // End drag
            (controller as unknown as TestController).handleGlobalMouseUp();

            // Start new drag - accumulator should be reset
            controller.handleMouseDown(100, 100);
            const moveEvent2 = new MouseEvent("mousemove", { clientX: 100, clientY: 95 });
            (controller as unknown as TestController).handleGlobalMouseMove(moveEvent2);
            // Should still not trigger because accumulator was reset
            expect(adjustValue).not.toHaveBeenCalled();
        });
    });

    describe("Circular Interaction", () => {
        it("should calculate angle delta correctly", () => {
            controller.updateConfig({ direction: "circular" });

            // Mock element with rect at 100,100 size 100x100. Center at 150, 150.
            const target = document.createElement("div");
            target.getBoundingClientRect = vi.fn(() => ({
                left: 100,
                top: 100,
                width: 100,
                height: 100,
                right: 200,
                bottom: 200,
                x: 100,
                y: 100,
                toJSON: () => {},
            })) as unknown as () => DOMRect;

            // Start at 3 o'clock relative to center (150, 150) -> Position (200, 150)
            controller.handleMouseDown(200, 150, target);

            // Move to 6 o'clock -> Position (150, 200)
            // 3 o'clock is 0 rads. 6 o'clock is PI/2 rads.
            // Delta is +PI/2 rads = +90 degrees.
            // Value change = 90 * sensitivity (0.01) = 0.9

            const moveEvent = new MouseEvent("mousemove", { clientX: 150, clientY: 200 });
            (controller as unknown as TestController).handleGlobalMouseMove(moveEvent);

            // Allow for small floating point differences
            expect(adjustValue).toHaveBeenCalled();
            const args = adjustValue.mock.calls[0];
            expect(args[0]).toBeCloseTo(90, 1);
            expect(args[1]).toBe(0.01);
        });

        it("should handle wrapping around PI (Left side crossing)", () => {
            controller.updateConfig({ direction: "circular" });
            const target = document.createElement("div");
            target.getBoundingClientRect = vi.fn(() => ({
                left: 100,
                top: 100,
                width: 100,
                height: 100,
                right: 200,
                bottom: 200,
                x: 100,
                y: 100,
                toJSON: () => {},
            })) as unknown as () => DOMRect;
            // Center 150, 150

            // Start at slightly Up-Left (Angle approx -3.12 rads / -179 deg)
            // dx = -50, dy = -1.
            controller.handleMouseDown(100, 149, target);

            // Move to slightly Down-Left (Angle approx +3.12 rads / +179 deg)
            // dx = -50, dy = 1.
            const moveEvent = new MouseEvent("mousemove", { clientX: 100, clientY: 151 });
            (controller as unknown as TestController).handleGlobalMouseMove(moveEvent);

            // Movement is CCW (Up-Left to Down-Left on the left edge).
            // Expect negative delta.
            // Delta Rads: 3.12 - (-3.12) = 6.24.
            // Wrap: 6.24 > PI. 6.24 - 2PI = -0.04 rads.
            // Degrees: -0.04 * 180/PI approx -2.3 degrees.

            expect(adjustValue).toHaveBeenCalled();
            const delta = adjustValue.mock.calls[0][0];
            expect(delta).toBeLessThan(0); // Should be negative
            expect(Math.abs(delta)).toBeLessThan(5); // Should be small
        });
    });

    describe("Wheel Interaction", () => {
        it("should adjust value on wheel", () => {
            const wheelEvent = {
                preventDefault: vi.fn(),
                stopPropagation: vi.fn(),
                deltaY: -100,
            } as unknown as WheelEvent;

            controller.handleWheel(wheelEvent);

            // Default wheel sensitivity is DEFAULT_WHEEL_SENSITIVITY = 0.005
            expect(adjustValue).toHaveBeenCalledWith(-100, 0.005);
            expect(wheelEvent.preventDefault).toHaveBeenCalled();
        });

        it("should ignore wheel if mode is drag", () => {
            controller.updateConfig({ interactionMode: "drag" });
            const wheelEvent = {
                preventDefault: vi.fn(),
                stopPropagation: vi.fn(),
                deltaY: -100,
            } as unknown as WheelEvent;

            controller.handleWheel(wheelEvent);
            expect(adjustValue).not.toHaveBeenCalled();
        });

        it("should accumulate wheel deltas for stepped parameters", () => {
            controller.updateConfig({ step: 0.1, wheelSensitivity: 0.01 });
            const wheelEvent = {
                preventDefault: vi.fn(),
                stopPropagation: vi.fn(),
                deltaY: 5, // Small delta: 5 * 0.01 = 0.05
            } as unknown as WheelEvent;

            // First wheel event: 5 * 0.01 = 0.05, accumulator = 0.05 < 0.1, so no trigger
            controller.handleWheel(wheelEvent);
            expect(adjustValue).not.toHaveBeenCalled();

            // Second wheel event: accumulator = 0.05 + 0.05 = 0.1, which is >= 0.1
            // stepsToMove = Math.trunc(0.1 / 0.1) = 1 step = 0.1
            controller.handleWheel(wheelEvent);
            expect(adjustValue).toHaveBeenCalledWith(0.1, 1.0);
        });

        it("should handle wheel accumulator remainder correctly", () => {
            controller.updateConfig({ step: 0.1, wheelSensitivity: 0.01 });
            const wheelEvent = {
                preventDefault: vi.fn(),
                stopPropagation: vi.fn(),
                deltaY: 50, // 50 * 0.01 = 0.5
            } as unknown as WheelEvent;

            // First event: accumulator = 0.5, which is >= 0.1
            // stepsToMove = Math.trunc(0.5 / 0.1) = 5 steps = 0.5
            controller.handleWheel(wheelEvent);
            expect(adjustValue).toHaveBeenCalledWith(0.5, 1.0);
            adjustValue.mockClear();

            // Accumulator should now be 0.5 - 0.5 = 0.0
            // Second event: accumulator = 0.0 + 0.5 = 0.5 again
            // stepsToMove = Math.trunc(0.5 / 0.1) = 5 steps = 0.5
            controller.handleWheel(wheelEvent);
            expect(adjustValue).toHaveBeenCalledWith(0.5, 1.0);
        });
    });

    describe("Keyboard Interaction", () => {
        it("should increment on ArrowUp", () => {
            const keyEvent = {
                key: "ArrowUp",
                preventDefault: vi.fn(),
            } as unknown as KeyboardEvent;

            controller.handleKeyDown(keyEvent);

            // Delta 1. Keyboard step default 0.05. Sensitivity 0.01.
            // passed_delta = 1 * (0.05 / 0.01) = 5
            expect(adjustValue).toHaveBeenCalledWith(5, 0.01);
        });

        it("should decrement on ArrowDown", () => {
            const keyEvent = {
                key: "ArrowDown",
                preventDefault: vi.fn(),
            } as unknown as KeyboardEvent;

            controller.handleKeyDown(keyEvent);

            // Delta -1.
            expect(adjustValue).toHaveBeenCalledWith(-5, 0.01);
        });
    });

    describe("Callbacks", () => {
        it("should call onDragStart when drag starts", () => {
            const onDragStart = vi.fn();
            controller.updateConfig({ onDragStart });
            controller.handleMouseDown(100, 100);
            expect(onDragStart).toHaveBeenCalled();
        });

        it("should call onDragEnd when drag ends", () => {
            const onDragEnd = vi.fn();
            controller.updateConfig({ onDragEnd });
            controller.handleMouseDown(100, 100);
            (controller as unknown as TestController).handleGlobalMouseUp();
            expect(onDragEnd).toHaveBeenCalled();
        });
    });
});
