/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import { bench, describe } from "vitest";
import {
    calculateCenterValue,
    bipolarFormatter,
    midiBipolarFormatter,
    withUnit,
    withPrecision,
    combineFormatters,
    percentageFormatter,
    frequencyFormatter,
} from "../utils/valueFormatters";

describe("calculateCenterValue", () => {
    bench("bipolar MIDI range", () => {
        calculateCenterValue(-64, 63);
    });

    bench("standard 0-100 range", () => {
        calculateCenterValue(0, 100);
    });
});

describe("bipolarFormatter", () => {
    bench("format positive value", () => {
        bipolarFormatter(50);
    });

    bench("format negative value", () => {
        bipolarFormatter(-50);
    });

    bench("format zero", () => {
        bipolarFormatter(0);
    });
});

describe("midiBipolarFormatter", () => {
    bench("format MIDI bipolar value", () => {
        midiBipolarFormatter(67, 0, 127);
    });
});

describe("withUnit", () => {
    const dbFormatter = withUnit("dB");

    bench("append dB unit", () => {
        dbFormatter(-6.0);
    });
});

describe("withPrecision", () => {
    const twoDecimals = withPrecision(2);

    bench("format with 2 decimal places", () => {
        twoDecimals(3.14159);
    });
});

describe("combineFormatters", () => {
    const formatter = combineFormatters(withPrecision(1), withUnit("dB"));

    bench("combined precision + unit formatter", () => {
        formatter(-6.02);
    });
});

describe("percentageFormatter", () => {
    bench("format percentage from 0-100 range", () => {
        percentageFormatter(50, 0, 100);
    });

    bench("format percentage from 0-200 range", () => {
        percentageFormatter(75, 0, 200);
    });
});

describe("frequencyFormatter", () => {
    bench("format frequency in Hz", () => {
        frequencyFormatter(440);
    });

    bench("format frequency in kHz", () => {
        frequencyFormatter(15000);
    });

    bench("format frequency at boundary (1000 Hz)", () => {
        frequencyFormatter(1000);
    });
});
