import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, fireEvent } from "@testing-library/react";
import { useInteractiveControl } from "./useInteractiveControl";

describe("useInteractiveControl", () => {
    const adjustValue = vi.fn();

    beforeEach(() => {
        adjustValue.mockClear();
        // Reset body styles
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
    });

    it("initializes with correct accessibility attributes", () => {
        const { result } = renderHook(() => useInteractiveControl({ adjustValue }));

        expect(result.current.role).toBe("slider");
        expect(result.current.tabIndex).toBe(0);
        expect(result.current["aria-disabled"]).toBe(false);
        expect(result.current.style?.cursor).toBe("ns-resize");
    });

    it("handles disabled state correctly", () => {
        const { result } = renderHook(() => useInteractiveControl({ adjustValue, disabled: true }));

        expect(result.current.tabIndex).toBe(-1);
        expect(result.current["aria-disabled"]).toBe(true);
        expect(result.current.style?.cursor).toBe("not-allowed");

        // Attempt interactions
        act(() => {
            // @ts-ignore - simulating event
            result.current.onMouseDown({ clientX: 0, clientY: 0 } as any);
            // @ts-ignore
            result.current.onKeyDown({ key: "ArrowUp", preventDefault: vi.fn() } as any);
            // @ts-ignore
            result.current.onWheel({ deltaY: 100, preventDefault: vi.fn(), stopPropagation: vi.fn() } as any);
        });

        expect(adjustValue).not.toHaveBeenCalled();
    });

    it("handles non-editable state correctly (no onChange)", () => {
        const { result } = renderHook(() => useInteractiveControl({ adjustValue, editable: false }));

        expect(result.current.style?.cursor).toBe("default");
    });

    it("handles editable state correctly (with onChange)", () => {
        const { result } = renderHook(() => useInteractiveControl({ adjustValue, editable: true }));

        expect(result.current.style?.cursor).toBe("ns-resize");
    });

    describe("Drag Interaction", () => {
        it("handles vertical drag (default)", () => {
            const { result } = renderHook(() => useInteractiveControl({ adjustValue, sensitivity: 0.1 }));

            // 1. Mouse Down
            act(() => {
                // @ts-ignore
                result.current.onMouseDown({ clientX: 100, clientY: 100 } as any);
            });

            // Verify global state changes
            expect(document.body.style.userSelect).toBe("none");
            expect(document.body.style.cursor).toBe("ns-resize");

            // 2. Mouse Move (Global)
            // Move UP by 10 pixels.
            // Logic: delta = startY - currentY = 100 - 90 = 10 (Positive change)
            fireEvent.mouseMove(window, { clientX: 100, clientY: 90 });

            expect(adjustValue).toHaveBeenCalledWith(10, 0.1);

            // 3. Mouse Up (Global)
            fireEvent.mouseUp(window);

            // Verify cleanup
            expect(document.body.style.userSelect).toBe("");
            expect(document.body.style.cursor).toBe("");
            adjustValue.mockClear();

            // 4. Move after cleanup should do nothing
            fireEvent.mouseMove(window, { clientX: 100, clientY: 80 });
            expect(adjustValue).not.toHaveBeenCalled();
        });

        it("handles horizontal drag", () => {
            const { result } = renderHook(() =>
                useInteractiveControl({
                    adjustValue,
                    direction: "horizontal",
                    sensitivity: 0.1,
                })
            );

            act(() => {
                // @ts-ignore
                result.current.onMouseDown({ clientX: 100, clientY: 100 } as any);
            });

            expect(document.body.style.cursor).toBe("ew-resize");

            // Move RIGHT by 10 pixels
            // Logic: delta = currentX - startX = 110 - 100 = 10
            fireEvent.mouseMove(window, { clientX: 110, clientY: 100 });

            expect(adjustValue).toHaveBeenCalledWith(10, 0.1);
        });

        it("respects interactionMode='wheel' (disabling drag)", () => {
            const { result } = renderHook(() => useInteractiveControl({ adjustValue, interactionMode: "wheel" }));

            act(() => {
                // @ts-ignore
                result.current.onMouseDown({ clientX: 0, clientY: 0 } as any);
            });

            // Should not attach listeners or change cursor
            expect(document.body.style.userSelect).toBe("");
            fireEvent.mouseMove(window, { clientX: 10, clientY: 10 });
            expect(adjustValue).not.toHaveBeenCalled();
        });
    });

    describe("Wheel Interaction", () => {
        it("handles wheel events", () => {
            const { result } = renderHook(() => useInteractiveControl({ adjustValue, sensitivity: 0.01 }));

            const preventDefault = vi.fn();
            const stopPropagation = vi.fn();

            act(() => {
                // @ts-ignore
                result.current.onWheel({
                    deltaY: 100, // Down scroll
                    preventDefault,
                    stopPropagation,
                } as any);
            });

            expect(preventDefault).toHaveBeenCalled();
            expect(stopPropagation).toHaveBeenCalled();

            // Default wheel sensitivity is sensitivity / 4 => 0.01 / 4 = 0.0025
            expect(adjustValue).toHaveBeenCalledWith(100, 0.0025);
        });

        it("uses provided wheelSensitivity", () => {
            const { result } = renderHook(() =>
                useInteractiveControl({
                    adjustValue,
                    sensitivity: 0.01,
                    wheelSensitivity: 0.05,
                })
            );

            act(() => {
                // @ts-ignore
                result.current.onWheel({
                    deltaY: 100,
                    preventDefault: vi.fn(),
                    stopPropagation: vi.fn(),
                } as any);
            });

            expect(adjustValue).toHaveBeenCalledWith(100, 0.05);
        });
    });

    describe("Keyboard Interaction", () => {
        it("handles Arrow keys", () => {
            const { result } = renderHook(() =>
                useInteractiveControl({ adjustValue, sensitivity: 0.01, keyboardStep: 0.1 })
            );

            const preventDefault = vi.fn();

            // Arrow Up
            act(() => {
                // @ts-ignore
                result.current.onKeyDown({ key: "ArrowUp", preventDefault } as any);
            });
            expect(preventDefault).toHaveBeenCalled();
            // effectiveDelta = delta (1) * (keyboardStep (0.1) / sensitivity (0.01)) = 10
            // adjustValue(effectiveDelta, sensitivity) -> 10 * 0.01 = 0.1 (Target change)
            expect(adjustValue).toHaveBeenLastCalledWith(10, 0.01);

            // Arrow Down
            act(() => {
                // @ts-ignore
                result.current.onKeyDown({ key: "ArrowDown", preventDefault } as any);
            });
            expect(adjustValue).toHaveBeenLastCalledWith(-10, 0.01);
        });

        it("handles Home/End keys", () => {
            const { result } = renderHook(() => useInteractiveControl({ adjustValue, sensitivity: 0.01 }));

            act(() => {
                // @ts-ignore
                result.current.onKeyDown({ key: "Home", preventDefault: vi.fn() } as any);
            });
            // Home logic: delta = -1/sensitivity => -100
            // But passed through effectiveDelta = delta * (keyboardStep / sensitivity)
            // effectiveDelta = -100 * (0.05 / 0.01) = -500
            expect(adjustValue).toHaveBeenLastCalledWith(-500, 0.01);

            act(() => {
                // @ts-ignore
                result.current.onKeyDown({ key: "End", preventDefault: vi.fn() } as any);
            });
            // End logic: delta = 1/sensitivity => 100
            // effectiveDelta = 100 * 5 = 500
            expect(adjustValue).toHaveBeenLastCalledWith(500, 0.01);
        });
    });
});
