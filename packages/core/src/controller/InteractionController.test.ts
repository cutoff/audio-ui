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
            // We need to access private method or trigger the listener.
            // Since we mock window.addEventListener, we can't easily trigger the real event flow unless we attach it to a real window (jsdom).
            // However, InteractionController binds handleGlobalMouseMove.
            // Let's test the public API if possible or cast to any to access private methods for unit testing.

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
