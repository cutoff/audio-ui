# Contributor Experience

This document supports the documentation website team when writing or linking to content for people who contribute to the AudioUI project. It summarizes how the repository is set up and how contributors develop and validate changes. The tone is factual and centered on what the project offers to contributors.

---

## 1. Repository and Tooling

- **Monorepo**: pnpm workspaces. Main packages: `@cutoff/audio-ui-react` (React library), `@cutoff/audio-ui-core` (framework-agnostic core), `playground-react` (Next.js playground app).
- **Package manager**: pnpm. Commands are run from the **repository root** unless otherwise noted.
- **Key scripts** (root):
  - `pnpm dev` — Starts the Next.js playground for developing and visually testing components.
  - `pnpm build` — Builds the library and core.
  - `pnpm typecheck` — TypeScript check across the monorepo.
  - `pnpm lint` — ESLint (and `lint:css` for Stylelint in the React package).
  - `pnpm test` — Vitest for the library and core.
  - `pnpm check` — Full verification: install, then typecheck, build, lint, test. Standard run before submitting changes.
  - `pnpm format` — Prettier across the repo.

Contributors run `pnpm dev` at root for day-to-day development and `pnpm check` before submitting changes.

---

## 2. Playground vs Public Documentation

- **Playground** (`apps/playground-react`): Internal app for developing and testing components. It uses the workspace library (no `pnpm link` needed). Routes include vector-components, raster-components, primitives, layout, and examples. Theme controls (color, roundness, light/dark) live in the header. The playground is not the public documentation site.
- **Public documentation**: The final developer-facing docs (MDX, live components) live in a separate website monorepo. The playground is the source for examples and behavior; the docs site is the canonical place for end-user “how to use AudioUI” content.

When documenting contribution workflows, clarify that the playground is for development and validation; the external docs site is what library users see.

---

## 3. Library Structure (React Package)

- **Entry point**: `packages/react/src/index.ts` — all public components, hooks, types, theme utilities, and re-exports from core (formatters, note utils, AudioParameter) are exported from here.
- **Path aliases** (internal): The library uses `@/primitives/*`, `@/hooks/*`, `@/defaults/*`, `@/utils/*`, `@/types` for clean imports. Consumer-facing docs only need to show imports from `@cutoff/audio-ui-react`.
- **Component layers**: Built-in (Knob, Slider, Button, CycleButton, Keys), generic (FilmStrip*, ImageKnob, ImageSwitch, etc.), and primitives (ContinuousControl, DiscreteControl, SVG primitives). Docs can describe this as “ready-to-use → customizable → build-your-own.”

---

## 4. Quality and Conventions

- **Code and docs**: Strict TypeScript, Prettier, ESLint, Stylelint. JSDoc is required for public APIs; READMEs include overview, install, usage, and API summary where relevant.
- **Documentation tone**: Present tense, declarative (e.g. “Knob uses ContinuousControl”). The project avoids “evolution” phrasing in favor of current state.
- **CI**: GitHub Actions run on push/PR (e.g. to `main`): install, typecheck, build, lint, test. Contribution docs can reference `pnpm check` and CI as the bar for acceptance.

---

## 5. Where to Find More Detail

- **Root**: `README.md` — getting started, scripts, licensing.
- **Library**: `packages/react/README.md` — development setup, structure, path aliases, adding components. `packages/react/AGENTS.md` — internal quick reference (exports, architecture, conventions).
- **Technical deep-dives**: `packages/react/docs/` — e.g. `color-system.md`, `interaction-system.md`, `size-system.md`, `adaptive-box-layout.md`, `svg-view-primitives.md`, `parameter-specs.md`.
- **Releases**: `docs/releases/` — `next.md` and versioned release notes.
