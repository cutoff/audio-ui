/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

// @vitest-environment jsdom

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDiscreteInteraction } from "./useDiscreteInteraction";

describe("useDiscreteInteraction", () => {
    const onValueChange = vi.fn();
    const options = [
        { value: 0, label: "Zero" },
        { value: 1, label: "One" },
        { value: 2, label: "Two" },
    ];

    beforeEach(() => {
        onValueChange.mockClear();
    });

    describe("Initialization", () => {
        it("returns all required handlers and methods", () => {
            const { result } = renderHook(() =>
                useDiscreteInteraction({
                    value: 0,
                    options,
                    onValueChange,
                })
            );

            expect(result.current).toHaveProperty("handleClick");
            expect(result.current).toHaveProperty("handleKeyDown");
            expect(result.current).toHaveProperty("cycleNext");
            expect(result.current).toHaveProperty("stepNext");
            expect(result.current).toHaveProperty("stepPrev");
            expect(typeof result.current.handleClick).toBe("function");
            expect(typeof result.current.handleKeyDown).toBe("function");
            expect(typeof result.current.cycleNext).toBe("function");
            expect(typeof result.current.stepNext).toBe("function");
            expect(typeof result.current.stepPrev).toBe("function");
        });

        it("initializes controller with correct config", () => {
            const { result } = renderHook(() =>
                useDiscreteInteraction({
                    value: 1,
                    options,
                    onValueChange,
                    disabled: false,
                })
            );

            // Verify handlers work (which confirms controller was initialized)
            act(() => {
                result.current.cycleNext();
            });

            expect(onValueChange).toHaveBeenCalledWith(2);
        });
    });

    describe("Manual Controls", () => {
        it("cycleNext wraps around from last to first", () => {
            const { result } = renderHook(() =>
                useDiscreteInteraction({
                    value: 2,
                    options,
                    onValueChange,
                })
            );

            act(() => {
                result.current.cycleNext();
            });

            expect(onValueChange).toHaveBeenCalledWith(0);
        });

        it("cycleNext moves to next index", () => {
            const { result } = renderHook(() =>
                useDiscreteInteraction({
                    value: 0,
                    options,
                    onValueChange,
                })
            );

            act(() => {
                result.current.cycleNext();
            });

            expect(onValueChange).toHaveBeenCalledWith(1);
        });

        it("stepNext clamps at end", () => {
            const { result } = renderHook(() =>
                useDiscreteInteraction({
                    value: 2,
                    options,
                    onValueChange,
                })
            );

            act(() => {
                result.current.stepNext();
            });

            expect(onValueChange).not.toHaveBeenCalled();
        });

        it("stepNext moves to next index", () => {
            const { result } = renderHook(() =>
                useDiscreteInteraction({
                    value: 0,
                    options,
                    onValueChange,
                })
            );

            act(() => {
                result.current.stepNext();
            });

            expect(onValueChange).toHaveBeenCalledWith(1);
        });

        it("stepPrev clamps at start", () => {
            const { result } = renderHook(() =>
                useDiscreteInteraction({
                    value: 0,
                    options,
                    onValueChange,
                })
            );

            act(() => {
                result.current.stepPrev();
            });

            expect(onValueChange).not.toHaveBeenCalled();
        });

        it("stepPrev moves to previous index", () => {
            const { result } = renderHook(() =>
                useDiscreteInteraction({
                    value: 2,
                    options,
                    onValueChange,
                })
            );

            act(() => {
                result.current.stepPrev();
            });

            expect(onValueChange).toHaveBeenCalledWith(1);
        });
    });

    describe("Event Handling", () => {
        describe("handleClick", () => {
            it("calls cycleNext when event not prevented", () => {
                const { result } = renderHook(() =>
                    useDiscreteInteraction({
                        value: 0,
                        options,
                        onValueChange,
                    })
                );

                act(() => {
                    result.current.handleClick({
                        defaultPrevented: false,
                    } as React.MouseEvent);
                });

                expect(onValueChange).toHaveBeenCalledWith(1);
            });

            it("respects defaultPrevented", () => {
                const { result } = renderHook(() =>
                    useDiscreteInteraction({
                        value: 0,
                        options,
                        onValueChange,
                    })
                );

                act(() => {
                    result.current.handleClick({
                        defaultPrevented: true,
                    } as React.MouseEvent);
                });

                expect(onValueChange).not.toHaveBeenCalled();
            });

            it("does nothing when disabled", () => {
                const { result } = renderHook(() =>
                    useDiscreteInteraction({
                        value: 0,
                        options,
                        onValueChange,
                        disabled: true,
                    })
                );

                act(() => {
                    result.current.handleClick({
                        defaultPrevented: false,
                    } as React.MouseEvent);
                });

                expect(onValueChange).not.toHaveBeenCalled();
            });

            it("calls user-provided onClick handler before hook handler", () => {
                const userOnClick = vi.fn();
                const { result } = renderHook(() =>
                    useDiscreteInteraction({
                        value: 0,
                        options,
                        onValueChange,
                        onClick: userOnClick,
                    })
                );

                const mockEvent = {
                    defaultPrevented: false,
                } as React.MouseEvent;

                act(() => {
                    result.current.handleClick(mockEvent);
                });

                expect(userOnClick).toHaveBeenCalledWith(mockEvent);
                expect(userOnClick).toHaveBeenCalledTimes(1);
                expect(onValueChange).toHaveBeenCalledWith(1);
            });

            it("respects defaultPrevented from user onClick handler", () => {
                const userOnClick = vi.fn((e: React.MouseEvent) => {
                    e.preventDefault();
                });
                const { result } = renderHook(() =>
                    useDiscreteInteraction({
                        value: 0,
                        options,
                        onValueChange,
                        onClick: userOnClick,
                    })
                );

                const mockEvent = {
                    defaultPrevented: false,
                    preventDefault: vi.fn(() => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (mockEvent as any).defaultPrevented = true;
                    }),
                } as unknown as React.MouseEvent;

                act(() => {
                    result.current.handleClick(mockEvent);
                });

                expect(userOnClick).toHaveBeenCalled();
                expect(onValueChange).not.toHaveBeenCalled();
            });
        });

        describe("handleKeyDown", () => {
            it("handles Space key (cycles)", () => {
                const { result } = renderHook(() =>
                    useDiscreteInteraction({
                        value: 0,
                        options,
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
                expect(onValueChange).toHaveBeenCalledWith(1);
            });

            it("handles Enter key (cycles)", () => {
                const { result } = renderHook(() =>
                    useDiscreteInteraction({
                        value: 0,
                        options,
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
                expect(onValueChange).toHaveBeenCalledWith(1);
            });

            it("handles ArrowRight key (steps)", () => {
                const { result } = renderHook(() =>
                    useDiscreteInteraction({
                        value: 0,
                        options,
                        onValueChange,
                    })
                );

                const preventDefault = vi.fn();

                act(() => {
                    result.current.handleKeyDown({
                        key: "ArrowRight",
                        preventDefault,
                    } as React.KeyboardEvent);
                });

                expect(preventDefault).toHaveBeenCalled();
                expect(onValueChange).toHaveBeenCalledWith(1);
            });

            it("handles ArrowUp key (steps)", () => {
                const { result } = renderHook(() =>
                    useDiscreteInteraction({
                        value: 0,
                        options,
                        onValueChange,
                    })
                );

                const preventDefault = vi.fn();

                act(() => {
                    result.current.handleKeyDown({
                        key: "ArrowUp",
                        preventDefault,
                    } as React.KeyboardEvent);
                });

                expect(preventDefault).toHaveBeenCalled();
                expect(onValueChange).toHaveBeenCalledWith(1);
            });

            it("handles ArrowLeft key (steps back)", () => {
                const { result } = renderHook(() =>
                    useDiscreteInteraction({
                        value: 1,
                        options,
                        onValueChange,
                    })
                );

                const preventDefault = vi.fn();

                act(() => {
                    result.current.handleKeyDown({
                        key: "ArrowLeft",
                        preventDefault,
                    } as React.KeyboardEvent);
                });

                expect(preventDefault).toHaveBeenCalled();
                expect(onValueChange).toHaveBeenCalledWith(0);
            });

            it("handles ArrowDown key (steps back)", () => {
                const { result } = renderHook(() =>
                    useDiscreteInteraction({
                        value: 1,
                        options,
                        onValueChange,
                    })
                );

                const preventDefault = vi.fn();

                act(() => {
                    result.current.handleKeyDown({
                        key: "ArrowDown",
                        preventDefault,
                    } as React.KeyboardEvent);
                });

                expect(preventDefault).toHaveBeenCalled();
                expect(onValueChange).toHaveBeenCalledWith(0);
            });

            it("does not prevent default for unknown keys", () => {
                const { result } = renderHook(() =>
                    useDiscreteInteraction({
                        value: 0,
                        options,
                        onValueChange,
                    })
                );

                const preventDefault = vi.fn();

                act(() => {
                    result.current.handleKeyDown({
                        key: "Shift",
                        preventDefault,
                    } as React.KeyboardEvent);
                });

                expect(preventDefault).not.toHaveBeenCalled();
                expect(onValueChange).not.toHaveBeenCalled();
            });

            it("does nothing when disabled", () => {
                const { result } = renderHook(() =>
                    useDiscreteInteraction({
                        value: 0,
                        options,
                        onValueChange,
                        disabled: true,
                    })
                );

                const preventDefault = vi.fn();

                act(() => {
                    result.current.handleKeyDown({
                        key: "ArrowRight",
                        preventDefault,
                    } as React.KeyboardEvent);
                });

                expect(preventDefault).not.toHaveBeenCalled();
                expect(onValueChange).not.toHaveBeenCalled();
            });

            it("calls user-provided onKeyDown handler before hook handler", () => {
                const userOnKeyDown = vi.fn();
                const { result } = renderHook(() =>
                    useDiscreteInteraction({
                        value: 0,
                        options,
                        onValueChange,
                        onKeyDown: userOnKeyDown,
                    })
                );

                const preventDefault = vi.fn();
                const mockEvent = {
                    key: "ArrowRight",
                    preventDefault,
                    defaultPrevented: false,
                } as React.KeyboardEvent;

                act(() => {
                    result.current.handleKeyDown(mockEvent);
                });

                expect(userOnKeyDown).toHaveBeenCalledWith(mockEvent);
                expect(userOnKeyDown).toHaveBeenCalledTimes(1);
                expect(onValueChange).toHaveBeenCalledWith(1);
            });

            it("respects defaultPrevented from user onKeyDown handler", () => {
                const userOnKeyDown = vi.fn((e: React.KeyboardEvent) => {
                    e.preventDefault();
                });
                const { result } = renderHook(() =>
                    useDiscreteInteraction({
                        value: 0,
                        options,
                        onValueChange,
                        onKeyDown: userOnKeyDown,
                    })
                );

                const preventDefault = vi.fn(() => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (mockEvent as any).defaultPrevented = true;
                });
                const mockEvent = {
                    key: "ArrowRight",
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

        describe("handleMouseDown", () => {
            it("passes through user-provided onMouseDown handler", () => {
                const userOnMouseDown = vi.fn();
                const { result } = renderHook(() =>
                    useDiscreteInteraction({
                        value: 0,
                        options,
                        onValueChange,
                        onMouseDown: userOnMouseDown,
                    })
                );

                expect(result.current.handleMouseDown).toBe(userOnMouseDown);
            });

            it("returns undefined when no user handler provided", () => {
                const { result } = renderHook(() =>
                    useDiscreteInteraction({
                        value: 0,
                        options,
                        onValueChange,
                    })
                );

                expect(result.current.handleMouseDown).toBeUndefined();
            });
        });
    });

    describe("Config Updates", () => {
        it("updates controller when value changes", () => {
            const { result, rerender } = renderHook(
                ({ value }) =>
                    useDiscreteInteraction({
                        value,
                        options,
                        onValueChange,
                    }),
                {
                    initialProps: { value: 0 },
                }
            );

            // Initial state: value 0
            act(() => {
                result.current.cycleNext();
            });
            expect(onValueChange).toHaveBeenCalledWith(1);
            onValueChange.mockClear();

            // Update to value 1
            rerender({ value: 1 });

            // Should now cycle from 1 to 2
            act(() => {
                result.current.cycleNext();
            });
            expect(onValueChange).toHaveBeenCalledWith(2);
        });

        it("updates controller when options change", () => {
            const initialOptions = [
                { value: "a", label: "A" },
                { value: "b", label: "B" },
            ];

            const { result, rerender } = renderHook(
                ({ options, value }) =>
                    useDiscreteInteraction({
                        value,
                        options,
                        onValueChange,
                    }),
                {
                    initialProps: { options: initialOptions, value: "a" },
                }
            );

            // Initial: cycle from "a" to "b"
            act(() => {
                result.current.cycleNext();
            });
            expect(onValueChange).toHaveBeenCalledWith("b");
            onValueChange.mockClear();

            // Update options to add "c" and update value to "b" (simulating parent update)
            const newOptions = [
                { value: "a", label: "A" },
                { value: "b", label: "B" },
                { value: "c", label: "C" },
            ];
            rerender({ options: newOptions, value: "b" });

            // Should now cycle from "b" to "c"
            act(() => {
                result.current.cycleNext();
            });
            expect(onValueChange).toHaveBeenCalledWith("c");
        });

        it("updates controller when onValueChange changes", () => {
            const onValueChange1 = vi.fn();
            const onValueChange2 = vi.fn();

            const { result, rerender } = renderHook(
                ({ onValueChange, value }) =>
                    useDiscreteInteraction({
                        value,
                        options,
                        onValueChange,
                    }),
                {
                    initialProps: { onValueChange: onValueChange1, value: 0 },
                }
            );

            act(() => {
                result.current.cycleNext();
            });
            expect(onValueChange1).toHaveBeenCalledWith(1);
            expect(onValueChange2).not.toHaveBeenCalled();
            onValueChange1.mockClear();

            // Update callback and value (simulating parent update)
            rerender({ onValueChange: onValueChange2, value: 1 });

            act(() => {
                result.current.cycleNext();
            });
            expect(onValueChange1).not.toHaveBeenCalled();
            expect(onValueChange2).toHaveBeenCalledWith(2);
        });

        it("updates controller when disabled changes", () => {
            const { result, rerender } = renderHook(
                ({ disabled, value }) =>
                    useDiscreteInteraction({
                        value,
                        options,
                        onValueChange,
                        disabled,
                    }),
                {
                    initialProps: { disabled: false, value: 0 },
                }
            );

            // Initially enabled
            act(() => {
                result.current.cycleNext();
            });
            expect(onValueChange).toHaveBeenCalledWith(1);
            onValueChange.mockClear();

            // Disable
            rerender({ disabled: true, value: 1 });

            act(() => {
                result.current.cycleNext();
            });
            expect(onValueChange).not.toHaveBeenCalled();

            // Re-enable (value stays at 1)
            rerender({ disabled: false, value: 1 });

            act(() => {
                result.current.cycleNext();
            });
            expect(onValueChange).toHaveBeenCalledWith(2);
        });
    });

    describe("Callback Stability", () => {
        it("maintains stable callback references across renders", () => {
            const { result, rerender } = renderHook(() =>
                useDiscreteInteraction({
                    value: 0,
                    options,
                    onValueChange,
                })
            );

            const initialHandlers = {
                handleClick: result.current.handleClick,
                handleKeyDown: result.current.handleKeyDown,
                cycleNext: result.current.cycleNext,
                stepNext: result.current.stepNext,
                stepPrev: result.current.stepPrev,
            };

            // Rerender with same props
            rerender();

            expect(result.current.handleClick).toBe(initialHandlers.handleClick);
            expect(result.current.handleKeyDown).toBe(initialHandlers.handleKeyDown);
            expect(result.current.cycleNext).toBe(initialHandlers.cycleNext);
            expect(result.current.stepNext).toBe(initialHandlers.stepNext);
            expect(result.current.stepPrev).toBe(initialHandlers.stepPrev);
        });

        it("maintains stable callbacks when props change", () => {
            const { result, rerender } = renderHook(
                ({ value }) =>
                    useDiscreteInteraction({
                        value,
                        options,
                        onValueChange,
                    }),
                {
                    initialProps: { value: 0 },
                }
            );

            const initialHandlers = {
                handleClick: result.current.handleClick,
                handleKeyDown: result.current.handleKeyDown,
                cycleNext: result.current.cycleNext,
                stepNext: result.current.stepNext,
                stepPrev: result.current.stepPrev,
            };

            // Rerender with different value
            rerender({ value: 1 });

            // Callbacks should remain stable (wrapped in useCallback)
            expect(result.current.handleClick).toBe(initialHandlers.handleClick);
            expect(result.current.handleKeyDown).toBe(initialHandlers.handleKeyDown);
            expect(result.current.cycleNext).toBe(initialHandlers.cycleNext);
            expect(result.current.stepNext).toBe(initialHandlers.stepNext);
            expect(result.current.stepPrev).toBe(initialHandlers.stepPrev);
        });
    });

    describe("Edge Cases", () => {
        it("handles single option (no cycling)", () => {
            const singleOption = [{ value: 0, label: "Only" }];

            const { result } = renderHook(() =>
                useDiscreteInteraction({
                    value: 0,
                    options: singleOption,
                    onValueChange,
                })
            );

            act(() => {
                result.current.cycleNext();
            });

            expect(onValueChange).not.toHaveBeenCalled();
        });

        it("handles empty options array", () => {
            const { result } = renderHook(() =>
                useDiscreteInteraction({
                    value: 0,
                    options: [],
                    onValueChange,
                })
            );

            act(() => {
                result.current.cycleNext();
            });

            expect(onValueChange).not.toHaveBeenCalled();
        });

        it("handles value not in options (falls back to first option)", () => {
            const { result } = renderHook(() =>
                useDiscreteInteraction({
                    value: 999, // Not in options
                    options,
                    onValueChange,
                })
            );

            // Should fall back to index 0, so cycleNext goes to 1
            act(() => {
                result.current.cycleNext();
            });

            expect(onValueChange).toHaveBeenCalledWith(1);
        });

        it("handles string values", () => {
            const stringOptions = [
                { value: "off", label: "Off" },
                { value: "on", label: "On" },
            ];

            const { result } = renderHook(() =>
                useDiscreteInteraction({
                    value: "off",
                    options: stringOptions,
                    onValueChange,
                })
            );

            act(() => {
                result.current.cycleNext();
            });

            expect(onValueChange).toHaveBeenCalledWith("on");
        });

        it("handles mixed string and number values", () => {
            const mixedOptions = [
                { value: 0, label: "Zero" },
                { value: "on", label: "On" },
                { value: 2, label: "Two" },
            ];

            const { result } = renderHook(() =>
                useDiscreteInteraction({
                    value: 0,
                    options: mixedOptions,
                    onValueChange,
                })
            );

            act(() => {
                result.current.cycleNext();
            });

            expect(onValueChange).toHaveBeenCalledWith("on");
        });
    });
});
