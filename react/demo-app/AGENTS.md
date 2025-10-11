**Version**: 2.0 | **Meta**: Extends root AGENTS.md for demo app details (routing, theming, integrations, env).

## Quick Setup Summary (Load This First)

| Category | Details |
|----------|---------|
| Scripts | `pnpm dev`, `pnpm build`, `pnpm typecheck`, `pnpm lint` |
| Env Vars | None |
| Routing | Next.js app router; pages in app/[route]/page.tsx; categories: examples, controls, devices |
| Theming | next-themes for theme switching; add/remove 'dark' class on root; shadcn-like |
| Integrations | Import library components for showcases; Radix via shadcn; forms, routing |

## Key File Structure

- `app/layout.tsx`: Root layout
- `app/page.tsx`: Home page
- `app/[route]/page.tsx`: Demo pages (e.g., app/controls/button/page.tsx for Button demo)
- `app/providers.tsx`: Context providers (theme, etc.)
- `components/ui/`: shadcn components
- `lib/`: Utils (e.g., cn for clsx)
- `hooks/`: Custom hooks
- `types/`: TypeScript types
- `public/`: Static assets

## Workflow Patterns (Bullets)

- Add new demo: Create app/[route]/[component]/page.tsx; import from @cutoff/audio-ui-react; add examples with props; use shadcn for UI
- Theming: next-themes in providers; toggle dark mode
- Testing demos: Run pnpm dev; validate components from library
- Building: pnpm build for prod; Next.js optimization
- UI: Use shadcn; add if missing with `pnpm dlx shadcn@latest add [component]`; no alter unless told

## Agent Note

Validate components imported from library; ensure demo showcases accurately; refer to root for library build; use `thinking` for complex integrations.

## Shared Conventions

- `agents/react-conventions-2.0.md`: React patterns, hooks
- `agents/documentation-standards-2.0.md`: Docs for pages
- `agents/typescript-guidelines-2.0.md`: TS in demo
- `agents/coding-conventions-2.0.md`: Code style