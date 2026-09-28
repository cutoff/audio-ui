/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { SineWaveIcon, TriangleWaveIcon, SquareWaveIcon, SawWaveIcon } from "./SampleIcons";
import * as library from "../../index";

const icons = { SineWaveIcon, TriangleWaveIcon, SquareWaveIcon, SawWaveIcon };

describe("Waveform icons", () => {
    for (const [name, Icon] of Object.entries(icons)) {
        it(`${name} renders an SVG and forwards its props`, () => {
            const { container } = render(<Icon className="wave" data-testid={name} style={{ width: 20 }} />);
            const svg = container.querySelector("svg");
            expect(svg).not.toBeNull();
            expect(svg?.getAttribute("class")).toBe("wave");
            expect(svg?.getAttribute("data-testid")).toBe(name);
            expect(svg?.style.width).toBe("20px");
            expect(svg?.style.fillRule).toBe("evenodd");
        });

        it(`${name} is exported by the package`, () => {
            expect((library as Record<string, unknown>)[name]).toBe(Icon);
        });
    }
});

describe("Interaction hooks", () => {
    it("are exported by the package for custom components", () => {
        for (const hook of ["useContinuousInteraction", "useDiscreteInteraction", "useBooleanInteraction"]) {
            expect(typeof (library as Record<string, unknown>)[hook]).toBe("function");
        }
    });
});
