/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

// @vitest-environment jsdom

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBooleanInteraction } from "./useBooleanInteraction";

describe("useBooleanInteraction", () => {
    const onValueChange = vi.fn();

    beforeEach(() => {
        onValueChange.mockClear();
    });

    describe("Initialization", () => {
        it("returns all required handlers", () => {
            const { result } = renderHook(() =>
                useBooleanInteraction({
                    value: false,
                    mode: "toggle",
                    onValueChange,
                })
            );

            expect(result.current).toHaveProperty("handleMouseDown");
            expect(result.current).toHaveProperty("handleMouseUp");
            expect(result.current).toHaveProperty("handleTouchStart");
            expect(result.current).toHaveProperty("handleTouchEnd");
            expect(result.current).toHaveProperty("handleKeyDown");
            expect(result.current).toHaveProperty("handleKeyUp");
            expect(typeof result.current.handleMouseDown).toBe("function");
            expect(typeof result.current.handleMouseUp).toBe("function");
            expect(typeof result.current.handleTouchStart).toBe("function");
            expect(typeof result.current.handleTouchEnd).toBe("function");
            expect(typeof result.current.handleKeyDown).toBe("function");
            expect(typeof result.current.handleKeyUp).toBe("function");
        });
    });

    describe("Toggle Mode", () => {
        it("toggles value on mouse down", () => {
            const { result } = renderHook(() =>
                useBooleanInteraction({
                    value: false,
                    mode: "toggle",
                    onValueChange,
                })
            );

            act(() => {
                result.current.handleMouseDown({
                    defaultPrevented: false,
                } as React.MouseEvent);
            });

            expect(onValueChange).toHaveBeenCalledWith(true);
        });

        it("toggles value on Space key", () => {
            const { result } = renderHook(() =>
                useBooleanInteraction({
                    value: false,
                    mode: "toggle",
                    onValueChange,
                })
            );

            const preventDefault = vi.fn();

            act(() => {
                result.current.handleKeyDown({
                    key: " ",
                    preventDefault,
                } as React.KeyboardEvent);
            });

            expect(preventDefault).toHaveBeenCalled();
            expect(onValueChange).toHaveBeenCalledWith(true);
        });

        it("toggles value on Enter key", () => {
            const { result } = renderHook(() =>
                useBooleanInteraction({
                    value: false,
                    mode: "toggle",
                    onValueChange,
                })
            );

            const preventDefault = vi.fn();

            act(() => {
                result.current.handleKeyDown({
                    key: "Enter",
                    preventDefault,
                } as React.KeyboardEvent);
            });

            expect(preventDefault).toHaveBeenCalled();
            expect(onValueChange).toHaveBeenCalledWith(true);
        });

        it("toggles value on touch start", () => {
            const { result } = renderHook(() =>
                useBooleanInteraction({
                    value: false,
                    mode: "toggle",
                    onValueChange,
                })
            );

            const preventDefault = vi.fn();
            const mockTouchEvent = {
                defaultPrevented: false,
                preventDefault,
                touches: [{ clientX: 0, clientY: 0 }],
            } as unknown as React.TouchEvent;

            act(() => {
                result.current.handleTouchStart(mockTouchEvent);
            });

            expect(preventDefault).toHaveBeenCalled();
            expect(onValueChange).toHaveBeenCalledWith(true);
        });
    });

    describe("Momentary Mode", () => {
        it("activates on mouse down and deactivates on mouse up", () => {
            const { result } = renderHook(() =>
                useBooleanInteraction({
                    value: false,
                    mode: "momentary",
                    onValueChange,
                })
            );

            act(() => {
                result.current.handleMouseDown({
                    defaultPrevented: false,
                } as React.MouseEvent);
            });

            expect(onValueChange).toHaveBeenCalledWith(true);
            onValueChange.mockClear();

            act(() => {
                result.current.handleMouseUp({
                    defaultPrevented: false,
                } as React.MouseEvent);
            });

            expect(onValueChange).toHaveBeenCalledWith(false);
        });

        it("activates on Space key down and deactivates on key up", () => {
            const { result } = renderHook(() =>
                useBooleanInteraction({
                    value: false,
                    mode: "momentary",
                    onValueChange,
                })
            );

            const preventDefault = vi.fn();

            act(() => {
                result.current.handleKeyDown({
                    key: " ",
                    preventDefault,
                } as React.KeyboardEvent);
            });

            expect(preventDefault).toHaveBeenCalled();
            expect(onValueChange).toHaveBeenCalledWith(true);
            onValueChange.mockClear();

            act(() => {
                result.current.handleKeyUp({
                    key: " ",
                    preventDefault,
                } as React.KeyboardEvent);
            });

            expect(preventDefault).toHaveBeenCalled();
            expect(onValueChange).toHaveBeenCalledWith(false);
        });

        it("deactivates on global mouse up when mouse leaves button", () => {
            const { result } = renderHook(() =>
                useBooleanInteraction({
                    value: false,
                    mode: "momentary",
                    onValueChange,
                })
            );

            // Activate button
            act(() => {
                result.current.handleMouseDown({
                    defaultPrevented: false,
                } as React.MouseEvent);
            });

            expect(onValueChange).toHaveBeenCalledWith(true);
            onValueChange.mockClear();

            // Simulate global mouse up (mouse moved outside button)
            act(() => {
                const mouseUpEvent = new MouseEvent("mouseup", { bubbles: true });
                window.dispatchEvent(mouseUpEvent);
            });

            // Verify button deactivates via global mouseup handler
            expect(onValueChange).toHaveBeenCalledWith(false);
        });

        it("activates on touch start and deactivates on touch end", () => {
            const { result } = renderHook(() =>
                useBooleanInteraction({
                    value: false,
                    mode: "momentary",
                    onValueChange,
                })
            );

            const preventDefault = vi.fn();
            const mockTouchEvent = {
                defaultPrevented: false,
                preventDefault,
                touches: [{ clientX: 0, clientY: 0 }],
            } as unknown as React.TouchEvent;

            act(() => {
                result.current.handleTouchStart(mockTouchEvent);
            });

            expect(preventDefault).toHaveBeenCalled();
            expect(onValueChange).toHaveBeenCalledWith(true);
            onValueChange.mockClear();

            act(() => {
                result.current.handleTouchEnd(mockTouchEvent);
            });

            expect(preventDefault).toHaveBeenCalled();
            expect(onValueChange).toHaveBeenCalledWith(false);
        });

        it("deactivates on global touch end when touch leaves button", () => {
            const { result } = renderHook(() =>
                useBooleanInteraction({
                    value: false,
                    mode: "momentary",
                    onValueChange,
                })
            );

            const preventDefault = vi.fn();
            const mockTouchEvent = {
                defaultPrevented: false,
                preventDefault,
                touches: [{ clientX: 0, clientY: 0 }],
            } as unknown as React.TouchEvent;

            // Activate button
            act(() => {
                result.current.handleTouchStart(mockTouchEvent);
            });

            expect(onValueChange).toHaveBeenCalledWith(true);
            onValueChange.mockClear();

            // Simulate global touch end (touch moved outside button)
            act(() => {
                const touchEndEvent = new TouchEvent("touchend", { bubbles: true });
                window.dispatchEvent(touchEndEvent);
            });

            // Verify button deactivates via global touchend handler
            expect(onValueChange).toHaveBeenCalledWith(false);
        });
    });

    describe("Disabled State", () => {
        it("does nothing when disabled", () => {
            const { result } = renderHook(() =>
                useBooleanInteraction({
                    value: false,
                    mode: "toggle",
                    onValueChange,
                    disabled: true,
                })
            );

            act(() => {
                result.current.handleMouseDown({
                    defaultPrevented: false,
                } as React.MouseEvent);
            });

            expect(onValueChange).not.toHaveBeenCalled();
        });
    });

    describe("User Handler Composition", () => {
        describe("onMouseDown", () => {
            it("calls user-provided onMouseDown handler before hook handler", () => {
                const userOnMouseDown = vi.fn();
                const { result } = renderHook(() =>
                    useBooleanInteraction({
                        value: false,
                        mode: "toggle",
                        onValueChange,
                        onMouseDown: userOnMouseDown,
                    })
                );

                const mockEvent = {
                    defaultPrevented: false,
                } as React.MouseEvent;

                act(() => {
                    result.current.handleMouseDown(mockEvent);
                });

                expect(userOnMouseDown).toHaveBeenCalledWith(mockEvent);
                expect(userOnMouseDown).toHaveBeenCalledTimes(1);
                expect(onValueChange).toHaveBeenCalledWith(true);
            });

            it("respects defaultPrevented from user onMouseDown handler", () => {
                const userOnMouseDown = vi.fn((e: React.MouseEvent) => {
                    e.preventDefault();
                });
                const { result } = renderHook(() =>
                    useBooleanInteraction({
                        value: false,
                        mode: "toggle",
                        onValueChange,
                        onMouseDown: userOnMouseDown,
                    })
                );

                const preventDefault = vi.fn(() => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (mockEvent as any).defaultPrevented = true;
                });
                const mockEvent = {
                    defaultPrevented: false,
                    preventDefault,
                } as unknown as React.MouseEvent;

                act(() => {
                    result.current.handleMouseDown(mockEvent);
                });

                expect(userOnMouseDown).toHaveBeenCalled();
                expect(onValueChange).not.toHaveBeenCalled();
            });
        });

        describe("onMouseUp", () => {
            it("calls user-provided onMouseUp handler before hook handler", () => {
                const userOnMouseUp = vi.fn();
                const { result } = renderHook(() =>
                    useBooleanInteraction({
                        value: false,
                        mode: "momentary",
                        onValueChange,
                        onMouseUp: userOnMouseUp,
                    })
                );

                // First activate the button
                act(() => {
                    result.current.handleMouseDown({
                        defaultPrevented: false,
                    } as React.MouseEvent);
                });
                onValueChange.mockClear();
                userOnMouseUp.mockClear();

                // Then release it
                const mockEvent = {
                    defaultPrevented: false,
                } as React.MouseEvent;

                act(() => {
                    result.current.handleMouseUp(mockEvent);
                });

                expect(userOnMouseUp).toHaveBeenCalledWith(mockEvent);
                expect(userOnMouseUp).toHaveBeenCalledTimes(1);
                expect(onValueChange).toHaveBeenCalledWith(false);
            });

            it("respects defaultPrevented from user onMouseUp handler", () => {
                const userOnMouseUp = vi.fn((e: React.MouseEvent) => {
                    e.preventDefault();
                });
                const { result } = renderHook(() =>
                    useBooleanInteraction({
                        value: false,
                        mode: "momentary",
                        onValueChange,
                        onMouseUp: userOnMouseUp,
                    })
                );

                // First activate the button
                act(() => {
                    result.current.handleMouseDown({
                        defaultPrevented: false,
                    } as React.MouseEvent);
                });
                onValueChange.mockClear();

                const preventDefault = vi.fn(() => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (mockEvent as any).defaultPrevented = true;
                });
                const mockEvent = {
                    defaultPrevented: false,
                    preventDefault,
                } as unknown as React.MouseEvent;

                act(() => {
                    result.current.handleMouseUp(mockEvent);
                });

                expect(userOnMouseUp).toHaveBeenCalled();
                expect(onValueChange).not.toHaveBeenCalled();
            });
        });

        describe("onKeyDown", () => {
            it("calls user-provided onKeyDown handler before hook handler", () => {
                const userOnKeyDown = vi.fn();
                const { result } = renderHook(() =>
                    useBooleanInteraction({
                        value: false,
                        mode: "toggle",
                        onValueChange,
                        onKeyDown: userOnKeyDown,
                    })
                );

                const preventDefault = vi.fn();
                const mockEvent = {
                    key: " ",
                    preventDefault,
                    defaultPrevented: false,
                } as React.KeyboardEvent;

                act(() => {
                    result.current.handleKeyDown(mockEvent);
                });

                expect(userOnKeyDown).toHaveBeenCalledWith(mockEvent);
                expect(userOnKeyDown).toHaveBeenCalledTimes(1);
                expect(onValueChange).toHaveBeenCalledWith(true);
            });

            it("respects defaultPrevented from user onKeyDown handler", () => {
                const userOnKeyDown = vi.fn((e: React.KeyboardEvent) => {
                    e.preventDefault();
                });
                const { result } = renderHook(() =>
                    useBooleanInteraction({
                        value: false,
                        mode: "toggle",
                        onValueChange,
                        onKeyDown: userOnKeyDown,
                    })
                );

                const preventDefault = vi.fn(() => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (mockEvent as any).defaultPrevented = true;
                });
                const mockEvent = {
                    key: " ",
                    preventDefault,
                    defaultPrevented: false,
                } as unknown as React.KeyboardEvent;

                act(() => {
                    result.current.handleKeyDown(mockEvent);
                });

                expect(userOnKeyDown).toHaveBeenCalled();
                expect(onValueChange).not.toHaveBeenCalled();
            });
        });

        describe("onKeyUp", () => {
            it("calls user-provided onKeyUp handler before hook handler", () => {
                const userOnKeyUp = vi.fn();
                const { result } = renderHook(() =>
                    useBooleanInteraction({
                        value: true,
                        mode: "momentary",
                        onValueChange,
                        onKeyUp: userOnKeyUp,
                    })
                );

                const preventDefault = vi.fn();
                const mockEvent = {
                    key: " ",
                    preventDefault,
                    defaultPrevented: false,
                } as React.KeyboardEvent;

                act(() => {
                    result.current.handleKeyUp(mockEvent);
                });

                expect(userOnKeyUp).toHaveBeenCalledWith(mockEvent);
                expect(userOnKeyUp).toHaveBeenCalledTimes(1);
                expect(onValueChange).toHaveBeenCalledWith(false);
            });

            it("respects defaultPrevented from user onKeyUp handler", () => {
                const userOnKeyUp = vi.fn((e: React.KeyboardEvent) => {
                    e.preventDefault();
                });
                const { result } = renderHook(() =>
                    useBooleanInteraction({
                        value: true,
                        mode: "momentary",
                        onValueChange,
                        onKeyUp: userOnKeyUp,
                    })
                );

                const preventDefault = vi.fn(() => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (mockEvent as any).defaultPrevented = true;
                });
                const mockEvent = {
                    key: " ",
                    preventDefault,
                    defaultPrevented: false,
                } as unknown as React.KeyboardEvent;

                act(() => {
                    result.current.handleKeyUp(mockEvent);
                });

                expect(userOnKeyUp).toHaveBeenCalled();
                expect(onValueChange).not.toHaveBeenCalled();
            });
        });

        describe("onTouchStart", () => {
            it("calls user-provided onTouchStart handler before hook handler", () => {
                const userOnTouchStart = vi.fn();
                const { result } = renderHook(() =>
                    useBooleanInteraction({
                        value: false,
                        mode: "toggle",
                        onValueChange,
                        onTouchStart: userOnTouchStart,
                    })
                );

                const preventDefault = vi.fn();
                const mockTouchEvent = {
                    defaultPrevented: false,
                    preventDefault,
                    touches: [{ clientX: 0, clientY: 0 }],
                } as unknown as React.TouchEvent;

                act(() => {
                    result.current.handleTouchStart(mockTouchEvent);
                });

                expect(userOnTouchStart).toHaveBeenCalledWith(mockTouchEvent);
                expect(userOnTouchStart).toHaveBeenCalledTimes(1);
                expect(onValueChange).toHaveBeenCalledWith(true);
            });

            it("respects defaultPrevented from user onTouchStart handler", () => {
                const userOnTouchStart = vi.fn((e: React.TouchEvent) => {
                    e.preventDefault();
                });
                const { result } = renderHook(() =>
                    useBooleanInteraction({
                        value: false,
                        mode: "toggle",
                        onValueChange,
                        onTouchStart: userOnTouchStart,
                    })
                );

                const preventDefault = vi.fn(() => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (mockTouchEvent as any).defaultPrevented = true;
                });
                const mockTouchEvent = {
                    defaultPrevented: false,
                    preventDefault,
                    touches: [{ clientX: 0, clientY: 0 }],
                } as unknown as React.TouchEvent;

                act(() => {
                    result.current.handleTouchStart(mockTouchEvent);
                });

                expect(userOnTouchStart).toHaveBeenCalled();
                expect(onValueChange).not.toHaveBeenCalled();
            });
        });

        describe("onTouchEnd", () => {
            it("calls user-provided onTouchEnd handler before hook handler", () => {
                const userOnTouchEnd = vi.fn();
                const { result } = renderHook(() =>
                    useBooleanInteraction({
                        value: false,
                        mode: "momentary",
                        onValueChange,
                        onTouchEnd: userOnTouchEnd,
                    })
                );

                const preventDefault = vi.fn();
                const mockTouchEvent = {
                    defaultPrevented: false,
                    preventDefault,
                    touches: [{ clientX: 0, clientY: 0 }],
                } as unknown as React.TouchEvent;

                // First activate the button
                act(() => {
                    result.current.handleTouchStart(mockTouchEvent);
                });
                onValueChange.mockClear();
                userOnTouchEnd.mockClear();

                // Then release it
                act(() => {
                    result.current.handleTouchEnd(mockTouchEvent);
                });

                expect(userOnTouchEnd).toHaveBeenCalledWith(mockTouchEvent);
                expect(userOnTouchEnd).toHaveBeenCalledTimes(1);
                expect(onValueChange).toHaveBeenCalledWith(false);
            });

            it("respects defaultPrevented from user onTouchEnd handler", () => {
                const userOnTouchEnd = vi.fn((e: React.TouchEvent) => {
                    e.preventDefault();
                });
                const { result } = renderHook(() =>
                    useBooleanInteraction({
                        value: false,
                        mode: "momentary",
                        onValueChange,
                        onTouchEnd: userOnTouchEnd,
                    })
                );

                const preventDefault = vi.fn(() => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (mockTouchEvent as any).defaultPrevented = true;
                });
                const mockTouchEvent = {
                    defaultPrevented: false,
                    preventDefault,
                    touches: [{ clientX: 0, clientY: 0 }],
                } as unknown as React.TouchEvent;

                // First activate the button
                act(() => {
                    result.current.handleTouchStart(mockTouchEvent);
                });
                onValueChange.mockClear();

                act(() => {
                    result.current.handleTouchEnd(mockTouchEvent);
                });

                expect(userOnTouchEnd).toHaveBeenCalled();
                expect(onValueChange).not.toHaveBeenCalled();
            });
        });
    });

    describe("Config Updates", () => {
        it("updates controller when value changes", () => {
            const { result, rerender } = renderHook(
                ({ value, mode }) =>
                    useBooleanInteraction({
                        value,
                        mode,
                        onValueChange,
                    }),
                {
                    initialProps: { value: false, mode: "toggle" as const },
                }
            );

            // Initial state: false
            act(() => {
                result.current.handleMouseDown({
                    defaultPrevented: false,
                } as React.MouseEvent);
            });
            expect(onValueChange).toHaveBeenCalledWith(true);
            onValueChange.mockClear();

            // Update to true
            rerender({ value: true, mode: "toggle" });

            // Should now toggle to false
            act(() => {
                result.current.handleMouseDown({
                    defaultPrevented: false,
                } as React.MouseEvent);
            });
            expect(onValueChange).toHaveBeenCalledWith(false);
        });

        it("updates controller when mode changes", () => {
            const { result, rerender } = renderHook(
                ({ value, mode }) =>
                    useBooleanInteraction({
                        value,
                        mode,
                        onValueChange,
                    }),
                {
                    initialProps: { value: false, mode: "toggle" as const },
                }
            );

            // Toggle mode: click toggles
            act(() => {
                result.current.handleMouseDown({
                    defaultPrevented: false,
                } as React.MouseEvent);
            });
            expect(onValueChange).toHaveBeenCalledWith(true);
            onValueChange.mockClear();

            // Switch to momentary mode
            rerender({ value: true, mode: "momentary" });

            // Momentary mode: click activates, release deactivates
            act(() => {
                result.current.handleMouseDown({
                    defaultPrevented: false,
                } as React.MouseEvent);
            });
            expect(onValueChange).toHaveBeenCalledWith(true);
            onValueChange.mockClear();

            act(() => {
                result.current.handleMouseUp({
                    defaultPrevented: false,
                } as React.MouseEvent);
            });
            expect(onValueChange).toHaveBeenCalledWith(false);
        });
    });

    describe("Callback Stability", () => {
        it("maintains stable callback references across renders", () => {
            const { result, rerender } = renderHook(() =>
                useBooleanInteraction({
                    value: false,
                    mode: "toggle",
                    onValueChange,
                })
            );

            const initialHandlers = {
                handleMouseDown: result.current.handleMouseDown,
                handleMouseUp: result.current.handleMouseUp,
                handleTouchStart: result.current.handleTouchStart,
                handleTouchEnd: result.current.handleTouchEnd,
                handleKeyDown: result.current.handleKeyDown,
                handleKeyUp: result.current.handleKeyUp,
            };

            rerender();

            expect(result.current.handleMouseDown).toBe(initialHandlers.handleMouseDown);
            expect(result.current.handleMouseUp).toBe(initialHandlers.handleMouseUp);
            expect(result.current.handleTouchStart).toBe(initialHandlers.handleTouchStart);
            expect(result.current.handleTouchEnd).toBe(initialHandlers.handleTouchEnd);
            expect(result.current.handleKeyDown).toBe(initialHandlers.handleKeyDown);
            expect(result.current.handleKeyUp).toBe(initialHandlers.handleKeyUp);
        });
    });
});
