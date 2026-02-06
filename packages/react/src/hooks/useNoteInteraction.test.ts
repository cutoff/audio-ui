/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

// @vitest-environment jsdom

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useNoteInteraction } from "./useNoteInteraction";

// jsdom does not implement elementFromPoint; add a stub so we can spy/mock it
if (typeof document.elementFromPoint !== "function") {
    document.elementFromPoint = () => null;
}

describe("useNoteInteraction", () => {
    let onNoteOn: ReturnType<typeof vi.fn>;
    let onNoteOff: ReturnType<typeof vi.fn>;
    let mockKeyElement: HTMLElement;

    beforeEach(() => {
        onNoteOn = vi.fn();
        onNoteOff = vi.fn();
        mockKeyElement = document.createElement("div");
        mockKeyElement.setAttribute("data-note", "60");
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("Initialization", () => {
        it("returns all required handlers and style", () => {
            const { result } = renderHook(() =>
                useNoteInteraction({ onNoteOn, onNoteOff })
            );

            expect(result.current).toHaveProperty("onPointerDown");
            expect(result.current).toHaveProperty("onPointerMove");
            expect(result.current).toHaveProperty("onPointerUp");
            expect(result.current).toHaveProperty("onPointerCancel");
            expect(result.current).toHaveProperty("style");
            expect(typeof result.current.onPointerDown).toBe("function");
            expect(typeof result.current.onPointerMove).toBe("function");
            expect(typeof result.current.onPointerUp).toBe("function");
            expect(typeof result.current.onPointerCancel).toBe("function");
            expect(result.current.style).toEqual({ touchAction: "none" });
        });

        it("includes touchAction none in style", () => {
            const { result } = renderHook(() =>
                useNoteInteraction({ onNoteOn, onNoteOff })
            );
            expect(result.current.style.touchAction).toBe("none");
        });
    });

    describe("Note on/off", () => {
        it("calls onNoteOn when pointer down on a key", () => {
            vi.spyOn(document, "elementFromPoint").mockReturnValue(mockKeyElement);

            const { result } = renderHook(() =>
                useNoteInteraction({ onNoteOn, onNoteOff })
            );

            const target = document.createElement("div");
            target.setPointerCapture = vi.fn();

            act(() => {
                result.current.onPointerDown({
                    pointerId: 1,
                    clientX: 0,
                    clientY: 0,
                    defaultPrevented: false,
                    currentTarget: target,
                } as React.PointerEvent);
            });

            expect(onNoteOn).toHaveBeenCalledWith(60);
            expect(onNoteOff).not.toHaveBeenCalled();
        });

        it("calls onNoteOff when pointer up after note on", () => {
            vi.spyOn(document, "elementFromPoint").mockReturnValue(mockKeyElement);

            const { result } = renderHook(() =>
                useNoteInteraction({ onNoteOn, onNoteOff })
            );

            const target = document.createElement("div");
            target.setPointerCapture = vi.fn();

            act(() => {
                result.current.onPointerDown({
                    pointerId: 1,
                    clientX: 0,
                    clientY: 0,
                    defaultPrevented: false,
                    currentTarget: target,
                } as React.PointerEvent);
            });

            expect(onNoteOn).toHaveBeenCalledWith(60);
            onNoteOn.mockClear();
            onNoteOff.mockClear();

            act(() => {
                result.current.onPointerUp({
                    pointerId: 1,
                    defaultPrevented: false,
                } as React.PointerEvent);
            });

            expect(onNoteOff).toHaveBeenCalledWith(60);
        });

        it("does not call onNoteOn when pointer down and elementFromPoint returns null", () => {
            vi.spyOn(document, "elementFromPoint").mockReturnValue(null);

            const { result } = renderHook(() =>
                useNoteInteraction({ onNoteOn, onNoteOff })
            );

            const target = document.createElement("div");
            target.setPointerCapture = vi.fn();

            act(() => {
                result.current.onPointerDown({
                    pointerId: 1,
                    clientX: 0,
                    clientY: 0,
                    defaultPrevented: false,
                    currentTarget: target,
                } as React.PointerEvent);
            });

            expect(onNoteOn).not.toHaveBeenCalled();
        });

        it("does not call onNoteOn when pointer down on element without data-note", () => {
            const el = document.createElement("div");
            vi.spyOn(document, "elementFromPoint").mockReturnValue(el);

            const { result } = renderHook(() =>
                useNoteInteraction({ onNoteOn, onNoteOff })
            );

            const target = document.createElement("div");
            target.setPointerCapture = vi.fn();

            act(() => {
                result.current.onPointerDown({
                    pointerId: 1,
                    clientX: 0,
                    clientY: 0,
                    defaultPrevented: false,
                    currentTarget: target,
                } as React.PointerEvent);
            });

            expect(onNoteOn).not.toHaveBeenCalled();
        });
    });

    describe("Glissando", () => {
        it("calls onNoteOff then onNoteOn when pointer moves from one key to another", () => {
            const key60 = document.createElement("div");
            key60.setAttribute("data-note", "60");
            const key62 = document.createElement("div");
            key62.setAttribute("data-note", "62");

            let callCount = 0;
            vi.spyOn(document, "elementFromPoint").mockImplementation(() => {
                callCount++;
                if (callCount === 1) return key60;
                if (callCount === 2) return key62;
                return key62;
            });

            const { result } = renderHook(() =>
                useNoteInteraction({ onNoteOn, onNoteOff })
            );

            const target = document.createElement("div");
            target.setPointerCapture = vi.fn();

            act(() => {
                result.current.onPointerDown({
                    pointerId: 1,
                    clientX: 0,
                    clientY: 0,
                    defaultPrevented: false,
                    currentTarget: target,
                } as React.PointerEvent);
            });

            expect(onNoteOn).toHaveBeenCalledWith(60);
            onNoteOn.mockClear();
            onNoteOff.mockClear();

            act(() => {
                result.current.onPointerMove({
                    pointerId: 1,
                    clientX: 10,
                    clientY: 10,
                    defaultPrevented: false,
                } as React.PointerEvent);
            });

            expect(onNoteOff).toHaveBeenCalledWith(60);
            expect(onNoteOn).toHaveBeenCalledWith(62);
        });
    });

    describe("Multi-pointer", () => {
        it("tracks multiple pointers independently", () => {
            const key60 = document.createElement("div");
            key60.setAttribute("data-note", "60");
            const key64 = document.createElement("div");
            key64.setAttribute("data-note", "64");

            let callCount = 0;
            vi.spyOn(document, "elementFromPoint").mockImplementation(() => {
                callCount++;
                if (callCount <= 1) return key60;
                return key64;
            });

            const { result } = renderHook(() =>
                useNoteInteraction({ onNoteOn, onNoteOff })
            );

            const target = document.createElement("div");
            target.setPointerCapture = vi.fn();

            act(() => {
                result.current.onPointerDown({
                    pointerId: 1,
                    clientX: 0,
                    clientY: 0,
                    defaultPrevented: false,
                    currentTarget: target,
                } as React.PointerEvent);
            });
            act(() => {
                result.current.onPointerDown({
                    pointerId: 2,
                    clientX: 10,
                    clientY: 10,
                    defaultPrevented: false,
                    currentTarget: target,
                } as React.PointerEvent);
            });

            expect(onNoteOn).toHaveBeenCalledWith(60);
            expect(onNoteOn).toHaveBeenCalledWith(64);

            onNoteOn.mockClear();
            onNoteOff.mockClear();

            act(() => {
                result.current.onPointerUp({
                    pointerId: 1,
                    defaultPrevented: false,
                } as React.PointerEvent);
            });

            expect(onNoteOff).toHaveBeenCalledWith(60);
            expect(onNoteOn).not.toHaveBeenCalled();
        });
    });

    describe("Disabled", () => {
        it("does not call onNoteOn or onNoteOff when disabled", () => {
            vi.spyOn(document, "elementFromPoint").mockReturnValue(mockKeyElement);

            const { result } = renderHook(() =>
                useNoteInteraction({ onNoteOn, onNoteOff, disabled: true })
            );

            const target = document.createElement("div");
            target.setPointerCapture = vi.fn();

            act(() => {
                result.current.onPointerDown({
                    pointerId: 1,
                    clientX: 0,
                    clientY: 0,
                    defaultPrevented: false,
                    currentTarget: target,
                } as React.PointerEvent);
            });

            expect(onNoteOn).not.toHaveBeenCalled();

            act(() => {
                result.current.onPointerUp({
                    pointerId: 1,
                    defaultPrevented: false,
                } as React.PointerEvent);
            });

            expect(onNoteOff).not.toHaveBeenCalled();
        });
    });

    describe("User handlers", () => {
        it("calls user onPointerDown when provided", () => {
            const userOnPointerDown = vi.fn();
            vi.spyOn(document, "elementFromPoint").mockReturnValue(mockKeyElement);

            const { result } = renderHook(() =>
                useNoteInteraction({
                    onNoteOn,
                    onNoteOff,
                    onPointerDown: userOnPointerDown,
                })
            );

            const target = document.createElement("div");
            target.setPointerCapture = vi.fn();
            const syntheticEvent = {
                pointerId: 1,
                clientX: 0,
                clientY: 0,
                defaultPrevented: false,
                currentTarget: target,
            } as React.PointerEvent;

            act(() => {
                result.current.onPointerDown(syntheticEvent);
            });

            expect(userOnPointerDown).toHaveBeenCalledWith(syntheticEvent);
            expect(onNoteOn).toHaveBeenCalledWith(60);
        });

        it("does not call controller when user onPointerDown calls preventDefault", () => {
            const userOnPointerDown = vi.fn((e: React.PointerEvent) => {
                Object.defineProperty(e, "defaultPrevented", { value: true });
            });
            vi.spyOn(document, "elementFromPoint").mockReturnValue(mockKeyElement);

            const { result } = renderHook(() =>
                useNoteInteraction({
                    onNoteOn,
                    onNoteOff,
                    onPointerDown: userOnPointerDown,
                })
            );

            const target = document.createElement("div");
            target.setPointerCapture = vi.fn();
            const syntheticEvent = {
                pointerId: 1,
                clientX: 0,
                clientY: 0,
                defaultPrevented: false,
                currentTarget: target,
            } as React.PointerEvent;

            act(() => {
                result.current.onPointerDown(syntheticEvent);
            });

            expect(onNoteOn).not.toHaveBeenCalled();
        });
    });

    describe("Pointer cancel", () => {
        it("calls onNoteOff when pointer cancel after note on", () => {
            vi.spyOn(document, "elementFromPoint").mockReturnValue(mockKeyElement);

            const { result } = renderHook(() =>
                useNoteInteraction({ onNoteOn, onNoteOff })
            );

            const target = document.createElement("div");
            target.setPointerCapture = vi.fn();

            act(() => {
                result.current.onPointerDown({
                    pointerId: 1,
                    clientX: 0,
                    clientY: 0,
                    defaultPrevented: false,
                    currentTarget: target,
                } as React.PointerEvent);
            });

            onNoteOn.mockClear();
            onNoteOff.mockClear();

            act(() => {
                result.current.onPointerCancel({
                    pointerId: 1,
                    defaultPrevented: false,
                } as React.PointerEvent);
            });

            expect(onNoteOff).toHaveBeenCalledWith(60);
        });
    });
});
