/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
    setThemeColor,
    setThemeRoundness,
    setThemeThickness,
    setTheme,
    getThemeColor,
    getThemeRoundness,
    getThemeThickness,
} from "./theme";

describe("theme utilities", () => {
    beforeEach(() => {
        // Clear any existing CSS variables before each test
        if (typeof document !== "undefined") {
            document.documentElement.style.removeProperty("--audioui-primary-color");
            document.documentElement.style.removeProperty("--audioui-roundness-base");
            document.documentElement.style.removeProperty("--audioui-thickness-base");
        }
    });

    afterEach(() => {
        // Clean up after each test
        if (typeof document !== "undefined") {
            document.documentElement.style.removeProperty("--audioui-primary-color");
            document.documentElement.style.removeProperty("--audioui-roundness-base");
            document.documentElement.style.removeProperty("--audioui-thickness-base");
        }
    });

    describe("setThemeColor", () => {
        it("sets the primary color CSS variable", () => {
            setThemeColor("blue");
            expect(
                window.getComputedStyle(document.documentElement).getPropertyValue("--audioui-primary-color").trim()
            ).toBe("blue");
        });

        it("handles CSS variable references", () => {
            setThemeColor("var(--audioui-theme-blue)");
            expect(
                window.getComputedStyle(document.documentElement).getPropertyValue("--audioui-primary-color").trim()
            ).toBe("var(--audioui-theme-blue)");
        });

        it("handles server-side rendering (no document)", () => {
            const originalDocument = globalThis.document;
            // @ts-expect-error - intentionally removing document for SSR test
            delete (globalThis as { document?: typeof document }).document;
            expect(() => setThemeColor("blue")).not.toThrow();
            (globalThis as { document: typeof document }).document = originalDocument;
        });
    });

    describe("setThemeRoundness", () => {
        it("sets the roundness CSS variable", () => {
            setThemeRoundness(0.5);
            expect(
                window.getComputedStyle(document.documentElement).getPropertyValue("--audioui-roundness-base").trim()
            ).toBe("0.5");
        });

        it("handles server-side rendering (no document)", () => {
            const originalDocument = globalThis.document;
            // @ts-expect-error - intentionally removing document for SSR test
            delete (globalThis as { document?: typeof document }).document;
            expect(() => setThemeRoundness(0.5)).not.toThrow();
            (globalThis as { document: typeof document }).document = originalDocument;
        });
    });

    describe("setThemeThickness", () => {
        it("sets the thickness CSS variable", () => {
            setThemeThickness(0.6);
            expect(
                window.getComputedStyle(document.documentElement).getPropertyValue("--audioui-thickness-base").trim()
            ).toBe("0.6");
        });

        it("handles server-side rendering (no document)", () => {
            const originalDocument = globalThis.document;
            // @ts-expect-error - intentionally removing document for SSR test
            delete (globalThis as { document?: typeof document }).document;
            expect(() => setThemeThickness(0.6)).not.toThrow();
            (globalThis as { document: typeof document }).document = originalDocument;
        });
    });

    describe("setTheme", () => {
        it("sets multiple theme values at once", () => {
            setTheme({ color: "red", roundness: 0.7, thickness: 0.8 });
            expect(
                window.getComputedStyle(document.documentElement).getPropertyValue("--audioui-primary-color").trim()
            ).toBe("red");
            expect(
                window.getComputedStyle(document.documentElement).getPropertyValue("--audioui-roundness-base").trim()
            ).toBe("0.7");
            expect(
                window.getComputedStyle(document.documentElement).getPropertyValue("--audioui-thickness-base").trim()
            ).toBe("0.8");
        });

        it("sets only provided values", () => {
            setTheme({ color: "green" });
            expect(
                window.getComputedStyle(document.documentElement).getPropertyValue("--audioui-primary-color").trim()
            ).toBe("green");
            // Roundness and thickness should remain unchanged (or be default)
        });

        it("handles server-side rendering (no document)", () => {
            const originalDocument = globalThis.document;
            // @ts-expect-error - intentionally removing document for SSR test
            delete (globalThis as { document?: typeof document }).document;
            expect(() => setTheme({ color: "blue" })).not.toThrow();
            (globalThis as { document: typeof document }).document = originalDocument;
        });
    });

    describe("getThemeColor", () => {
        it("returns the current theme color", () => {
            setThemeColor("purple");
            expect(getThemeColor()).toBe("purple");
        });

        it("returns null if color is not set", () => {
            document.documentElement.style.removeProperty("--audioui-primary-color");
            expect(getThemeColor()).toBeNull();
        });

        it("returns null on server-side", () => {
            const originalDocument = globalThis.document;
            // @ts-expect-error - intentionally removing document for SSR test
            delete (globalThis as { document?: typeof document }).document;
            expect(getThemeColor()).toBeNull();
            (globalThis as { document: typeof document }).document = originalDocument;
        });
    });

    describe("getThemeRoundness", () => {
        it("returns the current theme roundness", () => {
            setThemeRoundness(0.4);
            expect(getThemeRoundness()).toBe(0.4);
        });

        it("returns null if roundness is not set", () => {
            document.documentElement.style.removeProperty("--audioui-roundness-base");
            expect(getThemeRoundness()).toBeNull();
        });

        it("returns null on server-side", () => {
            const originalDocument = globalThis.document;
            // @ts-expect-error - intentionally removing document for SSR test
            delete (globalThis as { document?: typeof document }).document;
            expect(getThemeRoundness()).toBeNull();
            (globalThis as { document: typeof document }).document = originalDocument;
        });
    });

    describe("getThemeThickness", () => {
        it("returns the current theme thickness", () => {
            setThemeThickness(0.5);
            expect(getThemeThickness()).toBe(0.5);
        });

        it("returns null if thickness is not set", () => {
            document.documentElement.style.removeProperty("--audioui-thickness-base");
            expect(getThemeThickness()).toBeNull();
        });

        it("returns null on server-side", () => {
            const originalDocument = globalThis.document;
            // @ts-expect-error - intentionally removing document for SSR test
            delete (globalThis as { document?: typeof document }).document;
            expect(getThemeThickness()).toBeNull();
            (globalThis as { document: typeof document }).document = originalDocument;
        });
    });
});
