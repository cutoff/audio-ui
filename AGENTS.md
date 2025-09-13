# Audio UI Development Guide for LLMs

This document provides essential information for LLMs working on the Audio UI project, a React component library for
audio and MIDI applications.

**IMPORTANT: Documentation File Structure**

- This file (AGENTS.md) is the primary documentation file for LLMs.
- CLAUDE.md and GEMINI.md are symbolic links to this file.
- Always edit AGENTS.md directly. Never attempt to modify CLAUDE.md or GEMINI.md as they are just symbolic links.
- Any changes made to AGENTS.md will automatically be reflected in CLAUDE.md and GEMINI.md.

**IMPORTANT: This library has never been released.** There is no need to maintain backward compatibility with previous
versions. All design decisions should prioritize clean, maintainable code over backward compatibility.

## CRITICAL: React Version Policy

**This project MUST maintain React 18 compatibility.**

- **Library**: Uses React 18 as peer dependency (`react: ^18.2.0`, `react-dom: ^18.2.0`)
- **Demo App**: Uses React 18 as direct dependency (`react: ^18.3.1`, `react-dom: ^18.3.1`)
- **TypeScript Types**: Uses `@types/react: ^18.3.23` and `@types/react-dom: ^18.3.7`

**NEVER upgrade to React 19 or higher without explicit approval.**

If you encounter React version conflicts:

1. Check `pnpm ls react @types/react` to identify version mismatches
2. Downgrade to React 18 compatible versions
3. Run `pnpm typecheck` to verify TypeScript compatibility
4. Ensure all dependencies are compatible with React 18

## Project Structure

The project is organized as a monorepo with the following structure:

- `react/` - Contains the React implementation
    - `library/` - The component library (React 18 peer dependencies)
        - `src/` - Source code for the components
        - `dist/` - Built output (generated)
    - `demo-app/` - Next.js application for demonstrating the components (React 18 direct dependencies)

## Build/Configuration Instructions

### Build and Test Commands

The project has been updated to fix previous issues with pnpm scripts. You can now safely run the following commands:

- `pnpm typecheck` - Run TypeScript type checking
- `pnpm build` - Build the library
- `pnpm test` - Run unit tests
- `pnpm clean` - Clean build artifacts
- `pnpm format` - Format code with Prettier

Because of some persisting issues, never run the development server for testing:

- `pnpm dev` (in react/demo-app directory) - Start the development server

### Setting Up the Project

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Build the library:
   ```bash
   pnpm build
   ```

3. Run the demo application:
   ```bash
   cd react/demo-app
   pnpm dev
   ```

   Or run type checking:
   ```bash
   pnpm typecheck
   ```

### Library Development

The library uses Vite for building and TypeScript for type checking:

- Build the library:
  ```bash
  cd react/library
  pnpm build
  ```

- Type check the library:
  ```bash
  cd react/library
  pnpm typecheck
  ```

- Link the library for local development:
  ```bash
  cd react/library
  pnpm link
  ```

## Testing Information

### Running Tests

You can now safely run tests with:

```bash
cd react/library
pnpm test
```

You can also use static analysis for additional code quality checks:

```bash
cd react/library
pnpm typecheck
# Use ESLint for code quality checks
pnpm lint
```

### Writing Tests

Tests should be placed alongside the components they test with a `.test.tsx` extension. Here's an example test for the
Button component:

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import Button from './Button';

describe('Button Component', () => {
  test('renders with default props', () => {
    render(<Button />);
    // The button should be rendered with default styling
    const buttonElement = document.querySelector('rect');
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement).toHaveClass('stroke-primary-20');
    expect(buttonElement).toHaveClass('fill-primary-50');
  });

  test('renders with custom label', () => {
    render(<Button label="Test Button" />);
    // The button should display the provided label
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  test('changes appearance when value is above center', () => {
    render(<Button value={75} center={50} />);
    // The button should have the "on" styling
    const buttonElement = document.querySelector('rect');
    expect(buttonElement).toHaveClass('stroke-primary-50');
    expect(buttonElement).toHaveClass('fill-primary');
  });
});
```

## Additional Development Information

### TypeScript Configuration

The project uses strict TypeScript configuration with the following settings:

- `strict: true` - Enables all strict type checking options
- `noUnusedLocals: true` - Reports errors on unused locals
- `noUnusedParameters: true` - Reports errors on unused parameters
- `noImplicitReturns: true` - Reports error when not all code paths in function return a value

### Component Structure

Components follow these patterns:

1. Props are defined using TypeScript interfaces or types with JSDoc comments
2. Default values are provided using parameter defaults
3. Components use functional style with hooks
4. Styling is applied using CSS classes and inline styles

### CSS Styling

The project uses a combination of:

1. CSS classes for theming (primary colors, text colors)
2. Inline styles for layout and positioning
3. CSS Grid for component layout

### Demo Application

The demo application is built with Next.js and showcases the components in the library. To add a new component demo:

1. Create a new page in the `react/demo-app/app/components/` directory
2. Import and use the component from the library
3. Add examples and documentation

You can now safely run the demo application with:

```bash
cd react/demo-app
pnpm dev
```

You can also use static analysis for code quality checks:

```bash
cd react/demo-app
pnpm typecheck
# Use ESLint for code quality checks
pnpm lint
```

## LLM-Specific Development Guidelines

### Version Compatibility Troubleshooting

When encountering TypeScript errors, follow this debugging sequence:

1. **Check React versions**: Run `pnpm ls react @types/react` to identify version mismatches
2. **Verify package.json**: Ensure all React dependencies specify React 18 versions
3. **Fix version conflicts**: Use
   `pnpm install react@^18.3.1 react-dom@^18.3.1 @types/react@^18.3.23 @types/react-dom@^18.3.7`
4. **Run type checks**: Execute `pnpm typecheck` in both library and demo app
5. **Build verification**: Run `pnpm build` to ensure no compilation errors

### Component Development Patterns

Components in this library follow these conventions:

- **Props interfaces**: Define with JSDoc comments for documentation
- **Default values**: Use parameter defaults, not `defaultProps`
- **Functional components**: Use hooks, avoid class components
- **TypeScript**: Strict mode enabled, handle all type errors
- **Unused parameters**: Prefix with underscore (e.g., `_props`) to avoid TS errors

### Common Issues and Solutions

1. **"ReactNode" type conflicts**: Usually caused by React 19 types mixed with React 18 runtime
2. **"ForwardRefExoticComponent" errors**: Indicates version mismatch between React types and runtime
3. **"Property 'children' is missing"**: React 19 type definitions have different ReactPortal requirements

### Important: Focus on Task-Related Issues Only

When working on a specific task:

- **Do not fix TypeScript errors unrelated to your current task**, even if detected by `pnpm typecheck`
- Many TypeScript errors in the codebase are known, detected by the compiler, and deliberately ignored
- Fixing unrelated TypeScript issues can distract from your main task and create unnecessary changes
- Focus only on issues directly related to implementing the specific requirements in your current task

### Testing Requirements

- Use Vitest for testing (integrated with Vite build system)
- Test files: `*.test.tsx` or `*.test.ts` alongside components
- Mock external dependencies using Vitest's mocking capabilities
- Ensure tests pass with React 18 compatibility

### Build Process

1. **Library build**: Uses Vite with TypeScript declaration generation
2. **Demo app build**: Uses Next.js 15 with React 18 compatibility
3. **Type checking**: Run `pnpm typecheck` before commits
4. **Linting**: Address ESLint warnings, especially TypeScript-related ones

### File Structure Guidelines

- Components in `react/library/src/components/`
- Export all components from `react/library/src/index.ts`
- Demo pages in `react/demo-app/app/components/[component-name]/page.tsx`
- Shared UI components in `react/demo-app/components/ui/`
- Specialized technical documentation in `react/library/docs/` (intended for contributors)

### Performance Considerations

- Library is built as ES modules for tree-shaking
- Components use SVG for scalable graphics
- CSS is minimal and uses CSS custom properties for theming
- Demo app uses Next.js optimization features

## Development Standards and Conventions

This project follows JetBrains' standard development practices. We've organized these standards into reusable guides
that can be applied across projects:

- [Coding Conventions](./agents/coding-conventions.md) - General formatting, naming, and code organization practices
- [TypeScript Guidelines](./agents/typescript-guidelines.md) - TypeScript-specific best practices and patterns
- [React Conventions](./agents/react-conventions.md) - React component patterns, hooks usage, and JSX standards
- [Documentation Standards](./agents/documentation-standards.md) - JSDoc and other documentation requirements

These guides provide detailed information on our development standards. For project-specific configuration:

### ESLint Configuration

The project uses ESLint with TypeScript support. Always run ESLint before committing code:

```bash
pnpm lint
```

### Prettier Configuration

The project uses Prettier with a JSON configuration file (`.prettierrc.json`). See [PRETTIER.md](./PRETTIER.md) for
detailed documentation of all Prettier settings.

Run Prettier to automatically format code:

```bash
pnpm format
```

## AdaptiveSvgComponent – CSS-based sizing (Sept 2025 update)

The AdaptiveSvgComponent has been refactored to remove ResizeObserver and all JS-driven layout math. Sizing and fitting
are now handled purely by CSS/SVG:

- Container (outer div)
    - display: flex (stretch=true) or inline-flex (stretch=false) to allow inner content alignment within grid/flex
      cells
    - overflow: hidden to ensure no spillover
    - container-type: inline-size for future container query support
    - In fixed mode, the container sets a concrete width in px based on preferredWidth (respecting minWidth) and uses
      CSS aspect-ratio: viewBoxWidth / viewBoxHeight to derive height
    - In stretch mode, the container fills its cell (width/height 100%) and acts as a flex box for inner alignment
- Inner SVG
    - viewBox is preserved per component shape
    - preserveAspectRatio="xMidYMid meet"
    - Fixed mode: width/height 100% to fill the container box defined by aspect-ratio
    - Stretch mode: width/height auto with maxWidth/maxHeight 100% plus an aspect-ratio to maintain shape; the limiting
      axis is chosen by the browser
- Alignment mapping for demo grid
    - The component reads alignSelf/justifySelf from the style prop (as used by the demo grid) and maps these keywords (
      start | end | center) to flex alignItems/justifyContent on the container. This preserves the demo’s grid alignment
      semantics (start/end/center columns).
- Min sizes
    - minWidth/minHeight props are honored via CSS on the container so controls never become unusably small.

Implications:

- No JS measurements or debounce are needed; resizing is declarative and smooth.
- Zoomable control surfaces are naturally supported: the browser picks the limiting axis (width or height) based on
  aspect ratio.
- Event handling (e.g., wheel) remains unchanged and is managed on the SVG.
