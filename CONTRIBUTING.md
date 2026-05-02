# Contributing to AudioUI

Thanks for your interest in contributing to **AudioUI by Cutoff** — an open-source React component
library for audio and MIDI applications. This document covers how to report issues, propose changes,
set up a local environment, and get a pull request merged.

AudioUI is currently in **Developer Preview**. APIs are stabilizing but breaking changes remain
acceptable, and we are actively seeking community feedback.

---

## Code of Conduct

Participation in the project is governed by the brief
[Community Standards](./CODE_OF_CONDUCT.md): be respectful, be helpful, stay on topic, use
common sense.

---

## Ways to Contribute

| Channel                                                              | Use For                                                              |
| -------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [GitHub Issues](https://github.com/cutoff/audio-ui/issues)           | Bug reports and defects                                              |
| [GitHub Discussions](https://github.com/cutoff/audio-ui/discussions) | Feature requests, wishlist voting, design questions                  |
| [Discord](https://discord.gg/7RB6t2xqYW)                             | Real-time chat, general support, announcements                       |
| GitHub Security tab                                                  | **Private** vulnerability reports — see [SECURITY.md](./SECURITY.md) |
| Pull requests                                                        | Code, documentation, tests, and benchmarks                           |

Do **not** open public issues or PRs that describe undisclosed security vulnerabilities; use
GitHub's private vulnerability reporting instead.

### Filing a good bug report

Include:

- AudioUI version (`@cutoff/audio-ui-react` and `@cutoff/audio-ui-core`).
- React version and host framework (Vite, Next.js, Tauri, JUCE WebUI, etc.).
- A minimal reproduction — the smaller, the faster it gets fixed. The
  [CDN sandbox template](https://cutoff.dev/audio-ui/templates/cdn-sandbox.html) works well for
  quick repros.
- Expected vs actual behavior, and steps to reproduce.

### Proposing a feature

Open a discussion before opening a PR for anything non-trivial. Component APIs in this library are
designed against an analysis of real audio plugins and DAWs; aligning on scope and shape upfront
saves cycles for everyone.

---

## Licensing and the CLA

AudioUI is **dual-licensed**:

- **GPL-3.0-only** for open-source use.
- **Tylium Evolutive License Framework (TELF)** for proprietary, closed-source applications, with
  professional support. Commercial licenses are available at
  [cutoff.dev](https://cutoff.dev).

Because the project is dual-licensed, **all contributors must sign the Contributor License
Agreement (CLA)** in [`license-telf/CLA.md`](./license-telf/CLA.md) before their code can be merged.
The CLA grants the project the rights it needs to distribute your contribution under both license
tiers. Signing happens once, covers all future contributions, and does not transfer ownership.

By submitting a pull request you confirm that:

1. You have the right to contribute the code (it is your own work, or you have authorization).
2. You agree to license it under the project's dual-license terms via the CLA.
3. New source files include the standard SPDX header:
   `SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF`.

---

## Project Layout

This is a `pnpm` + Turbo monorepo:

```
packages/core/          @cutoff/audio-ui-core   — framework-agnostic logic (pure TS)
packages/react/         @cutoff/audio-ui-react  — React component library (published to npm)
apps/playground-react/  Next.js playground for development and visual testing
agents/                 Project conventions (TS, React, docs, commands)
docs/                   Release notes, internal notes, topics
license-telf/           Dual-license documents (TELF, GPL-3.0, CLA, SLA)
scripts/                Versioning and release scripts
```

**Architectural rule**: `packages/core/` must never import from any UI framework.
`packages/react/` depends on core and adds React-specific components, hooks, and adapters. Future
framework implementations (Solid, Vue, etc.) would follow the same pattern.

The library ships **client components only** — every component file in `packages/react/` starts
with `"use client";`. The playground app uses Server Components by default and opts into
`"use client"` only where interactivity is needed.

---

## Local Development

### Prerequisites

- **Node.js**: 18 or 20 (CI runs both).
- **pnpm**: 10.28.2 (declared in `packageManager`; use `corepack enable` to pin automatically).
- A modern browser for visual checks (light and dark mode).

### Setup

```bash
git clone https://github.com/cutoff/audio-ui.git
cd audio-ui
pnpm install
pnpm dev
```

`pnpm dev` runs the playground at `apps/playground-react`. Always run dev from the repo root —
not from inside the playground — so Turbo wires up the workspace correctly.

### Common Scripts

| Command                       | What it does                                                                                       |
| ----------------------------- | -------------------------------------------------------------------------------------------------- |
| `pnpm dev`                    | Run the Next.js playground (Turbopack).                                                            |
| `pnpm build`                  | Build all packages (Vite 6 for libraries, Next.js for the playground).                             |
| `pnpm typecheck`              | TypeScript across the monorepo.                                                                    |
| `pnpm test`                   | Vitest 3 unit and render-count tests.                                                              |
| `pnpm lint` / `pnpm lint:fix` | ESLint across packages.                                                                            |
| `pnpm format`                 | Prettier (`.prettierrc.json`).                                                                     |
| `pnpm bench`                  | Local microbenchmarks (tinybench) for hot paths.                                                   |
| `pnpm size`                   | `size-limit` budget check on the published bundle.                                                 |
| `pnpm check`                  | The full quality pipeline: install + typecheck + build + lint + test. **Run this before pushing.** |
| `pnpm clean`                  | Remove `node_modules`, `.turbo`, and Turbo build outputs.                                          |

---

## Coding Standards

The full conventions live in the `agents/` directory; the highlights:

- **TypeScript strict mode** — no `any`, prefix unused parameters with `_`, prefer `interface` for
  shapes. See `agents/typescript-guidelines-2.0.md`.
- **Formatting**: 4-space indent, 120-char line limit, double-quoted strings, semicolons required,
  ES5 trailing commas. Prettier owns this — run `pnpm format`.
- **Naming**: `camelCase` for variables/functions, `PascalCase` for components/classes/interfaces
  (no `I` prefix), `UPPER_SNAKE_CASE` for true constants.
- **Imports**, in order: React → third-party → project absolute → relative → CSS.
- **React patterns**: function components with JSDoc props; hooks over class components; memoize
  list children; declarative refs for mutable state in interaction code. See
  `agents/react-conventions-2.0.md`.
- **No Radix primitives** — UI components in the playground use shadcn/ui via
  `pnpm dlx shadcn@latest add [component]`. Library components are bespoke.
- **Documentation**: present-tense, declarative voice. **Avoid evolution phrasing** — words like
  "now", "recently", "changed", "updated", "introduced", "added", "removed". Write
  _"Knob uses ContinuousControl"_, not _"Knob now uses ContinuousControl"_.
- **No backward-compat scaffolding**: the project is in Developer Preview. Don't write migration
  guides, don't keep deprecated APIs around, don't add legacy shims. Make breaking changes cleanly.
- **JSDoc** is required on all exported APIs (`@param`, `@returns`, `@example` where helpful). See
  `agents/documentation-standards-2.0.md`.

### React Compatibility

The library targets **React 18.2+** as a minimum and is compatible with **React 19**. Develop
against React 18 — `devDependencies` stay on `@types/react@^18.x`. Do **not** use React 19-only
APIs (`use()`, `useFormStatus`, `useOptimistic`, Server Actions) inside `packages/react/`. CI
verifies both versions in a 2×2 matrix (Node 18/20 × React 18/19).

### Library CSS Scoping

Library stylesheets must **never** affect the host application. Two rules:

1. Every selector is scoped to `.audioui` or `.audioui-*` (e.g. `.audioui svg text`). No
   unqualified element selectors (`input`, `svg`, `text`, …) in library CSS.
2. Every exported component that renders library UI applies `CLASSNAMES.root` (`.audioui`) on
   its root element.

See `agents/audioui-styling-system.md` for the complete styling system and Stylelint enforcement.

### Performance Mandate

Audio runtimes have hard performance constraints. Treat performance as a first-class review
criterion:

- Minimize re-renders; prefer refs for transient state.
- Avoid JS-driven layout — `AdaptiveBox` is CSS-only by design.
- O(1) lookups for discrete parameters; memoize derived styles.
- Bind global event listeners lazily (only during drag).

Microbenchmarks live in `packages/<pkg>/bench/` as `*.bench.ts` files. Run them locally with
`pnpm bench`. CI runs the same suite under **CodSpeed** (Valgrind/cachegrind instrumentation,
hardware-agnostic) on every push to `main` and `develop`. Reviewers consult the dashboard at
[codspeed.io/cutoff/audio-ui](https://codspeed.io/cutoff/audio-ui) and flag any benchmark with
**> 2% instruction-count regression**.

If your change touches a hot path that isn't yet benched, adding a `*.bench.ts` next to the source
is a welcome part of the PR.

---

## Tests

- Unit tests live colocated as `*.test.tsx` next to source.
- Render-count regression fixtures live under `packages/react/test/render-count/` so they don't
  ship in `dist/`.
- Mock external dependencies; avoid real timers where deterministic alternatives exist.
- Tests must pass under both React 18 and 19.

Run the full test suite with `pnpm test`, or scope to a package with
`pnpm --filter @cutoff/audio-ui-react test`.

---

## Branching, Commits, and PR Workflow

### Branches

- `main` — release line. Pushes here trigger milestone publishes.
- `develop` — integration branch. Pushes here auto-publish unstable snapshots to npm under the
  `unstable` dist-tag (`1.0.0-unstable.YYYYMMDD.HHMM.<shortsha>`).
- Feature/bugfix branches — short-lived, branched from `develop`.

**Always branch from `develop`** for feature work. PRs target `develop`. Maintainers merge
`develop` → `main` to cut releases.

### Commits

- Keep commits focused and meaningful — squash noise locally before pushing.
- No Conventional Commits requirement, no `Co-Authored-By` trailers.
- Don't bump `package.json` versions in your PR. All branches stay at `1.0.0-dev`; releases are
  prepared by maintainers via the `release:*` scripts.

### Pull Requests

Before opening a PR:

1. Branch from up-to-date `develop`.
2. Run `pnpm check` and confirm it's clean.
3. Run `pnpm format` to apply Prettier.
4. Add or update tests for behavior changes.
5. If your change is user-visible (new feature, breaking change, fix, perf improvement), add an
   entry to **`docs/releases/next.md`** in the appropriate section. See
   `docs/releases/AGENTS.md` for the format.
6. Update `agents/` and `AGENTS.md` if your change affects project conventions, structure, or
   architecture.
7. Verify the playground visually in **both light and dark mode**, on desktop **and** at touch
   sizes if you touched interaction code.

In the PR description:

- State the problem and the solution. Link related issues / discussions.
- Note any deliberate trade-offs and call out anything you'd like extra eyes on.
- Include screenshots or short screen recordings for visual changes.
- For performance-sensitive changes, link the relevant CodSpeed comparison.

### CI Checks

PRs run the full quality pipeline against the Node × React matrix, plus a `size-limit` bundle-size
gate that posts a diff comment. CodSpeed publishes per-commit benchmark results that reviewers
compare against `develop`.

---

## Release Process (Maintainer Reference)

Contributors don't need to run any of these — included here so the version policy is
unsurprising.

- **Development**: all branches stay at `1.0.0-dev` (Maven-style snapshot suffix).
- **Unstable**: pushes to `develop` auto-publish `1.0.0-unstable.YYYYMMDD.HHMM.<shortsha>` to npm
  under the `unstable` tag.
- **Preview**: `pnpm release:prepare preview` cuts a `1.0.0-preview.YYYYMMDD.HHMM` version,
  published to the `preview` tag on push to `main`.
- **Developer Preview milestones**: `pnpm release:prepare dp` produces `1.0.0-dp.X` releases on
  the `preview` tag.
- **Stable**: `pnpm release:prepare patch|minor|major` produces `1.y.z` releases on the `latest`
  tag.

Full details in `agents/audioui-versioning-guidelines.md`.

---

## Where to Read Next

- `AGENTS.md` — primary technical reference for the project (architecture, interaction system,
  theming, sizing, SVG primitives).
- `packages/react/AGENTS.md` and `apps/playground-react/AGENTS.md` — package-specific extensions.
- `packages/react/docs/interaction-system.md` — interaction architecture and design decisions.
- `packages/react/docs/svg-view-primitives.md` — composing custom radial and linear controls.
- `agents/audioui-styling-system.md` — styling conventions and Stylelint enforcement.
- The live [playground](https://playground.cutoff.dev) and
  [documentation](https://cutoff.dev/audio-ui/docs) for end-user perspective.

---

Thanks for helping make AudioUI better. If anything in this guide is unclear or out of date, open
an issue or a PR — improvements to contributor docs are very welcome.
