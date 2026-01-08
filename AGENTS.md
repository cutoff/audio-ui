<!--
 Copyright (c) 2026 Tylium.
 SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 See LICENSE.md for details.
-->

**Version**: 2.0 | **Meta**: React component library for audio and MIDI applications (never released); monorepo structure with library and playground-app.

**IMPORTANT: Documentation File Structure**

- This file (AGENTS.md) is the primary documentation file for LLMs.
- CLAUDE.md and GEMINI.md are symbolic links to this file.
- Always edit AGENTS.md directly. Never attempt to modify CLAUDE.md or GEMINI.md as they are just symbolic links.
- Any changes made to AGENTS.md will automatically be reflected in CLAUDE.md and GEMINI.md.

**IMPORTANT: This library has never been released.**

**CRITICAL: No Backward Compatibility Required**

**This project is in active development and has never been released. Backward compatibility is NOT a concern at this stage.**

- **Do NOT maintain backward compatibility** - feel free to make breaking changes to improve the architecture
- **Do NOT write migration guides** - there are no existing users to migrate
- **Do NOT include "what changed" sections** - focus on current state, not history
- **Do NOT preserve deprecated APIs** - remove them entirely if they're no longer needed
- **Always prioritize clean, modern code** over maintaining old patterns
- **Refactor freely** - if a better approach exists, use it without worrying about existing code
- **Do NOT use evolution phrasing** - Avoid words like "now", "recently", "changed", "updated", "moved", "introduced", "added", "removed". Write in present tense, declarative statements. Example: Instead of "Knob now uses ContinuousControl", write "Knob uses ContinuousControl" or "Knob is implemented using ContinuousControl"

When making changes, focus on:

1. Clean architecture and separation of concerns
2. Modern React patterns and best practices
3. Performance and maintainability
4. Type safety and correctness

Do not waste effort on compatibility layers, deprecation warnings, or gradual migration strategies.

## Quick Rules Summary for Agents (Load This First)

| Category            | Rule/Details                                                                                                                                                                                                                                                                                        |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Architecture        | **CRITICAL**: `packages/core/` is framework-agnostic (pure TypeScript, no framework deps). `packages/react/` is the React implementation that wraps core. Future framework packages (e.g., `packages/solid/`) would follow the same pattern: depend on core, provide framework-specific components. |
| Git Operations      | **Do NOT commit changes automatically.** Always ask for user confirmation before running `git commit`, `git merge`, `git reset`, or modifying git history.                                                                                                                                          |
| Documentation Style | **Write in present tense, declarative statements.** Avoid evolution phrasing: "now", "recently", "changed", "updated", "moved", "introduced", "added", "removed". Focus on current state, not history. Example: "Knob uses ContinuousControl" not "Knob now uses ContinuousControl".                |
| Performance Mandate | **Critical Priority.** Audio apps have heavy runtime constraints (e.g., avoiding UI stutters, ensuring low-latency response). Prioritize performance in all decisions: minimal re-renders, no JS for layout/sizing, efficient event handling.                                                       |
| React               | React 18 only; library as peer deps (`^18.2.0`), demo as direct (`^18.3.1`); never upgrade to 19                                                                                                                                                                                                    |
| TypeScript          | Strict mode; handle all errors; prefix unused params with \_; `@types/react:^18.3.23`                                                                                                                                                                                                               |
| Package Manager     | pnpm                                                                                                                                                                                                                                                                                                |
| UI Components       | Use shadcn/ui; add with `pnpm dlx shadcn@latest add [component]`; no custom if shadcn available; **NEVER modify shadcn components** - they are third-party stabilized code; work around type issues with type assertions/ts-expect-error if needed                                                  |
| Testing             | Vitest; files `.test.tsx` alongside; mock deps; React 18 compat                                                                                                                                                                                                                                     |
| Build               | Library: Vite with TS decl; demo: Next.js 15 with Turbopack; run `pnpm build && pnpm typecheck`                                                                                                                                                                                                     |
| Dev Server          | Run `pnpm dev` at root for development; never in playground-app for testing                                                                                                                                                                                                                         |
| Theming             | CSS vars with `--audioui-*`; default adaptive (black light, white dark); utility classes `.audioui-*`; named themes blue etc.                                                                                                                                                                       |
| Components          | Function declarations; props with JSDoc; default params; SVG for graphics                                                                                                                                                                                                                           |
| Perf                | ES modules; tree-shaking; CSS grid; no JS sizing (AdaptiveBox CSS-only); O(1) lookups for discrete parameters; memoized styles/calculations; useRef for event handlers to avoid stale closures; lazy global event listeners (only during drag)                                                      |
| Library Exports     | From packages/react/src/index.ts                                                                                                                                                                                                                                                                    |
| Demo Routing        | Next.js app router; app/[route]/page.tsx                                                                                                                                                                                                                                                            |

## Rendering Strategy

- **`packages/react` (Component Library):** **Client Components ONLY.**
  - **Rule:** Every component must have the `"use client";` directive at the top of the file.
  - **Reason:** Library components are interactive (knobs, sliders) and rely on client-side hooks and browser events. This ensures they work in any host application (CSR, SSR, SSG).

- **`apps/playground-react` (Playground Application):** **Server Components by default; Client Components for interactivity.**
  - **Purpose:** Internal playground for rapid iteration, visual validation, and manual testing. Not the final documentation site.
  - **Rule:** Pages (`app/**/page.tsx`) should be Server Components (default, no directive). They are pre-rendered at build time (SSG) for performance.
  - **Implementation:** To show interactive demos, import the library's Client Components into the Server Component pages. Next.js will handle the client-side hydration automatically. Pages that require hooks for demo controls (e.g., state for knobs) must use the `"use client";` directive.

## Documentation Strategy (Web Monorepo)

- Final public documentation lives in a separate website monorepo (Next.js) with MDX-based, developer-oriented docs that embed live components.
- This repo's `apps/playground-react` is a playground, not the docs source. Keep playground focused on iteration and testing; mirror finalized examples into the docs site when stable.

## Project Structure

**CRITICAL ARCHITECTURE SEPARATION:**

- `packages/core/`: **Framework-Agnostic Core Package**; pure TypeScript, no framework dependencies.
  - **Purpose**: Contains all business logic, models, controllers, utilities, and styles that are independent of any UI framework.
  - **Usage**: Can be used by any framework implementation (React, Solid, Vue, etc.) or in non-framework contexts.
  - `src/model/`: Domain models (AudioParameter, AudioParameterConverter).
  - `src/controller/`: Interaction logic (InteractionController).
  - `src/constants/`: Shared constants (themeColors, cssVars, styles).
  - `src/utils/`: Pure math and utility functions (math, sizing, colorUtils, noteUtils).
  - `src/styles/`: Shared CSS files (styles.css, themes.css).

- `packages/react/`: **React Implementation Package**; React-specific component library that depends on `@cutoff/audio-ui-core`.
  - **Purpose**: Provides React components, hooks, and React-specific adapters that wrap the framework-agnostic core logic.
  - **Architecture**: React components use core's `InteractionController`, models, and utilities, but add React-specific rendering and hooks.
  - `src/components/`: React View Components (Button, Knob, Slider, Keybed, etc.).
  - `src/hooks/`: React adapters for Core logic (`useAudioParameter`, `useContinuousInteraction`).
  - `src/index.ts`: Re-exports core primitives alongside React components.

- **Future Framework Implementations**: The architecture supports additional framework-specific packages (e.g., `packages/solid/` for SolidJS, `packages/vue/` for Vue, etc.). Each would:
  - Depend on `@cutoff/audio-ui-core` for shared logic
  - Provide framework-specific components and adapters
  - Follow the same architectural pattern as `packages/react/`

- `apps/playground-react/`: Next.js playground; showcases components; app/components for pages (inferred)
- `agents/`: Shared conventions (coding-conventions-2.0.md, typescript-guidelines-2.0.md, react-conventions-2.0.md, documentation-standards-2.0.md, coding-agent-commands-1.0.md)
- `packages/react/docs/`: Specialized tech docs (e.g., adaptive-box-layout.md)
- `links/`: Symbolic links to external repositories (Read-Only, Ignored by Git). Use for reference only.
- Sub-AGENTS.md: Optional extensions for details

## Agent Commands

The file `agents/coding-agent-commands-1.0.md` contains executable commands that can be invoked by the user with simple instructions like "Execute X". When a user requests "Execute [CommandName]", the agent should follow the procedure defined for that command.

Available commands:

- **Review**: Comprehensive code review procedure (documentation, readability, performance, unused imports, prettier, and `pnpm check`)
- **Check**: Iterate on `pnpm check` until no errors remain

See `agents/coding-agent-commands-1.0.md` for complete command definitions and procedures.

## Agent Workflow Template

1. Load root AGENTS.md.
2. Read sub-AGENTS.md for specifics (library/playground).
3. Consult `agents/` for conventions.
4. Use tools: `pnpm typecheck`, `pnpm build`, `pnpm test`; edit code; run diagnostics.
5. **Final Verification**: Run `pnpm check` (runs typecheck, build, lint, and test) to ensure overall project health.
6. Test in playground app.
7. Update docs if needed.

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

## Strategic Roadmap

**Primary Directive:** The project's strategic direction, priorities, and release plan are defined in `docs/internal/ROADMAP.md`. All tasks and development efforts must align with the goals and milestones outlined in this document. Consult it at the beginning of any session to understand the current priorities.

## AdaptiveBox Component

- CSS/SVG-based layout system for SVG controls with labels
- Modes: scaleToFit (contain, aspect, letterbox); fill (preserve vert, distort SVG width)
- Features: container query cqw/cqh; scaler calc; two-row grid; align start/center/end; label modes visible/hidden/none; overlay sibling
- See packages/react/docs/adaptive-box-layout.md for complete specification
- React 18 compatible
- **Wheel Event Handling**: Uses native non-passive event listeners (not React synthetic events) to reliably prevent page scrolling during wheel interactions

## Interactive Controls System

- **Core Architecture**: Interaction logic is centralized in `packages/core/src/controller/ContinuousInteractionController.ts` (pure TS class).
- **React Adapter**: `useContinuousInteraction` hook in `packages/react` wraps `ContinuousInteractionController` to bind it to React events.
- **Generic Control Architecture**: `Knob` and `Slider` are implemented using `ContinuousControl`, a generic component that decouples behavior (AudioParameter, interaction logic) from visualization (SVG rendering). This architecture allows easy customization by providing custom view components that implement the `ControlComponentView` contract.
- **Unified Interaction Hook**: Continuous controls (Knob, Slider) use `useContinuousInteraction` hook. Discrete controls (CycleButton, Button) use discrete interaction hooks.
- **Input Methods**: Supports drag (mouse/touch), wheel, and keyboard interactions
- **Interaction Modes**: Configurable via `interactionMode` prop ("drag" | "wheel" | "both")
- **Sensitivity Tuning**: Component-specific defaults tuned for optimal feel (Knob: 0.008, Slider: 0.005). CycleButton is discrete-only (no continuous interaction).
- **Focus Management**:
  - Custom highlight effect (brightness/contrast boost + shadow) replaces browser ring
  - Applied via `:focus-visible` (keyboard) and `:focus-within` (click/touch)
  - Elements receive focus naturally (no `preventDefault` on mousedown)
- **Text Selection**: Prevented during drag via `user-select: none`
- **Wheel Propagation**: Native non-passive listeners prevent page scrolling
- **Keyboard Support**:
  - Arrow keys (step/increment)
  - Home/End (min/max)
  - Space/Enter (Button activate, CycleButton cycle)
- **CycleButton Special**: Supports click-to-cycle and Space-to-cycle with wrap-around
- **Performance**: Lazy global event listeners (only during drag), refs for mutable state, O(1) lookups for enums
- **Comprehensive Documentation**: See `packages/react/docs/interaction-system.md` for complete architecture, design decisions, and implementation details

## Theme System

- CSS vars for theming; adaptive named themes (blue, orange, pink, green, purple, yellow); .dark hue adjust
- Default adaptive theme (black-ish light, white-ish dark)
- Mapping: --audioui-primary-color to default (black-ish light, white-ish dark)
- Classes: .audioui-stroke-primary, .audioui-fill-primary, .audioui-border-primary, .audioui-text-primary (all prefixed with `audioui-`)
- Provider: AudioUiProvider defaults color; useThemableProps fallback
- **Comprehensive Documentation**: See `packages/react/docs/color-system.md` for complete color system architecture, and `apps/playground-react/docs/color-integration.md` for playground integration details
- **Styling System Guidelines**: See `agents/audioui-styling-system.md` for complete styling conventions, naming patterns, constants usage, and Stylelint enforcement
- **Performance Guidelines**: See `docs/internal/PERFORMANCE.md` for centralized performance findings, optimization best practices (SVG geometry vs CSS, memoization strategy, event handling), and benchmarking procedures.

## Size System

- **Base Unit System**: All component sizes derive from `--audioui-unit` (48px default) with size multipliers (xsmall: 1x, small: 1.25x, normal: 1.5x, large: 2x, xlarge: 2.5x)
- **Component Aspect Ratios**:
- Button, Knob, CycleButton: 1x1 (square)
- Horizontal Slider: 1x2 (width:height) - width > height
- Vertical Slider: 2x1 (width:height) - height > width
- Keybed: 1x5 (width:height) - width > height
- **Implementation**: Size defined via CSS variables in `packages/core/src/styles/themes.css`; size classes in `packages/core/src/styles/styles.css` for semantic purposes; inline styles (CSS variable references) override AdaptiveBox's default 100% sizing
- **Size Props**:
  - `size`: `"xsmall" | "small" | "normal" | "large" | "xlarge"` (default `"normal"`)
  - `adaptiveSize`: boolean (default `false`)
- **When `adaptiveSize=false`**: Size class and inline size styles apply; user `style` prop spreads last (takes precedence)
- **When `adaptiveSize=true`**: No size constraints from the size system; component fills its container (AdaptiveBox default `width: 100%; height: 100%`)
- **User Override**: User `className` and `style` props take precedence over size classes/styles
- **Utilities**: `getSizeClassForComponent()` returns CSS class names; `getSizeStyleForComponent()` returns inline style objects with CSS variable references
- **Location**: Size mappings in `packages/core/src/utils/sizing.ts`; CSS variables in `packages/core/src/styles/themes.css`; size classes in `packages/core/src/styles/styles.css`

## SVG View Primitives

Low-level building blocks for composing custom radial controls (knobs, dials, rotary encoders). All primitives share a common coordinate system (`cx`, `cy`, `radius`).

- **ValueRing**: Arc/ring indicator showing value progress; supports bipolar mode, configurable thickness/openness/roundness; stroke expands inward from radius
- **RotaryImage**: Rotates children based on normalized value; shares angle logic with ValueRing via `useArcAngle` hook; wraps RadialImage internally
- **RadialImage**: Static image or SVG content at radial coordinates; uses `preserveAspectRatio="xMidYMid meet"`
- **RadialText**: Auto-fitting text with measure-once pattern; uses reference text for consistent sizing; GPU-accelerated CSS `transform: scale()`; global font metrics cache for performance (100+ knobs = 1 measurement); `dominantBaseline="central"` with baseline correction for vertical centering
- **TickRing**: Scale decoration (ticks/lines/dots); supports optimized single-path rendering or custom content
- **LabelRing**: Scale labels (text/icons); wrapper around TickRing for easy positioning and rotation
- **SSR**: Not a priority; audio/MIDI apps require client-side processing; RadialText/RadialContent fall back gracefully
- **Comprehensive Documentation**: See `packages/react/docs/svg-view-primitives.md` for complete API, design decisions, and composition examples

## Icon Theming Best Practices

- **Use Inline SVGs with `currentColor`**: Icons should be provided as React components that render inline `<svg>` elements with `fill="currentColor"`. This allows icons to automatically inherit text color and adapt to light/dark mode.
- **Library CSS Support**: The library's CSS automatically applies `fill: currentColor` to inline SVGs within knob content, ensuring proper color inheritance.
- **Third-Party Icon Libraries**: Icon libraries like `react-icons` work seamlessly as they render inline SVGs that inherit `currentColor`.
- **Avoid `<img>` Tags for Themed Icons**: External SVG files loaded via `<img>` tags cannot be themed with CSS. Use inline SVG components instead.
- **Example Pattern**: See `apps/playground-react/components/wave-icons.tsx` for reference implementation of themed icon components.

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
- **Update README.md continuously:** The root `README.md` is the public face of the project. It must be updated to reflect any changes to the build process, package names, or getting-started instructions that occur during a session.

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
- `./packages/react/AGENTS.md`: Library specifics (exports, build, env, interaction system, generic control architecture, size system).
- `./apps/playground-react/AGENTS.md`: Playground app details (routing, integrations, env, sizing showcase).
- `./packages/react/docs/interaction-system.md`: Complete interaction system architecture, design decisions, sensitivity tuning, and implementation details for all interactive controls.
- `./packages/react/docs/size-system.md`: Complete size system architecture, base unit system, component aspect ratios, CSS variable structure, implementation details, and customization options.
- `./packages/react/docs/svg-view-primitives.md`: SVG View Primitives (ValueRing, RotaryImage, RadialImage, RadialText, RadialContent) for composing custom radial controls; includes RadialText measure-once pattern, global font cache, AudioParameterConverter integration, and RadialContent foreignObject approach for rich HTML content.
