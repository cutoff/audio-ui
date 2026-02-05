/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useArcAngle } from "./useArcAngle";

describe("useArcAngle", () => {
    it("returns stable object reference when inputs are unchanged", () => {
        const { result, rerender } = renderHook(({ val, open }) => useArcAngle(val, open), {
            initialProps: { val: 0.5, open: 90 },
        });

        const firstResult = result.current;
        rerender({ val: 0.5, open: 90 });
        const secondResult = result.current;

        expect(secondResult).toBe(firstResult); // Object identity check
    });

    it("returns correct values (integration check)", () => {
        const { result } = renderHook(() => useArcAngle(0.5, 90));
        expect(result.current.normalizedValue).toBe(0.5);
        expect(result.current.startAngle).toBe(225);
    });
});
