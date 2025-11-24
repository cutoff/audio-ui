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
│   │   ├── controls/    # Interactive controls (Button, Knob, Slider, etc.)
│   │   ├── svg/         # Low-level SVG primitives shared by controls
│   │   ├── providers/   # Context providers (AudioUiProvider)
│   │   ├── AdaptiveBox.tsx  # Layout wrapper used by SVG controls + labels
│   │   ├── Option.tsx       # Primitive option wrapper consumed by controls
│   │   └── Keybed.tsx       # Keyboard component composed of SVG primitives
│   ├── styles/          # Style constants and utilities
│   ├── index.ts         # Main exports
│   ├── styles.css       # Component styles
│   └── themes.css       # Theme definitions
├── dist/                # Built output (generated)
├── docs/                # Technical documentation
└── package.json
```

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

## Version Compatibility

**Critical**: This project maintains React 18 compatibility. Before making changes:

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

1. Create component file in `src/components/`
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

## Documentation

Technical documentation is located in `docs/`:

- **`docs/adaptive-box-layout.md`**: AdaptiveBox layout system specification
- **`docs/color-system.md`**: Complete color system architecture
- **`docs/color-property-examples.md`**: Practical color property usage examples
- **`docs/Keybed-MiddleC-Positions.md`**: MIDI keyboard positioning specifications

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
