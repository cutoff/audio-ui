/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import { bench, describe } from "vitest";
import { polarToCartesian, calculateArcAngles, calculateLinearPosition } from "../utils/math";

describe("polarToCartesian", () => {
    bench("convert polar to cartesian at 0 degrees", () => {
        polarToCartesian(50, 50, 30, 0);
    });

    bench("convert polar to cartesian at 360 degrees (12 o'clock)", () => {
        polarToCartesian(50, 50, 30, 360);
    });

    bench("convert polar to cartesian at 225 degrees (7:30)", () => {
        polarToCartesian(50, 50, 30, 225);
    });
});

describe("calculateArcAngles", () => {
    bench("standard knob at 50%", () => {
        calculateArcAngles(0.5, 90);
    });

    bench("bipolar knob at center", () => {
        calculateArcAngles(0.5, 90, 0, true);
    });

    bench("discrete 5-position switch", () => {
        calculateArcAngles(0.37, 90, 0, false, 5);
    });

    bench("full rotation knob at 75%", () => {
        calculateArcAngles(0.75, 0);
    });

    bench("knob with rotation offset", () => {
        calculateArcAngles(0.5, 90, 45);
    });
});

describe("calculateLinearPosition", () => {
    bench("slider at 50%", () => {
        calculateLinearPosition(150, 260, 0.5);
    });

    bench("slider at 0% (minimum)", () => {
        calculateLinearPosition(150, 260, 0);
    });

    bench("slider at 100% (maximum)", () => {
        calculateLinearPosition(150, 260, 1);
    });
});
