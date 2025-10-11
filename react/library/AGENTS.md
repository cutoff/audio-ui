**Version**: 2.0 | **Meta**: Extends root AGENTS.md for library internals (component exports, build, env).

## Quick Setup Summary (Load This First)

| Category | Details |
|----------|---------|
| Scripts | `pnpm build`, `pnpm typecheck`, `pnpm test`, `pnpm link` |
| Env Vars | None |
| Component Structure | Props with JSDoc; default params; function ComponentName() {}; arrow functions for handlers; SVG for graphics |
| Exports | All from src/index.ts (Button, Knob, etc.) |
| Testing | Vitest; .test.tsx alongside; mock deps; React 18 compat |
| Build | Vite; generates dist/index.js, index.d.ts, style.css; ES modules |

## Key File Structure

- `src/components/`: Component .tsx with .test.tsx
- `src/index.ts`: Export all components
- `src/themes.css`: Theme vars
- `src/styles.css`: Maps --primary-color* to themes
- `dist/`: Built output
- `docs/`: adaptive-box-layout.md

## Workflow Patterns

- Component dev: Function declarations; hooks; CSS classes/inline; theming utility classes
- Build: `pnpm build`; Vite with declarations
- Test: Alongside; e.g., render Button, expect class
- Local dev: `pnpm link`; demo imports
- TS: Prefix unused params with _; strict

Agent Note: Enforce from agents/typescript-guidelines-2.0.md; read docs/ for AdaptiveBox.

## Shared Conventions

- `agents/react-conventions-2.0.md`: Components/hooks
- `agents/typescript-guidelines-2.0.md`: TS
- `agents/documentation-standards-2.0.md`: JSDoc
- `agents/coding-conventions-2.0.md`: Formatting