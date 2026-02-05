/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

import { describe, it, expect } from "vitest";
import { getSizeClassForComponent, getSizeStyleForComponent } from "./sizing";

describe("sizing", () => {
    describe("getSizeClassForComponent", () => {
        it("returns correct class for knob", () => {
            expect(getSizeClassForComponent("knob", "small")).toBe("audioui-size-square-small");
            expect(getSizeClassForComponent("knob", "large")).toBe("audioui-size-square-large");
        });

        it("returns correct class for button", () => {
            expect(getSizeClassForComponent("button", "normal")).toBe("audioui-size-square-normal");
        });

        it("returns correct class for keys", () => {
            expect(getSizeClassForComponent("keys", "xlarge")).toBe("audioui-size-keys-xlarge");
        });

        it("returns correct class for slider", () => {
            expect(getSizeClassForComponent("slider", "small", "vertical")).toBe("audioui-size-vslider-small");
            expect(getSizeClassForComponent("slider", "small", "horizontal")).toBe("audioui-size-hslider-small");
        });
    });

    describe("getSizeStyleForComponent", () => {
        it("returns correct style variables for knob", () => {
            const style = getSizeStyleForComponent("knob", "normal");
            expect(style.width).toBe("var(--audioui-size-square-normal)");
            expect(style.height).toBe("var(--audioui-size-square-normal)");
        });

        it("returns correct style variables for horizontal slider", () => {
            const style = getSizeStyleForComponent("slider", "large", "horizontal");
            expect(style.width).toBe("var(--audioui-size-hslider-width-large)");
            expect(style.height).toBe("var(--audioui-size-hslider-height-large)");
        });
    });
});
