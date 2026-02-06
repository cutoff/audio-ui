/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Button from "./defaults/controls/Button";
import Knob from "./defaults/controls/Knob";
import Slider from "./defaults/controls/Slider";
import AdaptiveBox from "./primitives/AdaptiveBox";
import Keys from "./defaults/devices/Keys";

describe("Component smoke tests", () => {
    describe("Button", () => {
        it("renders without throwing", () => {
            expect(() => {
                render(<Button value={false} onChange={() => {}} />);
            }).not.toThrow();
        });

        it("has role button and accessible name when label provided", () => {
            render(
                <Button
                    value={false}
                    onChange={() => {}}
                    label="Power"
                />
            );
            const button = screen.getByRole("button", { name: /power/i });
            expect(button).toBeDefined();
            expect(document.body.contains(button)).toBe(true);
        });
    });

    describe("Knob", () => {
        it("renders without throwing", () => {
            expect(() => {
                render(<Knob value={0.5} />);
            }).not.toThrow();
        });

        it("has role slider", () => {
            render(<Knob value={0.5} />);
            const slider = screen.getByRole("slider");
            expect(slider).toBeDefined();
            expect(document.body.contains(slider)).toBe(true);
        });
    });

    describe("Slider", () => {
        it("renders without throwing", () => {
            expect(() => {
                render(<Slider value={0.5} />);
            }).not.toThrow();
        });

        it("has role slider", () => {
            render(<Slider value={0.5} />);
            const slider = screen.getByRole("slider");
            expect(slider).toBeDefined();
            expect(document.body.contains(slider)).toBe(true);
        });
    });

    describe("AdaptiveBox", () => {
        it("renders without throwing", () => {
            expect(() => {
                render(
                    <AdaptiveBox viewBoxWidth={100} viewBoxHeight={100}>
                        <AdaptiveBox.Svg />
                    </AdaptiveBox>
                );
            }).not.toThrow();
        });

        it("renders children", () => {
            const { container } = render(
                <AdaptiveBox viewBoxWidth={100} viewBoxHeight={100}>
                    <AdaptiveBox.Svg />
                </AdaptiveBox>
            );
            expect(container.querySelector("svg")).not.toBeNull();
        });
    });

    describe("Keys", () => {
        it("renders without throwing", () => {
            expect(() => {
                render(<Keys nbKeys={12} />);
            }).not.toThrow();
        });

        it("renders SVG keyboard", () => {
            const { container } = render(<Keys nbKeys={12} />);
            expect(container.querySelector("svg")).not.toBeNull();
        });
    });
});
