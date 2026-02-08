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
        it("calls onChange when user drags (vertical)", () => {
            const onChange = vi.fn();
            render(<Slider value={0.5} onChange={onChange} orientation="vertical" />);

            const slider = screen.getByRole("slider");
            expect(slider).toBeDefined();

            // Start drag
            fireEvent.mouseDown(slider, { clientX: 50, clientY: 100 });

            // Move up (vertical: up = increase value)
            fireEvent.mouseMove(window, { clientX: 50, clientY: 80 });

            expect(onChange).toHaveBeenCalled();
            const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
            expect(lastCall[0]).toHaveProperty("value");
            expect(typeof lastCall[0].value).toBe("number");

            fireEvent.mouseUp(window);
        });
    });

    describe("Button", () => {
        it("calls onChange when user presses (toggle)", () => {
            const onChange = vi.fn();
            render(<Button value={false} onChange={onChange} label="Test" latch={true} />);

            const button = screen.getByRole("button", { name: /test/i });
            fireEvent.mouseDown(button, { button: 0 });
            fireEvent.mouseUp(button, { button: 0 });

            expect(onChange).toHaveBeenCalledWith(
                expect.objectContaining({
                    value: true,
                })
            );
        });
    });
});
