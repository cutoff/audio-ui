/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Slider from "./defaults/controls/Slider";
import Button from "./defaults/controls/Button";

describe("Component integration tests", () => {
    describe("Slider", () => {
        it("calls onValueChange when user drags (vertical)", () => {
            const onValueChange = vi.fn();
            render(<Slider value={0.5} onValueChange={onValueChange} orientation="vertical" />);

            const slider = screen.getByRole("slider");
            expect(slider).toBeDefined();

            // Start drag
            fireEvent.mouseDown(slider, { clientX: 50, clientY: 100 });

            // Move up (vertical: up = increase value)
            fireEvent.mouseMove(window, { clientX: 50, clientY: 80 });

            expect(onValueChange).toHaveBeenCalled();
            const lastCall = onValueChange.mock.calls[onValueChange.mock.calls.length - 1];
            // First arg: the new real value (primitive).
            expect(typeof lastCall[0]).toBe("number");
            // Second arg: full event with three-representation payload.
            expect(lastCall[1]).toHaveProperty("value");
            expect(lastCall[1]).toHaveProperty("normalizedValue");
            expect(lastCall[1]).toHaveProperty("midiValue");

            fireEvent.mouseUp(window);
        });
    });

    describe("Button", () => {
        it("calls onValueChange when user presses (toggle)", () => {
            const onValueChange = vi.fn();
            render(<Button value={false} onValueChange={onValueChange} label="Test" latch={true} />);

            const button = screen.getByRole("button", { name: /test/i });
            fireEvent.mouseDown(button, { button: 0 });
            fireEvent.mouseUp(button, { button: 0 });

            expect(onValueChange).toHaveBeenCalled();
            const lastCall = onValueChange.mock.calls[onValueChange.mock.calls.length - 1];
            expect(lastCall[0]).toBe(true);
            expect(lastCall[1]).toEqual(expect.objectContaining({ value: true }));
        });
    });
});
