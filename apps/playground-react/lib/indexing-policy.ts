/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

/**
 * Whether the playground should allow public search-engine indexing and crawling.
 *
 * Drives `/robots.txt`, root `metadata.robots`, and `/sitemap.xml` contents (empty sitemap when
 * `false`) so they never contradict.
 *
 * Opt-in through `AUDIOUI_PLAYGROUND_ALLOW_INDEXING` (`true` or `1`), set as a build variable on the production
 * Worker only (`audioui-playground`); staging, preview versions and local builds leave it unset. The site is a
 * static export, so the policy is fixed at build time; the variable is declared in the root `turbo.json` build
 * task so turbo passes it on. Do not rely on `NODE_ENV`: every build, staging included, is a production build.
 *
 * @returns {boolean} `true` when `robots.txt` allows crawling, root HTML `robots` allows
 *   index/follow, and the sitemap lists URLs; `false` otherwise (disallow, noindex, empty
 *   sitemap).
 *
 * @example
 * ```ts
 * process.env.AUDIOUI_PLAYGROUND_ALLOW_INDEXING = "true";
 * isPublicIndexingAllowed(); // true
 *
 * delete process.env.AUDIOUI_PLAYGROUND_ALLOW_INDEXING;
 * isPublicIndexingAllowed(); // false
 * ```
 */
export function isPublicIndexingAllowed(): boolean {
    const optIn = process.env.AUDIOUI_PLAYGROUND_ALLOW_INDEXING;
    return optIn === "true" || optIn === "1";
}
