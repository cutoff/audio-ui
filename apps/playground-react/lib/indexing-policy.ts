/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

/**
 * Whether the playground should allow public search-engine indexing and crawling.
 *
 * Drives both `/robots.txt` and root `metadata.robots` so they never contradict.
 *
 * **Vercel:** `VERCEL_ENV` is `production` only on the production deployment. Preview
 * deployments use `preview` even though `NODE_ENV` is `production`, so do not rely on
 * `NODE_ENV` alone for this policy.
 *
 * **Self-hosted / non-Vercel:** set `AUDIOUI_PLAYGROUND_ALLOW_INDEXING=true` on the
 * production host when `VERCEL_ENV` is not available.
 *
 * @returns {boolean} `true` when crawling and HTML robots meta should allow indexing; `false`
 *   for preview, local dev, and other non-production deployments (unless opt-in is set).
 *
 * @example
 * ```ts
 * // Vercel production (set by platform)
 * process.env.VERCEL_ENV = "production";
 * isPublicIndexingAllowed(); // true
 *
 * // Preview or local: disallow unless opt-in
 * delete process.env.VERCEL_ENV;
 * process.env.AUDIOUI_PLAYGROUND_ALLOW_INDEXING = "true";
 * isPublicIndexingAllowed(); // true
 * ```
 */
export function isPublicIndexingAllowed(): boolean {
    if (process.env.VERCEL_ENV === "production") {
        return true;
    }
    const optIn = process.env.AUDIOUI_PLAYGROUND_ALLOW_INDEXING;
    return optIn === "true" || optIn === "1";
}
