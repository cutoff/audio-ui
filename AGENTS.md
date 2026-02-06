<!--
 Copyright (c) 2026 Tylium.
 SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 See LICENSE.md for details.
-->

**Version**: 2.0 | **Meta**: React component library for audio and MIDI applications (Developer Preview); monorepo structure with library and playground-app. Development versions use Maven-like `-dev` suffix (e.g., `1.0.0-dev`, equivalent to Maven's `-SNAPSHOT`). npm releases use timestamped preview versions (e.g., `1.0.0-preview.YYYYMMDD.HHMM`). Working toward first Developer Preview release (dp.0).

**IMPORTANT: Documentation File Structure**

- This file (AGENTS.md) is the primary documentation file for LLMs.
- CLAUDE.md and GEMINI.md are symbolic links to this file.
- Always edit AGENTS.md directly. Never attempt to modify CLAUDE.md or GEMINI.md as they are just symbolic links.
- Any changes made to AGENTS.md will automatically be reflected in CLAUDE.md and GEMINI.md.

**CRITICAL: No Backward Compatibility Required**

**This project is in Developer Preview phase. Backward compatibility is NOT a concern at this stage.**

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

| Category            | Rule/Details                                                                                                                                                                                                                                                                                                      |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | --------------------------------------------------------------- |
| Architecture        | **CRITICAL**: `packages/core/` is framework-agnostic (pure TypeScript, no framework deps). `packages/react/` is the React implementation that wraps core. The architecture supports potential future framework implementations following the same pattern: depend on core, provide framework-specific components. |
| Git Operations      | **Do NOT commit or execute any modifying git command without explicit request.** Always ask for user confirmation before running `git commit`, `git merge`, `git reset`, or modifying git history.                                                                                                                |
| GitHub Operations   | **Do NOT update GitHub issues without explicit request.** Always ask for user confirmation before creating, updating, or closing issues/PRs.                                                                                                                                                                      |
| Documentation Style | **Write in present tense, declarative statements.** Avoid evolution phrasing: "now", "recently", "changed", "updated", "moved", "introduced", "added", "removed". Focus on current state, not history. Example: "Knob uses ContinuousControl" not "Knob now uses ContinuousControl".                              |
| Performance Mandate | **Critical Priority.** Audio apps have heavy runtime constraints (e.g., avoiding UI stutters, ensuring low-latency response). Prioritize performance in all decisions: minimal re-renders, no JS for layout/sizing, efficient event handling.                                                                     |
| React               | React 18+; library as peer deps (`^18.2.0                                                                                                                                                                                                                                                                         |     | ^19.0.0`), demo as direct (`^18.3.1`); compatible with React 19 |
| TypeScript          | Strict mode; handle all errors; prefix unused params with \_; `@types/react:^18.3.23`                                                                                                                                                                                                                             |
| Package Manager     | pnpm                                                                                                                                                                                                                                                                                                              |
| UI Components       | Use shadcn/ui; add with `pnpm dlx shadcn@latest add [component]`; no custom if shadcn available; **NEVER modify shadcn components** - they are third-party stabilized code; work around type issues with type assertions/ts-expect-error if needed                                                                |
| Testing             | Vitest; files `.test.tsx` alongside; mock deps; React 18/19 compat                                                                                                                                                                                                                                                |
| Build               | Library: Vite with TS decl; demo: Next.js 15 with Turbopack; run `pnpm build && pnpm typecheck`                                                                                                                                                                                                                   |
| Dev Server          | Run `pnpm dev` at root for development; never in playground-app for testing                                                                                                                                                                                                                                       |
| Theming             | CSS vars with `--audioui-*`; default adaptive (black light, white dark); utility classes `.audioui-*`; named themes blue etc.                                                                                                                                                                                     |
| Components          | Function declarations; props with JSDoc; default params; SVG for graphics                                                                                                                                                                                                                                         |
| Perf                | ES modules; tree-shaking; CSS grid; no JS sizing (AdaptiveBox CSS-only); O(1) lookups for discrete parameters; memoized styles/calculations; useRef for event handlers to avoid stale closures; lazy global event listeners (only during drag)                                                                    |
| Library Exports     | From packages/react/src/index.ts                                                                                                                                                                                                                                                                                  |
| Demo Routing        | Next.js app router; app/[route]/page.tsx                                                                                                                                                                                                                                                                          |

## Rendering Strategy

- **`packages/react` (Component Library):** **Client Components ONLY.**
  - **Rule:** Every component must have the `"use client";` directive at the top of the file.
  - **Reason:** Library components are interactive (knobs, sliders) and rely on client-side hooks and browser events. This ensures they work in any host application (CSR, SSR, SSG).

- **`apps/playground-react` (Playground Application):** **Server Components by default; Client Components for interactivity.**
  - **Purpose:** Playground application for component development, visual validation, and manual testing. Not the final documentation site.
  - **Rule:** Pages (`app/**/page.tsx`) should be Server Components (default, no directive). They are pre-rendered at build time (SSG) for performance.
  - **Implementation:** To show interactive demos, import the library's Client Components into the Server Component pages. Next.js will handle the client-side hydration automatically. Pages that require hooks for demo controls (e.g., state for knobs) must use the `"use client";` directive.

## Documentation Strategy (Web Monorepo)

- Final public documentation lives in a separate website monorepo (Next.js) with MDX-based, developer-oriented docs that embed live components.
- This repo's `apps/playground-react` is a playground application for component development and testing. Finalized examples are mirrored into the documentation site when stable.

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
  - `src/components/`: React View Components (Button, Knob, Slider, Keys, etc.).
  - `src/hooks/`: React adapters for Core logic (`useAudioParameter`, `useContinuousInteraction`).
  - `src/index.ts`: Re-exports core primitives alongside React components.

- **Framework-Agnostic Architecture**: The core package (`packages/core/`) is designed to be framework-agnostic, enabling potential implementations for other frameworks. Any future framework-specific packages would follow the same architectural pattern: depend on `@cutoff/audio-ui-core` for shared logic and provide framework-specific components and adapters.

- `apps/playground-react/`: Next.js playground; showcases components; routes: examples, vector-components, raster-components, primitives, layout; app/components for pages (inferred)
- `agents/`: Shared conventions (coding-conventions-2.0.md, typescript-guidelines-2.0.md, react-conventions-2.0.md, documentation-standards-2.0.md, coding-agent-commands-1.0.md, github-issues-guidelines-1.0.md)
- `packages/react/docs/`: Specialized tech docs (e.g., adaptive-box-layout.md)
- `links/`: Symbolic links to external repositories (Read-Only, Ignored by Git). Use for reference only.
- Sub-AGENTS.md: Optional extensions for details

## Agent Commands

The file `agents/coding-agent-commands-1.0.md` contains executable commands that can be invoked by the user with simple instructions like "Execute X". When a user requests "Execute [CommandName]", the agent should follow the procedure defined for that command.

Available commands:

- **Review**: Comprehensive code review procedure (documentation, readability, performance, unused imports, prettier, and `pnpm check`)
- **Check**: Iterate on `pnpm check` until no errors remain
- **Release**: Release procedure using release-it for version management, changelog generation, and git tagging
- **Create Issue**: Report a discussed topic to GitHub Issues; procedure in `agents/github-issues-guidelines-1.0.md`
- **Update Issue**: Update an existing GitHub issue with progression and decisions; procedure in `agents/github-issues-guidelines-1.0.md`
- **Close Issue**: Add final comment and close issue as completed; procedure in `agents/github-issues-guidelines-1.0.md`
- **Fix Issue**: Read issue description, status, and history; produce a fix plan (no code/commit/GitHub write without explicit request); procedure in `agents/coding-agent-commands-1.0.md`

See `agents/coding-agent-commands-1.0.md` for complete command definitions and procedures. GitHub issue commands (Create Issue, Update Issue, Close Issue, Fix Issue) follow `agents/github-issues-guidelines-1.0.md` for repository resolution, labels, description style, and writing conventions where applicable.

## Agent Workflow Template

1. Load root AGENTS.md.
2. Read sub-AGENTS.md for specifics (library/playground).
3. Consult `agents/` for conventions.
4. Use tools: `pnpm typecheck`, `pnpm build`, `pnpm test`; edit code; run diagnostics.
5. **Final Verification**: Run `pnpm check` (runs typecheck, build, lint, and test) to ensure overall project health.
6. Test in playground app.
7. Update docs if needed.

## React Version Compatibility

**React 18 Minimum, React 19 Compatible**: The library uses React 18 as a minimum peer dependency but is compatible with React 19.

**CRITICAL RULE FOR AGENTS:**

- **Develop against React 18**: The library's `devDependencies` MUST remain on React 18 (`@types/react@^18.x`).
- **Do NOT use React 19-only features**: Do not use new APIs like `use()`, `useFormStatus`, `useOptimistic`, or Server Actions within the library (`packages/react`).
- **Verification**: `pnpm typecheck` and `pnpm test` will run against React 18 types/runtime. If these pass, the code is React 18 compatible.

When TypeScript errors occur related to React types:

1. Check versions: `pnpm ls react @types/react`
2. Ensure compatible versions are installed.
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
- See packages/react/docs/adaptive-box-layout.md for complete specification
- React 18+ compatible
- **Wheel Event Handling**: Uses native non-passive event listeners (not React synthetic events) to reliably prevent page scrolling during wheel interactions

## Interactive Controls System

- **Core Architecture**: Interaction logic is centralized in `packages/core/src/controller/ContinuousInteractionController.ts` (pure TS class).
- **React Adapter**: `useContinuousInteraction` hook in `packages/react` wraps `ContinuousInteractionController` to bind it to React events.
- **Generic Control Architecture**: `Knob` and `Slider` are implemented using `ContinuousControl`, a generic component that decouples behavior (AudioParameter, interaction logic) from visualization (SVG rendering). This architecture allows easy customization by providing custom view components that implement the `ControlComponentView` contract.
- **Filmstrip-Based Controls**: The library provides filmstrip-based controls (`FilmStripContinuousControl`, `FilmStripDiscreteControl`, `FilmStripBooleanControl`) that support the widely-used current industry standard for control representation: bitmap sprite sheets (filmstrips). While bitmap-based visualization is more constrained than SVG, these components provide full access to all library features: complete layout system (AdaptiveBox), full parameter model (AudioParameter), complete interaction system (drag/wheel/keyboard), and all accessibility features. Filmstrip controls do not support themable props (color, roundness, thickness) as visuals are determined by the image content.
- **Unified Interaction Hooks**:
  - Continuous controls (Knob, Slider) use `useContinuousInteraction` hook.
  - Boolean controls (Button) use `useBooleanInteraction` hook.
  - Discrete/enum controls (CycleButton) use `useDiscreteInteraction` hook.
  - Note-based controls (Keys) use `useNoteInteraction` hook.
- **Input Methods**: Supports drag (mouse/touch), wheel, and keyboard interactions
- **Interaction Modes**: Configurable via `interactionMode` prop ("drag" | "wheel" | "both")
- **Sensitivity Tuning**: Standardized to `0.005` (200px throw) for all continuous controls (Knob, Slider). Adaptive sensitivity automatically increases for low-resolution parameters to prevent "dead zones". Wheel sensitivity is decoupled from drag sensitivity for consistent behavior across all parameter ranges.
- **Boolean Interaction (Button)**:
  - **Core Architecture**: Interaction logic is centralized in `packages/core/src/controller/BooleanInteractionController.ts` (pure TS class).
  - **React Adapter**: `useBooleanInteraction` hook in `packages/react` wraps `BooleanInteractionController` to bind it to React events.
  - **Drag-In/Drag-Out Behavior**: Buttons support hardware-like drag-in/drag-out interactions:
    - **Momentary Mode**: Press inside → turns on; drag out while pressed → turns off; drag back in while pressed → turns on again. Works even when press starts outside the button.
    - **Toggle/Latch Mode**: Press inside → toggles state; drag out while pressed → no change; drag back in while pressed → toggles again. Works even when press starts outside the button.
  - **Global Pointer Tracking**: Tracks pointer state globally (not just on button element) to enable drag-in behavior from outside the button boundary.
  - **Mouse Enter/Leave Events**: Uses `mouseenter`/`mouseleave` to detect when pointer crosses button boundary while pressed.
  - **Step Sequencer Pattern**: Enables classic step sequencer interactions where multiple buttons can be activated with a single drag gesture.
- **Discrete Interaction (CycleButton)**:
  - **Core Architecture**: Interaction logic is centralized in `packages/core/src/controller/DiscreteInteractionController.ts` (pure TS class).
  - **React Adapter**: `useDiscreteInteraction` hook in `packages/react` wraps `DiscreteInteractionController` to bind it to React events.
  - **Cycling Behavior**: Click or Space/Enter cycles to the next value (wraps around to the start).
  - **Stepping Behavior**: Arrow keys step up/down through options (clamped at min/max).
  - **Value Resolution**: Automatically finds the nearest valid option index when the current value doesn't match any option.
  - **Keyboard Support**: Arrow keys for stepping, Space/Enter for cycling.
- **Note Interaction (Keys)**:
  - **Core Architecture**: Interaction logic is centralized in `packages/core/src/controller/NoteInteractionController.ts` (pure TS class).
  - **React Adapter**: `useNoteInteraction` hook in `packages/react` wraps `NoteInteractionController` to bind it to React events.
  - **Multi-Touch Support**: Tracks multiple concurrent pointers (mouse, multi-touch) for polyphonic interactions.
  - **Glissando Detection**: Detects note changes when sliding across keys, triggering note on/off events as the pointer moves between keys.
  - **Pointer Capture**: Uses pointer capture to continue receiving events even when the pointer leaves the element, enabling smooth glissando across the entire keyboard.
  - **Note Events**: Triggers `onNoteOn` when a key is pressed and `onNoteOff` when released or when moving to a different key.
  - **Touch Action**: Applies `touchAction: "none"` to prevent default touch behaviors (scrolling, zooming).
- **Focus Management**:
  - Custom highlight effect (brightness/contrast boost + shadow) replaces browser ring
  - Applied via `:focus-visible` (keyboard) and `:focus-within` (click/touch)
  - Elements receive focus naturally (no `preventDefault` on mousedown)
- **Cursor Behavior**:
  - ContinuousControl: Direction-based cursors (move/ew-resize/ns-resize/circular) when editable, pointer when clickable-only
  - DiscreteControl, BooleanControl, Keys: Pointer cursor when interactive (onChange or onClick), no cursor otherwise
  - All cursor values customizable via CSS variables (--audioui-cursor-\*)
  - During drag, cursor applied to document.body for consistent feedback
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
- CSS variables: --audioui-primary-color, --audioui-roundness-base
- Color variants computed via CSS color-mix():
  - **Transparency variants**: --audioui-primary-50, --audioui-primary-20 (50% and 20% opacity)
  - **Luminosity variants**: --audioui-primary-lighter, --audioui-primary-darker (80% color + 20% white/black for lighter/darker versions)
  - **Adaptive variants**: --audioui-adaptive-50, --audioui-adaptive-20, --audioui-adaptive-light, --audioui-adaptive-dark (same patterns for adaptive colors)
- Luminosity variants are essential for borders and outlines where transparency doesn't provide sufficient visibility
- Classes: .audioui-stroke-primary, .audioui-fill-primary, .audioui-border-primary, .audioui-text-primary (all prefixed with `audioui-`)
- Theme utilities: setThemeColor(), setThemeRoundness(), setTheme() for programmatic access
- Components read CSS variables directly; props set CSS variables as convenience API
- No Provider needed - pure CSS variable-based theming
- **Comprehensive Documentation**: See `packages/react/docs/color-system.md` for complete color system architecture, and `apps/playground-react/docs/color-integration.md` for playground integration details
- **Styling System Guidelines**: See `agents/audioui-styling-system.md` for complete styling conventions, naming patterns, constants usage, and Stylelint enforcement

## Size System

- **Base Unit System**: All component sizes derive from `--audioui-unit` (96px default). Scale is Root Phi with normal = 1.0; multipliers: xsmall 0.618 (1/φ), small 0.786 (1/√φ), normal 1, large 1.272 (√φ), xlarge 1.618 (φ)
- **Component Aspect Ratios**:
- Button, Knob, CycleButton: 1x1 (square)
- Horizontal Slider: 1x2 (width:height) - width > height
- Vertical Slider: 2x1 (width:height) - height > width
- Keys: 1x5 (width:height) - width > height
- **Implementation**: Size defined via CSS variables in `packages/core/src/styles/themes.css`; size classes in `packages/core/src/styles/styles.css` for semantic purposes; inline styles (CSS variable references) override AdaptiveBox's default 100% sizing
- **Size Props**:
  - `size`: `"xsmall" | "small" | "normal" | "large" | "xlarge"` (default `"normal"`)
  - `adaptiveSize`: boolean (default `false`)
- **When `adaptiveSize=false`**: Size class and inline size styles apply; user `style` prop spreads last (takes precedence)
- **When `adaptiveSize=true`**: No size constraints from the size system; component fills its container (AdaptiveBox default `width: 100%; height: 100%`)
- **User Override**: User `className` and `style` props take precedence over size classes/styles
- **Utilities**: `getSizeClassForComponent()` and `getSizeStyleForComponent()` take component type `"square"` (1x1: Button, Knob, CycleButton), `"keys"`, or `"slider"`; return CSS class names and inline style objects with CSS variable references
- **Location**: Size mappings in `packages/core/src/utils/sizing.ts`; CSS variables in `packages/core/src/styles/themes.css`; size classes in `packages/core/src/styles/styles.css`

## SVG View Primitives

Low-level building blocks for composing custom controls. Primitives are organized into two categories:

### Radial Primitives

For composing custom radial controls (knobs, dials, rotary encoders). All primitives share a common coordinate system (`cx`, `cy`, `radius`).

- **ValueRing**: Arc/ring indicator showing value progress; supports bipolar mode, configurable thickness/openness/roundness; stroke expands inward from radius
- **RotaryImage**: Rotates children based on normalized value; shares angle logic with ValueRing via `useArcAngle` hook; wraps RadialImage internally
- **RadialImage**: Static image or SVG content at radial coordinates; uses `preserveAspectRatio="xMidYMid meet"`
- **RadialText**: Auto-fitting text with measure-once pattern; uses reference text for consistent sizing; GPU-accelerated CSS `transform: scale()`; global font metrics cache for performance (100+ knobs = 1 measurement); `dominantBaseline="central"` with baseline correction for vertical centering
- **TickRing**: Scale decoration (ticks/lines/dots); supports optimized single-path rendering or custom content
- **LabelRing**: Scale labels (text/icons); wrapper around TickRing for easy positioning and rotation

### Linear Primitives

For composing custom linear controls (sliders, faders, pitch/mod wheels). Primitives use a linear strip model with center coordinates (`cx`, `cy`), length, and rotation.

- **LinearStrip**: Rectangle strip for linear controls; positioned at center point (cx, cy) with configurable length, thickness, rotation, and rounded corners; supports CSS variable-based roundness; used for slider tracks and fader backgrounds
- **ValueStrip**: The active (foreground) portion of a linear strip; renders the filled portion based on normalized value; supports unipolar (fills from bottom) and bipolar (fills from center) modes; used for slider value indicators and fader fills
- **LinearCursor**: Cursor that slides along a linear strip; position driven by normalized value (0.0 = bottom, 1.0 = top); supports image or SVG shape (rectangle/ellipse based on roundness); rotates around strip center (cx, cy) along with the virtual bar; images preserve natural aspect ratio; cursor length is automatically adjusted to subtract cursor height, preventing the cursor from extending beyond strip bounds

**Rotation Behavior**: All SVG primitives (Radial and Linear) use consistent rotation semantics: **positive rotation values rotate Counter-Clockwise (Left)**, negative values rotate Clockwise (Right). This matches standard mathematical conventions. For horizontal orientation, use `rotation={-90}` (or `270`).

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

- License Model: Tylium Evolutive License Framework (see `license-telf/LICENSE.md`), with accompanying `SLA.md` and `CLA.md` in `license-telf/`. Source file headers use `SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF`; the TELF version (e.g. 1.1) is defined in `license-telf/LICENSE.md`.
- Compatibility: A GPL-3.0 variant is available in `license-telf/LICENSE-GPL3.md` for open-source alignment when needed; Tylium terms govern unless explicitly stated otherwise in releases.
- Source Availability: Full source code is public.
- Distribution: Packages and releases are distributed through classical channels (e.g., public Git hosting for source; package registries/artifacts for builds where applicable).
- Contributor Guidance: Contributors agree to the Contributor License Agreement (`license-telf/CLA.md`) and grant rights consistent with the Tylium framework and any companion open-source terms in use for a given release.
- Operational Note: Package manifests may show UNLICENSED during development; the authoritative license is this section and the `license-telf/` documents until publication artifacts include SPDX identifiers.

## Sub-File Summaries

- `./agents/audioui-licensing-strategy.md`: Outlines the dual-licensing model and legal framework.
- `./agents/audioui-versioning-guidelines.md`: Details the SemVer-based versioning strategy, including developer preview conventions.
- `./agents/audioui-styling-system.md`: Comprehensive styling system guidelines covering namespace isolation, naming conventions, constants usage, Stylelint enforcement, and best practices.
- `./agents/github-issues-guidelines-1.0.md`: Guidelines for agent-driven GitHub issue create/update/close via GitHub MCP; labels, description style, repository resolution, writing conventions.
- `./packages/react/AGENTS.md`: Library specifics (exports, build, env, interaction system, generic control architecture, size system).
- `./apps/playground-react/AGENTS.md`: Playground app details (routing, integrations, env, sizing showcase).
- `./packages/react/docs/interaction-system.md`: Complete interaction system architecture, design decisions, sensitivity tuning, and implementation details for all interactive controls.
- `./packages/react/docs/size-system.md`: Complete size system architecture, base unit system, component aspect ratios, CSS variable structure, implementation details, and customization options.
- `./packages/react/docs/svg-view-primitives.md`: SVG View Primitives (ValueRing, RotaryImage, RadialImage, RadialText, RadialContent) for composing custom radial controls; includes RadialText measure-once pattern, global font cache, AudioParameterConverter integration, and RadialContent foreignObject approach for rich HTML content.
