import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { InteractionController } from "./InteractionController";

// @vitest-environment jsdom

describe("InteractionController", () => {
    let controller: InteractionController;
    let adjustValue: any;

    beforeEach(() => {
        adjustValue = vi.fn();
        controller = new InteractionController({
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
            (controller as any).handleGlobalMouseMove(moveEvent);

            // Vertical: Delta = StartY (100) - CurrentY (90) = 10
            // Adjustment = 10 * sensitivity (0.01) = 0.1
            expect(adjustValue).toHaveBeenCalledWith(10, 0.01);
        });

        it("should adjust value on mouse move after mouse down (horizontal)", () => {
            controller = new InteractionController({
                adjustValue,
                sensitivity: 0.01,
                direction: "horizontal",
            });

            controller.handleMouseDown(100, 100);

            const moveEvent = new MouseEvent("mousemove", { clientX: 110, clientY: 100 });
            (controller as any).handleGlobalMouseMove(moveEvent);

            // Horizontal: Delta = CurrentX (110) - StartX (100) = 10
            expect(adjustValue).toHaveBeenCalledWith(10, 0.01);
        });

        it("should stop adjusting after mouse up", () => {
            controller.handleMouseDown(100, 100);
            (controller as any).handleGlobalMouseUp();

            const moveEvent = new MouseEvent("mousemove", { clientX: 100, clientY: 90 });
            (controller as any).handleGlobalMouseMove(moveEvent);

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
            })) as any;

            // Start at 3 o'clock relative to center (150, 150) -> Position (200, 150)
            controller.handleMouseDown(200, 150, target);

            // Move to 6 o'clock -> Position (150, 200)
            // 3 o'clock is 0 rads. 6 o'clock is PI/2 rads.
            // Delta is +PI/2 rads = +90 degrees.
            // Value change = 90 * sensitivity (0.01) = 0.9

            const moveEvent = new MouseEvent("mousemove", { clientX: 150, clientY: 200 });
            (controller as any).handleGlobalMouseMove(moveEvent);

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
            })) as any;
            // Center 150, 150

            // Start at slightly Up-Left (Angle approx -3.12 rads / -179 deg)
            // dx = -50, dy = -1.
            controller.handleMouseDown(100, 149, target);

            // Move to slightly Down-Left (Angle approx +3.12 rads / +179 deg)
            // dx = -50, dy = 1.
            const moveEvent = new MouseEvent("mousemove", { clientX: 100, clientY: 151 });
            (controller as any).handleGlobalMouseMove(moveEvent);

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

            // Default wheel sensitivity is sensitivity / 4 = 0.0025
            expect(adjustValue).toHaveBeenCalledWith(-100, 0.0025);
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
});
