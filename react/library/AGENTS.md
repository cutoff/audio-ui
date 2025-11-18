**Version**: 2.0 | **Meta**: Extends root AGENTS.md for library internals (component exports, build, env).

## Quick Setup Summary (Load This First)

| Category            | Details                                                                                                                                                                      |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Scripts             | `pnpm build`, `pnpm typecheck`, `pnpm test`, `pnpm link`                                                                                                                     |
| Env Vars            | None                                                                                                                                                                         |
| Component Structure | Props with JSDoc; default params; function ComponentName() {}; arrow functions for handlers; SVG for graphics                                                                |
| Exports             | All from src/index.ts: Components (Button, Knob, Slider, Keybed, AdaptiveBox, etc.), Providers (AudioUiProvider, hooks), Types, Utils (formatters, note utils), Theme colors |
| Testing             | Vitest; .test.tsx alongside; mock deps; React 18 compat                                                                                                                      |
| Build               | Vite; generates dist/index.js, index.d.ts, style.css; ES modules                                                                                                             |

## Key File Structure

- `src/components/`: Component .tsx with .test.tsx
- `src/index.ts`: Export all components, types, utilities, and theme colors
- `src/themes.css`: Theme CSS variables (primary colors only; variants computed by components)
- `src/styles.css`: Base styles, utility classes, imports themes.css
- `src/themeColors.ts`: Exports predefined theme colors (themeColors, themeColorsDirect)
- `dist/`: Built output (index.js, index.d.ts, style.css)
- `docs/`: Technical documentation (see Documentation section below)

## Workflow Patterns

- Component dev: Function declarations; hooks; CSS classes/inline; theming utility classes
- Build: `pnpm build`; Vite with declarations
- Test: Alongside; e.g., render Button, expect class
- Local dev: `pnpm link`; demo imports
- TS: Prefix unused params with \_; strict

Agent Note: Enforce from agents/typescript-guidelines-2.0.md; read docs/ for AdaptiveBox, color system, and component-specific documentation.

## Documentation

Technical documentation is located in `docs/`:

- **`docs/adaptive-box-layout.md`**: Comprehensive specification for AdaptiveBox layout system (CSS/SVG-based, replaces AdaptiveContainer + SvgSurface). Covers DOM structure, sizing algorithms, label modes, alignment controls, and React API mapping.

- **`docs/color-system.md`**: Complete color system architecture documentation. Covers axioms & requirements, CSS theme variables, color utilities (`generateColorVariants`, `getAdaptiveDefaultColor`), component color resolution hierarchy, theme provider system (`AudioUiProvider`, `useThemableProps`), predefined theme colors, usage examples, and performance optimizations.

- **`docs/color-property-examples.md`**: Practical examples of using the `color` property with components. Includes basic usage, color animation, combining with other properties, dynamic colors, and component-specific color handling (Keybed luminosity variants).

- **`docs/Keybed-MiddleC-Positions.md`**: Specifications for middle C positions on physical MIDI keyboards. Documents standard layouts for common keyboard sizes (25-88 keys), MIDI note numbering conventions, visual representations, and transposition considerations.

**Reference these docs when:**

- Working with AdaptiveBox component (layout, sizing, alignment)
- Implementing or modifying color theming
- Using color properties in components
- Working with Keybed component (MIDI note positioning)

## Shared Conventions

- `agents/react-conventions-2.0.md`: Components/hooks
- `agents/typescript-guidelines-2.0.md`: TS
- `agents/documentation-standards-2.0.md`: JSDoc
- `agents/coding-conventions-2.0.md`: Formatting
