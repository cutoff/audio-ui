/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import Button from "./defaults/controls/Button";
import Knob from "./defaults/controls/Knob";
import Slider from "./defaults/controls/Slider";
import CycleButton from "./defaults/controls/CycleButton";
import Keys from "./defaults/devices/Keys";

describe("Accessibility (axe)", () => {
    it("Button has no axe violations when labeled", async () => {
        const { container } = render(<Button value={false} onValueChange={() => {}} label="Power" />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it("Knob has no axe violations when labeled", async () => {
        const { container } = render(<Knob value={0.5} min={0} max={1} label="Volume" />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it("Slider has no axe violations when labeled", async () => {
        const { container } = render(<Slider value={0.5} min={0} max={1} label="Pan" />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it("CycleButton has no axe violations when labeled", async () => {
        const { container } = render(
            <CycleButton
                value="sine"
                onValueChange={() => {}}
                label="Waveform"
                options={[
                    { value: "sine", label: "Sine" },
                    { value: "square", label: "Square" },
                ]}
            />
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it("Keys has no axe violations", async () => {
        const { container } = render(<Keys nbKeys={12} ariaLabel="Piano keyboard" />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    describe("editable / disabled contract", () => {
        it("Knob emits aria-readonly when editable=false and !disabled", () => {
            const { container } = render(<Knob value={0.5} min={0} max={1} label="Volume" editable={false} />);
            const svg = container.querySelector('[role="slider"]');
            expect(svg?.getAttribute("aria-readonly")).toBe("true");
            expect(svg?.getAttribute("aria-disabled")).toBeNull();
            expect(svg?.getAttribute("tabindex")).toBe("-1"); // No onClick, so not focusable
        });

        it("Knob emits aria-disabled and no aria-readonly when disabled=true", () => {
            const { container } = render(<Knob value={0.5} min={0} max={1} label="Volume" disabled />);
            const svg = container.querySelector('[role="slider"]');
            expect(svg?.getAttribute("aria-disabled")).toBe("true");
            expect(svg?.getAttribute("aria-readonly")).toBeNull();
            expect(svg?.getAttribute("tabindex")).toBe("-1");
        });

        it("Knob stays focusable with onClick even when editable=false", () => {
            const { container } = render(
                <Knob value={0.5} min={0} max={1} label="Volume" editable={false} onClick={() => {}} />
            );
            const svg = container.querySelector('[role="slider"]');
            expect(svg?.getAttribute("tabindex")).toBe("0");
        });

        it("Button emits aria-disabled (no aria-readonly) and is removed from tab order when disabled", () => {
            const { container } = render(<Button value={false} onValueChange={() => {}} label="Power" disabled />);
            const svg = container.querySelector('[role="button"]');
            expect(svg?.getAttribute("aria-disabled")).toBe("true");
            expect(svg?.getAttribute("aria-readonly")).toBeNull();
            expect(svg?.getAttribute("tabindex")).toBe("-1");
        });

        it("CycleButton emits aria-readonly when editable=false and !disabled", () => {
            const { container } = render(
                <CycleButton
                    value="sine"
                    onValueChange={() => {}}
                    label="Waveform"
                    editable={false}
                    options={[
                        { value: "sine", label: "Sine" },
                        { value: "square", label: "Square" },
                    ]}
                />
            );
            const svg = container.querySelector('[role="spinbutton"]');
            expect(svg?.getAttribute("aria-readonly")).toBe("true");
            expect(svg?.getAttribute("aria-disabled")).toBeNull();
        });
    });
});
