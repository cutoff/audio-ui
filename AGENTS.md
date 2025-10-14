**Version**: 2.0 | **Meta**: React component library for audio and MIDI applications; no BC needed (never released); monorepo structure with library and demo-app.

**IMPORTANT: Documentation File Structure**

- This file (AGENTS.md) is the primary documentation file for LLMs.
- CLAUDE.md and GEMINI.md are symbolic links to this file.
- Always edit AGENTS.md directly. Never attempt to modify CLAUDE.md or GEMINI.md as they are just symbolic links.
- Any changes made to AGENTS.md will automatically be reflected in CLAUDE.md and GEMINI.md.

**IMPORTANT: This library has never been released.** No need for BC; prioritize clean code.

## Quick Rules Summary for Agents (Load This First)

| Category | Rule/Details |
|----------|--------------|
| Performance Mandate | **Critical Priority.** Audio apps have heavy runtime constraints (e.g., avoiding UI stutters, ensuring low-latency response). Prioritize performance in all decisions: minimal re-renders, no JS for layout/sizing, efficient event handling. |
| React | React 18 compatibility; library as peer deps (`^18.2.0`), demo as direct (`^18.3.1`); never upgrade to 19 |
| TypeScript | Strict mode; handle all errors; prefix unused params with _; `@types/react:^18.3.23` |
| Package Manager | pnpm |
| UI Components | Use shadcn/ui; add with `pnpm dlx shadcn@latest add [component]`; no custom if shadcn available; no alter |
| Testing | Vitest; files `.test.tsx` alongside; mock deps; React 18 compat |
| Build | Library: Vite with TS decl; demo: Next.js 15; run `pnpm build/typecheck` |
| Dev Server | Never run `pnpm dev` in demo-app for testing |
| Theming | CSS vars; default adaptive (black light, white dark); utility classes .stroke-primary etc.; named themes blue etc. |
| Components | Function declarations; props with JSDoc; default params; SVG for graphics |
| Perf | ES modules; tree-shaking; CSS grid; no JS sizing (AdaptiveSvgComponent CSS-only) |
| Library Exports | From react/library/src/index.ts |
| Demo Routing | Next.js app router; app/[route]/page.tsx |

## Rendering Strategy

-   **`react/library` (Component Library):** **Client Components ONLY.**
    -   **Rule:** Every component must have the `"use client";` directive at the top of the file.
    -   **Reason:** Library components are interactive (knobs, sliders) and rely on client-side hooks and browser events. This ensures they work in any host application (CSR, SSR, SSG).

-   **`react/demo-app` (Demo Application):** **Server Components by default; Client Components for interactivity.**
    -   **Rule:** Pages (`app/**/page.tsx`) should be Server Components (default, no directive). They are pre-rendered at build time (SSG) for performance.
    -   **Implementation:** To show interactive demos, import the library's Client Components into the Server Component pages. Next.js will handle the client-side hydration automatically. Pages that require hooks for demo controls (e.g., state for knobs) must use the `"use client";` directive.

## Project Structure

- `react/library/`: Component library; src/, dist/; Vite build; React 18 peer
- `react/demo-app/`: Next.js demo; showcases components; app/components for pages (inferred)
- `agents/`: Shared conventions (coding-conventions-2.0.md, typescript-guidelines-2.0.md, react-conventions-2.0.md, documentation-standards-2.0.md)
- `react/library/docs/`: Specialized tech docs (e.g., adaptive-box-layout.md)
- Sub-AGENTS.md: Optional extensions for details

## Agent Workflow Template

1. Load root AGENTS.md.
2. Read sub-AGENTS.md for specifics (library/demo).
3. Consult `agents/` for conventions.
4. Use tools: `pnpm typecheck/build/test`; edit code; run diagnostics.
5. Test in demo app.
6. Update docs if needed.

## Version Compatibility Troubleshooting

When TS errors:

1. Check versions: `pnpm ls react @types/react`
2. Downgrade to React 18: `pnpm install react@^18.3.1 react-dom@^18.3.1 @types/react@^18.3.23 @types/react-dom@^18.3.7`
3. `pnpm typecheck` both
4. `pnpm build`

## Common Issues

- "ReactNode" conflicts: React 19 types mixed with 18
- "ForwardRefExoticComponent": Version mismatch
- "Property 'children' missing": React 19 Portal reqs

## Task Focus

Do not fix unrelated TS errors; many known and ignored; focus on current task.

## AdaptiveSvgComponent (Sept 2025 update)

- CSS-based sizing; no ResizeObserver/JS
- Container: flex; overflow hidden; container-type inline-size
- Fixed: width px; aspect-ratio; SVG 100%
- Stretch: fill 100%; SVG auto max100% + aspect-ratio
- Alignment: map alignSelf/justifySelf to flex
- Min sizes: CSS on container

Implications: No JS; smooth; zoomable; event handling unchanged.

## AdaptiveBox (Sept 2025)

- Replaces AdaptiveContainer + SvgSurface; CSS/SVG
- Modes: scaleToFit (contain, aspect, letterbox); fill (preserve vert, distort SVG width)
- Features: container query cqw/cqh; scaler calc; two-row grid; align start/center/end; label modes visible/hidden/none; overlay sibling
- See react/library/docs/adaptive-box-layout.md
- React 18 compat

## Theme Utilities (Sept 2025)

- CSS vars for theming; adaptive named themes (blue, orange, pink, green, purple, yellow); .dark hue adjust
- White theme removed; default near-white accents
- Mapping: --primary-color to default (black-ish light, white-ish dark)
- Classes: .stroke/fill/border/text -primary, -50, -20; prefer .border-primary
- Provider: AudioUiProvider defaults color; useThemableProps fallback

## ESLint/Prettier

- ESLint: TS support; run `pnpm lint`
- Prettier: .prettierrc.json; run `pnpm format`

## Maintenance Guidelines

Agents docs are living documentation; update continuously for agent efficiency. Shared `agents/` updated externally; edit AGENTS.md for project changes. Create/manage subs for modular focus.

## Sub-File Summaries

- `./react/library/AGENTS.md`: Library specifics (exports, build, env); created.
- `./react/demo-app/AGENTS.md`: Demo app details (routing, integrations, env); created.