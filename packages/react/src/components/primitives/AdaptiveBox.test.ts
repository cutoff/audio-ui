/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

import { describe, it, expect } from "vitest";
import { computeAdaptiveBoxLayout } from "./AdaptiveBox";

describe("computeAdaptiveBoxLayout", () => {
    it("returns a single 1fr row with no label space when labelMode is none", () => {
        const out = computeAdaptiveBoxLayout({
            viewBoxHeight: 100,
            labelHeightUnits: 15,
            labelMode: "none",
            effectiveLabelPosition: "below",
        });
        expect(out.showLabelSpace).toBe(false);
        expect(out.combinedHeightUnits).toBe(100);
        expect(out.gridTemplateRows).toBe("1fr");
        expect(out.mainContentGridRow).toBe("1 / 2");
    });

    it("reserves label space below when labelMode is visible and labelPosition is below", () => {
        const out = computeAdaptiveBoxLayout({
            viewBoxHeight: 100,
            labelHeightUnits: 15,
            labelMode: "visible",
            effectiveLabelPosition: "below",
        });
        expect(out.showLabelSpace).toBe(true);
        expect(out.combinedHeightUnits).toBe(115);
        // svg row first, label row second
        expect(out.gridTemplateRows).toBe(`${(100 / 115) * 100}% ${(15 / 115) * 100}%`);
        expect(out.mainContentGridRow).toBe("1 / 2");
    });

    it("places label row first when effectiveLabelPosition is above", () => {
        const out = computeAdaptiveBoxLayout({
            viewBoxHeight: 100,
            labelHeightUnits: 15,
            labelMode: "visible",
            effectiveLabelPosition: "above",
        });
        expect(out.gridTemplateRows).toBe(`${(15 / 115) * 100}% ${(100 / 115) * 100}%`);
        expect(out.mainContentGridRow).toBe("2 / 3");
    });

    it("treats hidden labelMode the same as visible for layout reservation", () => {
        const visible = computeAdaptiveBoxLayout({
            viewBoxHeight: 100,
            labelHeightUnits: 15,
            labelMode: "visible",
            effectiveLabelPosition: "below",
        });
        const hidden = computeAdaptiveBoxLayout({
            viewBoxHeight: 100,
            labelHeightUnits: 15,
            labelMode: "hidden",
            effectiveLabelPosition: "below",
        });
        expect(hidden).toEqual(visible);
    });
});
