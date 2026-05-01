/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import { bench, describe } from "vitest";
import { calculateArcPath } from "../utils/svg";

describe("calculateArcPath", () => {
    bench("standard knob arc (counter-clockwise)", () => {
        calculateArcPath(50, 50, 225, 495, 30);
    });

    bench("standard knob arc (clockwise)", () => {
        calculateArcPath(50, 50, 225, 495, 30, "clockwise");
    });

    bench("small arc (less than 180 degrees)", () => {
        calculateArcPath(50, 50, 225, 360, 30);
    });

    bench("large arc (more than 180 degrees)", () => {
        calculateArcPath(50, 50, 180, 540, 30);
    });

    bench("full circle arc", () => {
        calculateArcPath(50, 50, 0, 359, 30);
    });
});
