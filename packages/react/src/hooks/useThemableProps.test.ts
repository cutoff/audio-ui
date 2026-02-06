/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useThemableProps } from "./useThemableProps";

describe("useThemableProps", () => {
    describe("Initialization", () => {
        it("returns style and clampedRoundness with no options", () => {
            const { result } = renderHook(() => useThemableProps({}));

            expect(result.current).toHaveProperty("style");
            expect(result.current).toHaveProperty("clampedRoundness");
            expect(result.current.style).toEqual({});
            expect(result.current.clampedRoundness).toBeUndefined();
        });
    });

    describe("Color", () => {
        it("sets --audioui-primary-color when color is provided", () => {
            const { result } = renderHook(() =>
                useThemableProps({ color: "#ff0000" })
            );

            expect(result.current.style).toHaveProperty(
                "--audioui-primary-color",
                "#ff0000"
            );
            expect(result.current.clampedRoundness).toBeUndefined();
        });

        it("accepts any valid CSS color value", () => {
            const { result } = renderHook(() =>
                useThemableProps({ color: "rgb(0, 128, 255)" })
            );

            expect(result.current.style["--audioui-primary-color"]).toBe(
                "rgb(0, 128, 255)"
            );
        });
    });

    describe("Roundness", () => {
        it("sets --audioui-roundness-base and --audioui-linecap-base when roundness is provided", () => {
            const { result } = renderHook(() =>
                useThemableProps({ roundness: 0.5 })
            );

            expect(result.current.style["--audioui-roundness-base"]).toBe(
                "0.5"
            );
            expect(result.current.style["--audioui-linecap-base"]).toBe("round");
            expect(result.current.clampedRoundness).toBe(0.5);
        });

        it("sets linecap to square when roundness is 0", () => {
            const { result } = renderHook(() =>
                useThemableProps({ roundness: 0 })
            );

            expect(result.current.style["--audioui-roundness-base"]).toBe("0");
            expect(result.current.style["--audioui-linecap-base"]).toBe(
                "square"
            );
            expect(result.current.clampedRoundness).toBe(0);
        });

        it("sets linecap to round when roundness is greater than 0", () => {
            const { result } = renderHook(() =>
                useThemableProps({ roundness: 0.001 })
            );

            expect(result.current.style["--audioui-linecap-base"]).toBe("round");
        });

        it("clamps roundness to 0 when below 0", () => {
            const { result } = renderHook(() =>
                useThemableProps({ roundness: -0.5 })
            );

            expect(result.current.style["--audioui-roundness-base"]).toBe("0");
            expect(result.current.style["--audioui-linecap-base"]).toBe(
                "square"
            );
            expect(result.current.clampedRoundness).toBe(0);
        });

        it("clamps roundness to 1 when above 1", () => {
            const { result } = renderHook(() =>
                useThemableProps({ roundness: 1.5 })
            );

            expect(result.current.style["--audioui-roundness-base"]).toBe("1");
            expect(result.current.style["--audioui-linecap-base"]).toBe("round");
            expect(result.current.clampedRoundness).toBe(1);
        });
    });

    describe("Style merge", () => {
        it("merges user style with CSS variables", () => {
            const { result } = renderHook(() =>
                useThemableProps({
                    color: "blue",
                    style: { width: 100, height: 100 },
                })
            );

            expect(result.current.style["--audioui-primary-color"]).toBe(
                "blue"
            );
            expect(result.current.style.width).toBe(100);
            expect(result.current.style.height).toBe(100);
        });

        it("user style takes precedence over generated CSS variables", () => {
            const { result } = renderHook(() =>
                useThemableProps({
                    color: "red",
                    style: { ["--audioui-primary-color" as string]: "green" },
                })
            );

            expect(result.current.style["--audioui-primary-color"]).toBe(
                "green"
            );
        });
    });

    describe("Combined options", () => {
        it("handles color and roundness together", () => {
            const { result } = renderHook(() =>
                useThemableProps({ color: "#00ff00", roundness: 0.25 })
            );

            expect(result.current.style["--audioui-primary-color"]).toBe(
                "#00ff00"
            );
            expect(result.current.style["--audioui-roundness-base"]).toBe(
                "0.25"
            );
            expect(result.current.style["--audioui-linecap-base"]).toBe("round");
            expect(result.current.clampedRoundness).toBe(0.25);
        });

        it("handles color, roundness, and style together", () => {
            const { result } = renderHook(() =>
                useThemableProps({
                    color: "black",
                    roundness: 1,
                    style: { opacity: 0.8 },
                })
            );

            expect(result.current.style["--audioui-primary-color"]).toBe(
                "black"
            );
            expect(result.current.style["--audioui-roundness-base"]).toBe("1");
            expect(result.current.style["--audioui-linecap-base"]).toBe("round");
            expect(result.current.style.opacity).toBe(0.8);
            expect(result.current.clampedRoundness).toBe(1);
        });
    });
});
