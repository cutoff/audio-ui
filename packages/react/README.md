# @cutoff/audio-ui-react - Development Guide

This package contains the React component library for AudioUI.

> **For general usage, installation, and component documentation, see the [main README](../../README.md) at the project root.**

## Development Setup

### Prerequisites

- Node.js (version 18 or higher)
- pnpm (version 10.20.0 or higher)

### Quick Start

```bash
# From the repository root, install all dependencies
pnpm install

# Build the library
pnpm build --filter @cutoff/audio-ui-react

# Or from this directory
cd packages/react
pnpm build
```

## Project Structure

```
packages/react/
├── src/
│   ├── components/      # React components
│   │   ├── defaults/    # Default/built-in components
│   │   │   ├── controls/  # Interactive controls (Button, Knob, Slider, CycleButton) and SVG views
│   │   │   └── devices/   # Device components (Keys)
│   │   ├── generic/     # Generic components (FilmStrip controls, Image-based controls)
│   │   │   └── controls/  # Filmstrip and image-based control implementations
│   │   ├── primitives/  # Base components for building final components
│   │   │   ├── controls/  # Control primitives (ContinuousControl, DiscreteControl, BooleanControl, OptionView)
│   │   │   └── svg/       # SVG view primitives (ValueRing, RotaryImage, RadialImage, etc.)
│   │   └── types.ts      # Shared type definitions
│   ├── hooks/           # Hooks wrapping core logic (useContinuousInteraction, useAudioParameter, etc.)
│   ├── utils/           # Utility functions (theme utilities)
│   └── index.ts         # Main exports
├── dist/                # Built output (generated)
├── docs/                # Technical documentation
└── package.json
```

Note: Logic, styles, and constants are imported from `@cutoff/audio-ui-core`.

## Development Workflow

### Building the Library

```bash
# From repository root
pnpm build --filter @cutoff/audio-ui-react

# Or from this directory
cd packages/react
pnpm build
```

### Type Checking

```bash
# From repository root
pnpm typecheck --filter @cutoff/audio-ui-react

# Or from this directory
cd packages/react
pnpm typecheck
```

### Running Tests

```bash
# From repository root
pnpm test --filter @cutoff/audio-ui-react

# Or from this directory
cd packages/react
pnpm test
```

### Local Development with Playground

The playground application (`apps/playground-react`) automatically uses the workspace version of this package. No linking is required when using pnpm workspaces.

To develop and test changes:

1. Make changes to components in `packages/react/src/`
2. The playground app will pick up changes automatically (or rebuild if needed)
3. Run the playground: `pnpm dev` from the repository root

## React Version Requirements

**Critical**: This project requires React 18. Before making changes:

```bash
# Check React versions
pnpm ls react @types/react

# Should show React 18.x versions consistently
```

If you encounter version conflicts:

1. Install React 18 versions: `pnpm add react@^18.3.1 react-dom@^18.3.1 @types/react@^18.3.23 -w`
2. Run type checks: `pnpm typecheck`
3. Rebuild: `pnpm build`

## Component Development

### Adding New Components

1. Create component file in:
   - `src/components/defaults/controls/` (for built-in controls with theming)
   - `src/components/generic/controls/` (for generic components like filmstrip/image-based)
   - `src/components/primitives/controls/` (for control primitives)
   - `src/components/primitives/svg/` (for SVG view primitives)
2. Export from `src/index.ts`
3. Add demo page in `apps/playground-react/app/controls/[component-name]/page.tsx` (or appropriate category)
4. Build and test: `pnpm build && pnpm typecheck`

### Component Guidelines

- Use TypeScript with strict mode
- Define props interfaces with JSDoc comments
- Use functional components with hooks
- Prefix unused parameters with underscore (`_param`)
- Follow existing patterns for styling and theming
- All components must have `"use client";` directive (Client Components)
- **Use TypeScript path aliases** instead of relative paths:
  - `@/primitives/*` for primitives components
  - `@/hooks/*` for hooks
  - `@/defaults/*` for default components
  - `@/utils/*` for utilities
  - `@/types` for type definitions

### TypeScript Path Aliases

The library uses path aliases to simplify imports. Use these instead of relative paths:

```typescript
// ✅ Good - using aliases
import AdaptiveBox from "@/primitives/AdaptiveBox";
import { useAudioParameter } from "@/hooks/useAudioParameter";
import { setThemeColor } from "@/utils/theme";
import { AdaptiveBoxProps } from "@/types";

// ❌ Avoid - relative paths
import AdaptiveBox from "../../primitives/AdaptiveBox";
import { useAudioParameter } from "../../../hooks/useAudioParameter";
```

Available aliases:

- `@/primitives/*` → `src/components/primitives/*`
- `@/hooks/*` → `src/hooks/*`
- `@/defaults/*` → `src/components/defaults/*`
- `@/utils/*` → `src/utils/*`
- `@/types` → `src/components/types`

## Documentation

Technical documentation is located in `docs/`:

- **`docs/adaptive-box-layout.md`**: AdaptiveBox layout system specification
- **`docs/color-system.md`**: Complete color system architecture
- **`docs/color-property-examples.md`**: Practical color property usage examples
- **`docs/cycle-button-architecture.md`**: CycleButton component architecture and design
- **`docs/interaction-system.md`**: Complete interaction system architecture (drag, wheel, keyboard)
- **`docs/keys-middle-c-positions.md`**: MIDI keyboard positioning specifications
- **`docs/parameter-specs.md`**: Audio parameter specification and tripartite value system
- **`docs/size-system.md`**: Component sizing system architecture
- **`docs/svg-view-primitives.md`**: SVG view primitives for building custom controls
- **`docs/text-rendering-strategy.md`**: Text rendering and measurement strategies
- **`docs/webkit-foreignobject-issues.md`**: WebKit foreignObject compatibility notes

## Common Development Tasks

### Testing Changes

```bash
# Build and type check
pnpm build && pnpm typecheck

# Run tests
pnpm test

# Test visually in playground app (from root)
pnpm dev
```

### Troubleshooting

**React type errors**: Usually indicates version mismatch

```bash
pnpm ls react @types/react
# Fix by installing consistent React 18 versions
```

**Build failures**: Check TypeScript errors

```bash
pnpm typecheck  # Shows detailed error information
```

**Playground app not updating**: Rebuild library first

```bash
# From root
pnpm build --filter @cutoff/audio-ui-react
pnpm dev
```

## Contributing

1. Ensure React 18 compatibility
2. Run type checks before committing: `pnpm typecheck`
3. Test changes in playground app: `pnpm dev`
4. Update documentation as needed

For detailed component API and usage examples, see the [main README](../../README.md).
