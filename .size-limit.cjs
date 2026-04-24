/**
 * Bundle-size budgets for the two publishable packages.
 *
 * Sizes are brotli-compressed (size-limit v12 default). JS entries are
 * measured with esbuild to approximate a consumer's tree-shaken bundle;
 * CSS entries are measured as plain files.
 *
 * Budgets sit comfortably above the current size. They act as a ceiling
 * against accidental bloat (e.g. a heavy util lib slipping in), not as
 * a tight per-commit regression fence. Tighten once baselines have been
 * stable for a few PRs. Run `pnpm size` to see current values.
 */
module.exports = [
    // --- @cutoff/audio-ui-core -----------------------------------------
    {
        name: "@cutoff/audio-ui-core · index.js",
        path: "packages/core/dist/index.js",
        import: "*",
        limit: "8 kB",
    },
    {
        name: "@cutoff/audio-ui-core · styles.css",
        path: "packages/core/dist/styles/styles.css",
        limit: "2.5 kB",
    },
    {
        name: "@cutoff/audio-ui-core · themes.css",
        path: "packages/core/dist/styles/themes.css",
        limit: "1.5 kB",
    },

    // --- @cutoff/audio-ui-react ----------------------------------------
    {
        name: "@cutoff/audio-ui-react · index.js",
        path: "packages/react/dist/index.js",
        import: "*",
        ignore: ["react", "react-dom", "react/jsx-runtime"],
        limit: "22 kB",
    },
    {
        name: "@cutoff/audio-ui-react · style.css",
        path: "packages/react/dist/style.css",
        limit: "2.5 kB",
    },
    {
        name: "@cutoff/audio-ui-react · style-no-font.css",
        path: "packages/react/dist/style-no-font.css",
        limit: "2.5 kB",
    },
];
