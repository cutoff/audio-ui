<!--
 Copyright (c) 2026 Tylium.
 SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 See LICENSE.md for details.
-->

**Version**: 2.0 | **Meta**: Extends root AGENTS.md for playground app details (routing, theming, integrations, env). This app is an internal playground, not the final public documentation.

## Quick Setup Summary (Load This First)

| Category     | Details                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Scripts      | `pnpm dev`, `pnpm build`, `pnpm typecheck`, `pnpm lint`                                                                              |
| Env Vars     | None                                                                                                                                 |
| Routing      | Next.js app router; pages in app/[route]/page.tsx; categories: examples, controls, devices                                           |
| Theming      | next-themes for theme switching; theme controls in header (ThemeSettingsButton, ThemeModeToggle); responsive sheet for customization |
| Integrations | Import library components for showcases; Radix via shadcn; forms, routing                                                            |

## Key File Structure

- `app/layout.tsx`: Root layout with header containing theme controls
- `app/page.tsx`: Home page
- `app/[route]/page.tsx`: Demo pages (e.g., app/controls/button/page.tsx for Button demo)
- `app/layout/sizing/page.tsx`: Centralized sizing system showcase (all components, all sizes)
- `app/providers.tsx`: Context providers (theme initialization, global theme state)
- `components/ui/`: **shadcn components ONLY** - do not add custom components here; **NEVER modify shadcn components** - they are third-party stabilized code; work around type issues with type assertions/ts-expect-error if needed
- `components/`: Custom playground components (e.g., ColorPickerField, ComponentSkeletonPage, ControlSkeletonPage, theme-settings-button, theme-settings-panel, theme-mode-toggle)
- `components/examples/`: Custom library component examples (see `components/examples/README.md` for creation guide)
- `lib/`: Utils (e.g., cn for clsx)
- `hooks/`: Custom hooks (e.g., use-mobile)
- `types/`: TypeScript types
- `public/`: Static assets

## Workflow Patterns (Bullets)

- Add new playground page: Create app/[route]/[component]/page.tsx; import from @cutoff/audio-ui-react; add examples with props; use shadcn for UI
- Control demo pages: Use `ControlSkeletonPage` component; examples use `size="large"` for visibility; no individual Size showcases (centralized in `/layout/sizing`)
- Sizing showcase: Centralized at `/layout/sizing`; showcases all components (Button, Knob, CycleButton, Slider, Keys) with all sizes (xsmall through xlarge)
- Theming: next-themes in providers; theme controls in header (ThemeSettingsButton, ThemeModeToggle); responsive sheet for theme customization
- Testing demos: Run pnpm dev; validate components from library
- Building: pnpm build for prod; Next.js optimization
- UI: Use shadcn; add if missing with `pnpm dlx shadcn@latest add [component]`; **NEVER modify shadcn components** - they are third-party stabilized code; work around type issues with type assertions/ts-expect-error if needed
- Component organization: shadcn components go in `components/ui/`; custom playground components go in `components/` (not in `components/ui/`)

## Agent Note

Validate components imported from library; ensure playground showcases accurately; refer to root for library build; use `thinking` for complex integrations. Final, developer-oriented documentation with live components exists in a separate website monorepo (Next.js + MDX).

## Theme Settings UI

Theme customization controls are located in the header (not in the sidebar):

- **ThemeSettingsButton**: Header button that opens a responsive sheet with theme customization options
  - Desktop/Tablet: Right-side sheet (no overlay for real-time preview)
  - Mobile: Bottom sheet (no overlay for real-time preview)
  - Contains color selector and roundness slider
  - Settings persist across sheet opens via global state

- **ThemeModeToggle**: Header button that cycles through System → Light → Dark → System
  - Shows appropriate icon (Monitor/Sun/Moon) with tooltip
  - Handles hydration properly

- **ThemeSettingsPanel**: Reusable panel component containing color and roundness controls
  - Used inside the theme settings sheet
  - Reads from and writes to global theme state (`audioUiThemeState`)
  - Initializes with default adaptive theme if no theme is set

- **Implementation Details**:
  - Theme settings are stored in global state (`app/providers.tsx`)
  - Default adaptive theme is set on app initialization
  - Sheet has no overlay to allow real-time preview of theme changes
  - Settings persist across component remounts

## Shared Conventions

- `agents/react-conventions-2.0.md`: React patterns, hooks
- `agents/documentation-standards-2.0.md`: Docs for pages
- `agents/typescript-guidelines-2.0.md`: TS in demo
- `agents/coding-conventions-2.0.md`: Code style
