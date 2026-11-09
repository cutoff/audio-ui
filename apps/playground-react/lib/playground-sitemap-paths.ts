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
 * Title and description of one playground page, as search engines and link previews show them.
 */
export type PlaygroundPageInfo = {
    /** Page title without the site name (the home page's title is used as is). */
    title: string;
    /** Meta description, about 120 to 160 characters, specific to the page. */
    description: string;
    /**
     * Keeps the page out of search engines: left out of the sitemap, `noindex, follow` and no canonical URL in
     * production. For pages with nothing to offer a visitor arriving from a search (placeholders, test frames).
     */
    noindex?: true;
};

/**
 * Every static App Router page (each segment under `app/` with a `page.tsx`), keyed by pathname, with its
 * own title and description. Pathnames carry no trailing slash: Workers static assets serve
 * `/vector-components/knob` and redirect `/vector-components/knob/` to it.
 *
 * Source of the sitemap ({@link PLAYGROUND_SITEMAP_PATHS}, every page not marked `noindex`) and of each page's
 * metadata (`pageMetadata` in `lib/page-metadata.ts`: title, description, self-referencing canonical, Open Graph,
 * Twitter). Keep in sync when adding routes; update sidebar navigation where applicable.
 */
export const PLAYGROUND_PAGES = {
    "/": {
        title: "AudioUI Playground - Interactive Component Showcase",
        description:
            "Interactive playground for AudioUI by Cutoff: explore and test React components for audio and MIDI apps, including knobs, sliders, buttons and piano keyboards.",
    },
    "/dashboard": {
        title: "Dashboard",
        description:
            "Dashboard layout of the AudioUI playground: the sidebar shell with placeholder panels, used to test the app frame around the component demos.",
        noindex: true,
    },
    "/examples/control-surface": {
        title: "Control Surface Example",
        description:
            "A mixer-style control surface built with AudioUI: per-channel pan and gain knobs, level faders and mute and solo buttons, with real scales and units.",
    },
    "/examples/customization": {
        title: "Component Laboratory",
        description:
            "Experiment with custom control components built on AudioUI: pick one from the carousel and test its interaction and visualization live.",
    },
    "/examples/drag-interaction": {
        title: "Drag Interaction Demo",
        description:
            "Drag-in and drag-out behavior of AudioUI buttons: momentary and toggle (latch) buttons, and a step-sequencer pattern set in a single drag.",
    },
    "/examples/editable-disabled": {
        title: "Editable and Disabled Controls",
        description:
            "How the editable and disabled props govern AudioUI controls: editable=false blocks gestures but keeps automation and MIDI live, disabled also mutes callbacks.",
    },
    "/examples/stress-test": {
        title: "Performance Stress Test",
        description:
            "A configurable grid of AudioUI knobs, sliders, buttons and keyboards animated by automatic LFO modulation, to measure rendering performance.",
    },
    "/examples/value-channels": {
        title: "Value Channels",
        description:
            "Bind AudioUI controls through real values, normalized 0..1 or MIDI 0..127: a synth control, a DAW automation lane and a hardware CC mapping side by side.",
    },
    "/examples/webaudio": {
        title: "WebAudio Synthesizer Example",
        description:
            "A monophonic synthesizer built with the Web Audio API and AudioUI knobs, sliders, buttons and keys, playable on screen or from a MIDI keyboard.",
    },
    "/layout/grid-layout": {
        title: "Grid Layout",
        description:
            "AudioUI knobs, sliders, buttons and keys placed in a CSS grid: how adaptive sizing fills cells, spans and alignments without JavaScript.",
    },
    "/layout/sizing": {
        title: "Size System",
        description:
            "The AudioUI size system: Button, Knob, CycleButton, Slider and Keys at every size from xsmall to xlarge, all scaled from one base unit.",
    },
    "/primitives": {
        title: "Primitive Components",
        description:
            "Low-level AudioUI building blocks for custom controls: SVG primitives for rendering, control primitives for interaction, layout primitives for sizing.",
    },
    "/primitives/adaptive-box": {
        title: "AdaptiveBox Layout Primitive",
        description:
            "AdaptiveBox, the CSS layout primitive behind every AudioUI control: scaleToFit and fill modes, container queries, label positioning and HTML overlays.",
    },
    "/primitives/filmstrip": {
        title: "FilmstripImage Primitive",
        description:
            "FilmstripImage shows one frame of a bitmap sprite sheet (filmstrip) from a normalized value, with frame rotation and configurable frame size.",
    },
    "/primitives/label-ring": {
        title: "LabelRing Primitive",
        description:
            "LabelRing places text or icon labels at radial positions around a control: numeric scales, text labels and icons, in radial or upright orientation.",
    },
    "/primitives/ring": {
        title: "ValueRing Primitive",
        description:
            "ValueRing draws the arc that shows a control's value, with bipolar mode and configurable thickness, openness and roundness, as on a knob.",
    },
    "/primitives/rotary": {
        title: "RotaryImage Primitive",
        description:
            "RotaryImage rotates an image or SVG content from a normalized value, sharing the angle logic of ValueRing, for rotating knob graphics.",
    },
    "/primitives/tick-ring": {
        title: "TickRing Primitive",
        description:
            "TickRing draws tick marks around radial controls: count- or step-based positions, line, dot and pill variants, and custom render functions.",
    },
    "/raster-components": {
        title: "Raster Components",
        description:
            "AudioUI controls drawn from bitmaps: image knobs and switches and filmstrip (sprite sheet) controls, with the full layout, parameter and interaction model.",
    },
    "/raster-components/filmstrip-boolean": {
        title: "FilmStrip Boolean Control",
        description:
            "An on/off AudioUI control drawn from a bitmap filmstrip, one frame per state, for switches, buttons and toggles with custom graphics.",
    },
    "/raster-components/filmstrip-continuous": {
        title: "FilmStrip Continuous Control",
        description:
            "A continuous AudioUI control drawn from a bitmap filmstrip (sprite sheet), mapping values to frames, for knobs, VU meters and custom graphics.",
    },
    "/raster-components/filmstrip-discrete": {
        title: "FilmStrip Discrete Control",
        description:
            "A discrete AudioUI control drawn from a bitmap filmstrip, one frame per option, for multi-position switches and selectors with custom graphics.",
    },
    "/raster-components/image-knob": {
        title: "Image Knob",
        description:
            "ImageKnob rotates a bitmap image with a continuous parameter value, with configurable rotation range and openness, for custom knob designs.",
    },
    "/raster-components/image-rotary-switch": {
        title: "Image Rotary Switch",
        description:
            "ImageRotarySwitch turns a bitmap image to discrete positions, one angle per value, for multi-position rotary selectors with custom graphics.",
    },
    "/raster-components/image-switch": {
        title: "Image Switch",
        description:
            "ImageSwitch shows one of two bitmap images by state, in momentary or latch (toggle) mode, for on/off switches and buttons with custom graphics.",
    },
    "/vector-components": {
        title: "Vector Components",
        description:
            "Themeable AudioUI React controls for audio apps and plugins: Knob, vertical and horizontal Slider, CycleButton, Button and Keys, with adaptive sizing.",
    },
    "/vector-components/button": {
        title: "Button",
        description:
            "The AudioUI Button in momentary and latch (toggle) modes, with drag-in and drag-out behavior for step-sequencer patterns and hardware-like play.",
    },
    "/vector-components/cyclebutton": {
        title: "CycleButton",
        description:
            "The AudioUI CycleButton steps through discrete options on each click, with arrow-key stepping and Space or Enter to cycle, as in a waveform selector.",
    },
    "/vector-components/hslider": {
        title: "Horizontal Slider",
        description:
            "The AudioUI Slider in horizontal orientation, for pan controls and left-to-right parameter adjustment with custom ranges and units.",
    },
    "/vector-components/keys": {
        title: "Keys (Piano Keyboard)",
        description:
            "AudioUI Keys, a piano keyboard for MIDI note input and display: configurable key range, octave shift, and classic or themed styles.",
    },
    "/vector-components/knob": {
        title: "Knob",
        description:
            "The AudioUI Knob, a rotary control for continuous parameters: bipolar and unipolar modes, custom value formatting, and variants including icon caps.",
    },
    "/vector-components/vslider": {
        title: "Vertical Slider",
        description:
            "The AudioUI Slider in vertical orientation, for level controls, faders and bottom-to-top parameter adjustment with custom ranges and units.",
    },
} as const satisfies Record<string, PlaygroundPageInfo>;

/** Pathname of a playground page listed in {@link PLAYGROUND_PAGES}. */
export type PlaygroundPath = keyof typeof PLAYGROUND_PAGES;

/**
 * Pathnames of the pages listed in the sitemap: every page of {@link PLAYGROUND_PAGES} not marked `noindex`, in
 * its order. Used only when {@link isPublicIndexingAllowed} is true.
 */
export const PLAYGROUND_SITEMAP_PATHS: readonly PlaygroundPath[] = (
    Object.keys(PLAYGROUND_PAGES) as PlaygroundPath[]
).filter((path) => !(PLAYGROUND_PAGES[path] as PlaygroundPageInfo).noindex);
