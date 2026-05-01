/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import { bench, describe } from "vitest";
import {
    clampNormalized,
    translateKnobRoundness,
    translateKnobThickness,
    translateSliderRoundness,
    translateSliderThickness,
    translateButtonRoundness,
    translateKeysRoundness,
} from "../utils/normalizedProps";

describe("clampNormalized", () => {
    bench("clamp value within range", () => {
        clampNormalized(0.5);
    });

    bench("clamp value below range", () => {
        clampNormalized(-0.5);
    });

    bench("clamp value above range", () => {
        clampNormalized(1.5);
    });
});

describe("translateKnobRoundness", () => {
    bench("translate zero (square)", () => {
        translateKnobRoundness(0);
    });

    bench("translate non-zero (round)", () => {
        translateKnobRoundness(0.7);
    });
});

describe("translateKnobThickness", () => {
    bench("translate mid-range thickness", () => {
        translateKnobThickness(0.5);
    });
});

describe("translateSliderRoundness", () => {
    bench("translate mid-range roundness", () => {
        translateSliderRoundness(0.5);
    });
});

describe("translateSliderThickness", () => {
    bench("translate mid-range thickness", () => {
        translateSliderThickness(0.5);
    });
});

describe("translateButtonRoundness", () => {
    bench("translate mid-range roundness", () => {
        translateButtonRoundness(0.5);
    });
});

describe("translateKeysRoundness", () => {
    bench("translate mid-range roundness", () => {
        translateKeysRoundness(0.5);
    });
});
