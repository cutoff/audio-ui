/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

/**
 * Whether the playground should allow public search-engine indexing and crawling.
 *
 * Drives `/robots.txt`, root `metadata.robots`, and `/sitemap.xml` contents (empty sitemap when
 * `false`) so they never contradict.
 *
 * **Vercel:** `VERCEL_ENV` is `production` only on the production deployment. Preview
 * deployments use `preview` even though `NODE_ENV` is `production`, so do not rely on
 * `NODE_ENV` alone for this policy.
 *
 * **Self-hosted / non-Vercel:** set `AUDIOUI_PLAYGROUND_ALLOW_INDEXING=true` on the
 * production host when `VERCEL_ENV` is not available.
 *
 * @returns {boolean} `true` when `robots.txt` allows crawling, root HTML `robots` allows
 *   index/follow, and the sitemap lists URLs; `false` otherwise (disallow, noindex, empty
 *   sitemap), except when opt-in env is set on non-Vercel production hosts.
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
