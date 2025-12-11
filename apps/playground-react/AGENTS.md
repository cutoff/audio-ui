**Version**: 2.0 | **Meta**: Extends root AGENTS.md for playground app details (routing, theming, integrations, env). This app is an internal playground, not the final public documentation.

## Quick Setup Summary (Load This First)

| Category     | Details                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------ |
| Scripts      | `pnpm dev`, `pnpm build`, `pnpm typecheck`, `pnpm lint`                                    |
| Env Vars     | None                                                                                       |
| Routing      | Next.js app router; pages in app/[route]/page.tsx; categories: examples, controls, devices |
| Theming      | next-themes for theme switching; add/remove 'dark' class on root; shadcn-like              |
| Integrations | Import library components for showcases; Radix via shadcn; forms, routing                  |

## Key File Structure

- `app/layout.tsx`: Root layout
- `app/page.tsx`: Home page
- `app/[route]/page.tsx`: Demo pages (e.g., app/controls/button/page.tsx for Button demo)
- `app/layout/sizing/page.tsx`: Centralized sizing system showcase (all components, all sizes)
- `app/providers.tsx`: Context providers (theme, etc.)
- `components/ui/`: **shadcn components ONLY** - do not add custom components here
- `components/`: Custom playground components (e.g., ColorPickerField, ComponentSkeletonPage, ControlSkeletonPage)
- `lib/`: Utils (e.g., cn for clsx)
- `hooks/`: Custom hooks
- `types/`: TypeScript types
- `public/`: Static assets

## Workflow Patterns (Bullets)

- Add new playground page: Create app/[route]/[component]/page.tsx; import from @cutoff/audio-ui-react; add examples with props; use shadcn for UI
- Control demo pages: Use `ControlSkeletonPage` component; examples use `size="large"` for visibility; no individual Size showcases (centralized in `/layout/sizing`)
- Sizing showcase: Centralized at `/layout/sizing`; showcases all components (Button, Knob, KnobSwitch, Slider, Keybed) with all sizes (xsmall through xlarge)
- Theming: next-themes in providers; toggle dark mode
- Testing demos: Run pnpm dev; validate components from library
- Building: pnpm build for prod; Next.js optimization
- UI: Use shadcn; add if missing with `pnpm dlx shadcn@latest add [component]`; no alter unless told
- Component organization: shadcn components go in `components/ui/`; custom playground components go in `components/` (not in `components/ui/`)

## Agent Note

Validate components imported from library; ensure playground showcases accurately; refer to root for library build; use `thinking` for complex integrations. Final, developer-oriented documentation with live components exists in a separate website monorepo (Next.js + MDX).

## Shared Conventions

- `agents/react-conventions-2.0.md`: React patterns, hooks
- `agents/documentation-standards-2.0.md`: Docs for pages
- `agents/typescript-guidelines-2.0.md`: TS in demo
- `agents/coding-conventions-2.0.md`: Code style
