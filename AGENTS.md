**Version**: 2.0 | **Meta**: React component library for audio and MIDI applications (never released); monorepo structure with library and playground-app.

**IMPORTANT: Documentation File Structure**

- This file (AGENTS.md) is the primary documentation file for LLMs.
- CLAUDE.md and GEMINI.md are symbolic links to this file.
- Always edit AGENTS.md directly. Never attempt to modify CLAUDE.md or GEMINI.md as they are just symbolic links.
- Any changes made to AGENTS.md will automatically be reflected in CLAUDE.md and GEMINI.md.

**IMPORTANT: This library has never been released.**

**No Backward Compatibility Required**: Since the project has never been released, there is no need to maintain backward compatibility, migration notes, or update guides. Always prioritize clean, modern code and best practices. Do not include migration notes, backward compatibility warnings, or "what changed" sections in documentation.

## Quick Rules Summary for Agents (Load This First)

| Category            | Rule/Details                                                                                                                                                                                                                                  |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Performance Mandate | **Critical Priority.** Audio apps have heavy runtime constraints (e.g., avoiding UI stutters, ensuring low-latency response). Prioritize performance in all decisions: minimal re-renders, no JS for layout/sizing, efficient event handling. |
| React               | React 18 only; library as peer deps (`^18.2.0`), demo as direct (`^18.3.1`); never upgrade to 19                                                                                                                                              |
| TypeScript          | Strict mode; handle all errors; prefix unused params with \_; `@types/react:^18.3.23`                                                                                                                                                         |
| Package Manager     | pnpm                                                                                                                                                                                                                                          |
| UI Components       | Use shadcn/ui; add with `pnpm dlx shadcn@latest add [component]`; no custom if shadcn available; no alter                                                                                                                                     |
| Testing             | Vitest; files `.test.tsx` alongside; mock deps; React 18 compat                                                                                                                                                                               |
| Build               | Library: Vite with TS decl; demo: Next.js 15 with Turbopack; run `pnpm build && pnpm typecheck`                                                                                                                                               |
| Dev Server          | Run `pnpm dev` at root for development; never in playground-app for testing                                                                                                                                                                   |
| Theming             | CSS vars with `--audioui-*`; default adaptive (black light, white dark); utility classes `.audioui-*`; named themes blue etc.                                                                                                                 |
| Components          | Function declarations; props with JSDoc; default params; SVG for graphics                                                                                                                                                                     |
| Perf                | ES modules; tree-shaking; CSS grid; no JS sizing (AdaptiveBox CSS-only)                                                                                                                                                                       |
| Library Exports     | From react/library/src/index.ts                                                                                                                                                                                                               |
| Demo Routing        | Next.js app router; app/[route]/page.tsx                                                                                                                                                                                                      |

## Rendering Strategy

- **`react/library` (Component Library):** **Client Components ONLY.**
  - **Rule:** Every component must have the `"use client";` directive at the top of the file.
  - **Reason:** Library components are interactive (knobs, sliders) and rely on client-side hooks and browser events. This ensures they work in any host application (CSR, SSR, SSG).

- **`react/playground-app` (Playground Application):** **Server Components by default; Client Components for interactivity.**
  - **Purpose:** Internal playground for rapid iteration, visual validation, and manual testing. Not the final documentation site.
  - **Rule:** Pages (`app/**/page.tsx`) should be Server Components (default, no directive). They are pre-rendered at build time (SSG) for performance.
  - **Implementation:** To show interactive demos, import the library's Client Components into the Server Component pages. Next.js will handle the client-side hydration automatically. Pages that require hooks for demo controls (e.g., state for knobs) must use the `"use client";` directive.

## Documentation Strategy (Web Monorepo)

- Final public documentation lives in a separate website monorepo (Next.js) with MDX-based, developer-oriented docs that embed live components.
- This repo's `react/playground-app` is a playground, not the docs source. Keep playground focused on iteration and testing; mirror finalized examples into the docs site when stable.

## Project Structure

- `react/library/`: Component library; src/, dist/; Vite build; React 18 peer
- `react/playground-app/`: Next.js playground; showcases components; app/components for pages (inferred)
- `agents/`: Shared conventions (coding-conventions-2.0.md, typescript-guidelines-2.0.md, react-conventions-2.0.md, documentation-standards-2.0.md)
- `react/library/docs/`: Specialized tech docs (e.g., adaptive-box-layout.md)
- Sub-AGENTS.md: Optional extensions for details

## Agent Workflow Template

1. Load root AGENTS.md.
2. Read sub-AGENTS.md for specifics (library/playground).
3. Consult `agents/` for conventions.
4. Use tools: `pnpm typecheck/build/test`; edit code; run diagnostics.
5. Test in playground app.
6. Update docs if needed.

## React Version Compatibility

**React 18 Only**: The library uses React 18 as a peer dependency. Never upgrade to React 19.

When TypeScript errors occur related to React types:

1. Check versions: `pnpm ls react @types/react`
2. Ensure React 18: `pnpm install react@^18.3.1 react-dom@^18.3.1 @types/react@^18.3.23 @types/react-dom@^18.3.7`
3. `pnpm typecheck` both
4. `pnpm build`

## Common Issues

- "ReactNode" conflicts: React 19 types mixed with 18
- "ForwardRefExoticComponent": Version mismatch
- "Property 'children' missing": React 19 Portal reqs

## Task Focus

Do not fix unrelated TS errors; many known and ignored; focus on current task.

## AdaptiveBox Component

- CSS/SVG-based layout system for SVG controls with labels
- Modes: scaleToFit (contain, aspect, letterbox); fill (preserve vert, distort SVG width)
- Features: container query cqw/cqh; scaler calc; two-row grid; align start/center/end; label modes visible/hidden/none; overlay sibling
- See react/library/docs/adaptive-box-layout.md for complete specification
- React 18 compatible

## Theme System

- CSS vars for theming; adaptive named themes (blue, orange, pink, green, purple, yellow); .dark hue adjust
- Default adaptive theme (black-ish light, white-ish dark)
- Mapping: --audioui-primary-color to default (black-ish light, white-ish dark)
- Classes: .audioui-stroke-primary, .audioui-fill-primary, .audioui-border-primary, .audioui-text-primary (all prefixed with `audioui-`)
- Provider: AudioUiProvider defaults color; useThemableProps fallback
- **Comprehensive Documentation**: See `react/library/docs/color-system.md` for complete color system architecture, and `react/playground-app/docs/color-integration.md` for playground integration details
- **Styling System Guidelines**: See `agents/audioui-styling-system.md` for complete styling conventions, naming patterns, constants usage, and Stylelint enforcement

## ESLint/Prettier

- ESLint: TS support; run `pnpm lint`
- Prettier: .prettierrc.json; run `pnpm format`

## Maintenance Guidelines

Agents docs are living documentation; update continuously for agent efficiency. Shared `agents/` updated externally; edit AGENTS.md for project changes. Create/manage subs for modular focus.

### CI

- GitHub Actions workflow `.github/workflows/ci.yml` runs on push/PR to `main` (Node 18/20 matrix): install, typecheck, build, lint, and tests across the monorepo using pnpm and Turbo with caching and concurrency control.

## Development Guidelines

### Code Organization

- **Maintain clean separation** between agent instructions (AGENTS.md) and human documentation (README.md)
- **Keep instructions dense and optimized for AI processing** - prioritize clarity and efficiency for LLM consumption over human readability

### File Management

- **Only modify AGENTS.md directly** - symbolic links (CLAUDE.md, GEMINI.md) should not be edited
- **Update AGENTS.md to reflect current project state after each interaction** - ensure documentation stays synchronized with code changes

## Licensing & Distribution

- License Model: Tylium Evolutive License Framework (see `license-telf/LICENSE.md`), with accompanying `SLA.md` and `CLA.md` in `license-telf/`.
- Compatibility: A GPL-3.0 variant is available in `license-telf/LICENSE-GPL3.md` for open-source alignment when needed; Tylium terms govern unless explicitly stated otherwise in releases.
- Source Availability: Full source code is public.
- Distribution: Packages and releases are distributed through classical channels (e.g., public Git hosting for source; package registries/artifacts for builds where applicable).
- Contributor Guidance: Contributors agree to the Contributor License Agreement (`license-telf/CLA.md`) and grant rights consistent with the Tylium framework and any companion open-source terms in use for a given release.
- Operational Note: Package manifests may show UNLICENSED during development; the authoritative license is this section and the `license-telf/` documents until publication artifacts include SPDX identifiers.

## Sub-File Summaries

- `./agents/audioui-licensing-strategy.md`: Outlines the dual-licensing model and legal framework.
- `./agents/audioui-versioning-guidelines.md`: Details the SemVer-based versioning strategy, including developer preview conventions.
- `./agents/audioui-styling-system.md`: Comprehensive styling system guidelines covering namespace isolation, naming conventions, constants usage, Stylelint enforcement, and best practices.
- `./react/library/AGENTS.md`: Library specifics (exports, build, env); created.
- `./react/playground-app/AGENTS.md`: Playground app details (routing, integrations, env); created.

## Documentation Files

### Library Documentation

- `react/library/docs/color-system.md`: Comprehensive color system documentation covering CSS theme variables, color utilities, component color resolution, theme provider system, and usage examples.
- `react/library/docs/color-property-examples.md`: Practical examples of using the `color` property with components, including animations and dynamic colors.
- `react/library/docs/adaptive-box-layout.md`: AdaptiveBox component layout system documentation.

### Playground Documentation

- `react/playground-app/docs/color-integration.md`: How the playground app integrates with the library's color system, including provider setup, sidebar theme controls, and CSS integration.
