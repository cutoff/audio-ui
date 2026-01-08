/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

// @vitest-environment jsdom

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, fireEvent } from "@testing-library/react";
import { useContinuousInteraction } from "./useContinuousInteraction";

describe("useContinuousInteraction", () => {
    const adjustValue = vi.fn();

    beforeEach(() => {
        adjustValue.mockClear();
        // Reset body styles
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
    });

    it("initializes with correct accessibility attributes", () => {
        const { result } = renderHook(() => useContinuousInteraction({ adjustValue }));

        expect(result.current.role).toBe("slider");
        expect(result.current.tabIndex).toBe(0);
        expect(result.current["aria-disabled"]).toBe(false);
        // Default direction is "both", which gives "move" cursor
        expect(result.current.style?.cursor).toBe("move");
    });

    it("handles disabled state correctly", () => {
        const { result } = renderHook(() => useContinuousInteraction({ adjustValue, disabled: true }));

        expect(result.current.tabIndex).toBe(-1);
        expect(result.current["aria-disabled"]).toBe(true);
        expect(result.current.style?.cursor).toBe("not-allowed");

        // Attempt interactions
        act(() => {
            // @ts-expect-error - simulating event
            result.current.onMouseDown({ clientX: 0, clientY: 0 });
            // @ts-expect-error - simulating event
            result.current.onKeyDown({ key: "ArrowUp", preventDefault: vi.fn() });
            // @ts-expect-error - simulating event
            result.current.onWheel({ deltaY: 100, preventDefault: vi.fn(), stopPropagation: vi.fn() });
        });

        expect(adjustValue).not.toHaveBeenCalled();
    });

    it("handles non-editable state correctly (no onChange)", () => {
        const { result } = renderHook(() => useContinuousInteraction({ adjustValue, editable: false }));

        expect(result.current.style?.cursor).toBe("default");
    });

    it("handles editable state correctly (with onChange)", () => {
        const { result } = renderHook(() => useContinuousInteraction({ adjustValue, editable: true }));

        // Default direction is "both", which gives "move" cursor
        expect(result.current.style?.cursor).toBe("move");
    });

    describe("Drag Interaction", () => {
        it("handles vertical drag (default)", () => {
            const { result } = renderHook(() => useContinuousInteraction({ adjustValue, sensitivity: 0.1 }));

            // 1. Mouse Down
            act(() => {
                // @ts-expect-error - simulating event
                result.current.onMouseDown({ clientX: 100, clientY: 100 });
            });

            // Verify global state changes
            expect(document.body.style.userSelect).toBe("none");
            // Default direction is "both", which gives "move" cursor
            expect(document.body.style.cursor).toBe("move");

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
                useContinuousInteraction({
                    adjustValue,
                    direction: "horizontal",
                    sensitivity: 0.1,
                })
            );

            act(() => {
                // @ts-expect-error - simulating event
                result.current.onMouseDown({ clientX: 100, clientY: 100 });
            });

            expect(document.body.style.cursor).toBe("ew-resize");

            // Move RIGHT by 10 pixels
            // Logic: delta = currentX - startX = 110 - 100 = 10
            fireEvent.mouseMove(window, { clientX: 110, clientY: 100 });

            expect(adjustValue).toHaveBeenCalledWith(10, 0.1);
        });

        it("respects interactionMode='wheel' (disabling drag)", () => {
            const { result } = renderHook(() => useContinuousInteraction({ adjustValue, interactionMode: "wheel" }));

            act(() => {
                // @ts-expect-error - simulating event
                result.current.onMouseDown({ clientX: 0, clientY: 0 });
            });

            // Should not attach listeners or change cursor
            expect(document.body.style.userSelect).toBe("");
            fireEvent.mouseMove(window, { clientX: 10, clientY: 10 });
            expect(adjustValue).not.toHaveBeenCalled();
        });
    });

    describe("Wheel Interaction", () => {
        it("handles wheel events", () => {
            const { result } = renderHook(() => useContinuousInteraction({ adjustValue, sensitivity: 0.01 }));

            const preventDefault = vi.fn();
            const stopPropagation = vi.fn();

            act(() => {
                // @ts-expect-error - simulating event
                result.current.onWheel({
                    deltaY: 100, // Down scroll
                    preventDefault,
                    stopPropagation,
                });
            });

            expect(preventDefault).toHaveBeenCalled();
            expect(stopPropagation).toHaveBeenCalled();

            // Default wheel sensitivity is sensitivity / 4 => 0.01 / 4 = 0.0025
            expect(adjustValue).toHaveBeenCalledWith(100, 0.0025);
        });

        it("uses provided wheelSensitivity", () => {
            const { result } = renderHook(() =>
                useContinuousInteraction({
                    adjustValue,
                    sensitivity: 0.01,
                    wheelSensitivity: 0.05,
                })
            );

            act(() => {
                // @ts-expect-error - simulating event
                result.current.onWheel({
                    deltaY: 100,
                    preventDefault: vi.fn(),
                    stopPropagation: vi.fn(),
                });
            });

            expect(adjustValue).toHaveBeenCalledWith(100, 0.05);
        });
    });

    describe("Keyboard Interaction", () => {
        it("handles Arrow keys", () => {
            const { result } = renderHook(() =>
                useContinuousInteraction({ adjustValue, sensitivity: 0.01, keyboardStep: 0.1 })
            );

            const preventDefault = vi.fn();

            // Arrow Up
            act(() => {
                // @ts-expect-error - simulating event
                result.current.onKeyDown({ key: "ArrowUp", preventDefault });
            });
            expect(preventDefault).toHaveBeenCalled();
            // effectiveDelta = delta (1) * (keyboardStep (0.1) / sensitivity (0.01)) = 10
            // adjustValue(effectiveDelta, sensitivity) -> 10 * 0.01 = 0.1 (Target change)
            expect(adjustValue).toHaveBeenLastCalledWith(10, 0.01);

            // Arrow Down
            act(() => {
                // @ts-expect-error - simulating event
                result.current.onKeyDown({ key: "ArrowDown", preventDefault });
            });
            expect(adjustValue).toHaveBeenLastCalledWith(-10, 0.01);
        });

        it("handles Home/End keys", () => {
            const { result } = renderHook(() => useContinuousInteraction({ adjustValue, sensitivity: 0.01 }));

            act(() => {
                // @ts-expect-error - simulating event
                result.current.onKeyDown({ key: "Home", preventDefault: vi.fn() });
            });
            // Home logic: delta = -1/sensitivity => -100
            // But passed through effectiveDelta = delta * (keyboardStep / sensitivity)
            // effectiveDelta = -100 * (0.05 / 0.01) = -500
            expect(adjustValue).toHaveBeenLastCalledWith(-500, 0.01);

            act(() => {
                // @ts-expect-error - simulating event
                result.current.onKeyDown({ key: "End", preventDefault: vi.fn() });
            });
            // End logic: delta = 1/sensitivity => 100
            // effectiveDelta = 100 * 5 = 500
            expect(adjustValue).toHaveBeenLastCalledWith(500, 0.01);
        });
    });

    describe("User Handler Composition", () => {
        describe("onMouseDown", () => {
            it("calls user-provided onMouseDown handler before hook handler", () => {
                const userOnMouseDown = vi.fn();
                const { result } = renderHook(() =>
                    useContinuousInteraction({
                        adjustValue,
                        onMouseDown: userOnMouseDown,
                    })
                );

                const mockEvent = {
                    clientX: 100,
                    clientY: 100,
                    currentTarget: document.createElement("div"),
                    defaultPrevented: false,
                } as React.MouseEvent;

                act(() => {
                    result.current.onMouseDown(mockEvent);
                });

                expect(userOnMouseDown).toHaveBeenCalledWith(mockEvent);
                expect(userOnMouseDown).toHaveBeenCalledTimes(1);
                // Verify hook handler was also called (adjustValue should be called during drag)
            });

            it("respects defaultPrevented from user onMouseDown handler", () => {
                const userOnMouseDown = vi.fn((e: React.MouseEvent) => {
                    e.preventDefault();
                });
                const { result } = renderHook(() =>
                    useContinuousInteraction({
                        adjustValue,
                        onMouseDown: userOnMouseDown,
                    })
                );

                const preventDefault = vi.fn(() => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (mockEvent as any).defaultPrevented = true;
                });
                const mockEvent = {
                    clientX: 100,
                    clientY: 100,
                    currentTarget: document.createElement("div"),
                    defaultPrevented: false,
                    preventDefault,
                } as unknown as React.MouseEvent;

                act(() => {
                    result.current.onMouseDown(mockEvent);
                });

                expect(userOnMouseDown).toHaveBeenCalled();
                expect(document.body.style.userSelect).toBe("");
            });
        });

        describe("onWheel", () => {
            it("calls user-provided onWheel handler before hook handler", () => {
                const userOnWheel = vi.fn();
                const { result } = renderHook(() =>
                    useContinuousInteraction({
                        adjustValue,
                        onWheel: userOnWheel,
                    })
                );

                const preventDefault = vi.fn();
                const stopPropagation = vi.fn();
                const mockEvent = {
                    deltaY: 100,
                    preventDefault,
                    stopPropagation,
                    defaultPrevented: false,
                } as React.WheelEvent;

                act(() => {
                    result.current.onWheel(mockEvent);
                });

                expect(userOnWheel).toHaveBeenCalledWith(mockEvent);
                expect(userOnWheel).toHaveBeenCalledTimes(1);
                expect(adjustValue).toHaveBeenCalled();
            });

            it("respects defaultPrevented from user onWheel handler", () => {
                const userOnWheel = vi.fn((e: React.WheelEvent) => {
                    e.preventDefault();
                });
                const { result } = renderHook(() =>
                    useContinuousInteraction({
                        adjustValue,
                        onWheel: userOnWheel,
                    })
                );

                const preventDefault = vi.fn(() => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (mockEvent as any).defaultPrevented = true;
                });
                const mockEvent = {
                    deltaY: 100,
                    preventDefault,
                    stopPropagation: vi.fn(),
                    defaultPrevented: false,
                } as unknown as React.WheelEvent;

                act(() => {
                    result.current.onWheel(mockEvent);
                });

                expect(userOnWheel).toHaveBeenCalled();
                expect(adjustValue).not.toHaveBeenCalled();
            });
        });

        describe("onKeyDown", () => {
            it("calls user-provided onKeyDown handler before hook handler", () => {
                const userOnKeyDown = vi.fn();
                const { result } = renderHook(() =>
                    useContinuousInteraction({
                        adjustValue,
                        onKeyDown: userOnKeyDown,
                    })
                );

                const preventDefault = vi.fn();
                const mockEvent = {
                    key: "ArrowUp",
                    preventDefault,
                    defaultPrevented: false,
                } as React.KeyboardEvent;

                act(() => {
                    result.current.onKeyDown(mockEvent);
                });

                expect(userOnKeyDown).toHaveBeenCalledWith(mockEvent);
                expect(userOnKeyDown).toHaveBeenCalledTimes(1);
                expect(adjustValue).toHaveBeenCalled();
            });

            it("respects defaultPrevented from user onKeyDown handler", () => {
                const userOnKeyDown = vi.fn((e: React.KeyboardEvent) => {
                    e.preventDefault();
                });
                const { result } = renderHook(() =>
                    useContinuousInteraction({
                        adjustValue,
                        onKeyDown: userOnKeyDown,
                    })
                );

                const preventDefault = vi.fn(() => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (mockEvent as any).defaultPrevented = true;
                });
                const mockEvent = {
                    key: "ArrowUp",
                    preventDefault,
                    defaultPrevented: false,
                } as unknown as React.KeyboardEvent;

                act(() => {
                    result.current.onKeyDown(mockEvent);
                });

                expect(userOnKeyDown).toHaveBeenCalled();
                expect(adjustValue).not.toHaveBeenCalled();
            });
        });

        describe("onTouchStart", () => {
            it("calls user-provided onTouchStart handler before hook handler", () => {
                const userOnTouchStart = vi.fn();
                const { result } = renderHook(() =>
                    useContinuousInteraction({
                        adjustValue,
                        onTouchStart: userOnTouchStart,
                    })
                );

                const mockTouch = {
                    clientX: 100,
                    clientY: 100,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any;
                const mockEvent = {
                    touches: [mockTouch],
                    currentTarget: document.createElement("div"),
                    defaultPrevented: false,
                } as React.TouchEvent;

                act(() => {
                    result.current.onTouchStart(mockEvent);
                });

                expect(userOnTouchStart).toHaveBeenCalledWith(mockEvent);
            });

            it("respects defaultPrevented from user onTouchStart handler", () => {
                const userOnTouchStart = vi.fn((e: React.TouchEvent) => {
                    e.preventDefault();
                });
                const { result } = renderHook(() =>
                    useContinuousInteraction({
                        adjustValue,
                        onTouchStart: userOnTouchStart,
                    })
                );

                const preventDefault = vi.fn(() => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (mockEvent as any).defaultPrevented = true;
                });
                const mockEvent = {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    touches: [{ clientX: 100, clientY: 100 } as any],
                    currentTarget: document.createElement("div"),
                    defaultPrevented: false,
                    preventDefault,
                } as unknown as React.TouchEvent;

                act(() => {
                    result.current.onTouchStart(mockEvent);
                });

                expect(userOnTouchStart).toHaveBeenCalled();
                expect(document.body.style.userSelect).toBe("");
            });
        });
    });
});
