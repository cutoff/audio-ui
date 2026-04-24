/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

/**
 * Canonical site origin for absolute URLs in metadata (`metadataBase`, Open Graph, canonical),
 * sitemap entries, and the `Sitemap:` line in `robots.txt`.
 */
export const PLAYGROUND_ORIGIN = "https://playground.cutoff.dev" as const;

/**
 * Pathnames for every static App Router page (each segment under `app/` with a `page.tsx`).
 * Used only when {@link isPublicIndexingAllowed} is true. Keep in sync when adding routes;
 * update sidebar navigation where applicable.
 */
export const PLAYGROUND_SITEMAP_PATHS: readonly string[] = [
    "/",
    "/dashboard",
    "/examples/control-surface",
    "/examples/customization",
    "/examples/drag-interaction",
    "/examples/editable-disabled",
    "/examples/stress-test",
    "/examples/webaudio",
    "/layout/grid-layout",
    "/layout/sizing",
    "/primitives",
    "/primitives/adaptive-box",
    "/primitives/filmstrip",
    "/primitives/label-ring",
    "/primitives/ring",
    "/primitives/rotary",
    "/primitives/tick-ring",
    "/raster-components",
    "/raster-components/filmstrip-boolean",
    "/raster-components/filmstrip-continuous",
    "/raster-components/filmstrip-discrete",
    "/raster-components/image-knob",
    "/raster-components/image-rotary-switch",
    "/raster-components/image-switch",
    "/vector-components",
    "/vector-components/button",
    "/vector-components/cyclebutton",
    "/vector-components/hslider",
    "/vector-components/keys",
    "/vector-components/knob",
    "/vector-components/vslider",
];
