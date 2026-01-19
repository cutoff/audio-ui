/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

/**
 * Standard sensitivity for continuous controls.
 * Represents normalized value change per pixel of drag.
 * 0.005 means 200 pixels for a full 0-1 sweep.
 * This aligns with standard "virtual throw" in audio software.
 */
export const DEFAULT_CONTINUOUS_SENSITIVITY = 0.005;

/**
 * Standard sensitivity for wheel interactions.
 * Represents normalized value change per unit of wheel delta.
 */
export const DEFAULT_WHEEL_SENSITIVITY = 0.005;

/**
 * Target pixels per discrete step.
 * Used for adaptive sensitivity: if a step exists, we ensure
 * it doesn't take more than this many pixels to traverse it.
 * This prevents "dead zones" in low-resolution parameters.
 */
export const TARGET_PIXELS_PER_STEP = 30;

/**
 * Default step size for keyboard interaction (normalized 0..1).
 */
export const DEFAULT_KEYBOARD_STEP = 0.05;
