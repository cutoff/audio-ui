# Audio UI Development Guide for LLMs

This document provides essential information for LLMs working on the Audio UI project, a React component library for
audio and MIDI applications.

**IMPORTANT: This library has never been released.** There is no need to maintain backward compatibility with previous
versions. All design decisions should prioritize clean, maintainable code over backward compatibility.

## CRITICAL: React Version Policy

**This project MUST maintain React 18 compatibility.**

- **Library**: Uses React 18 as peer dependency (`react: ^18.2.0`, `react-dom: ^18.2.0`)
- **Demo App**: Uses React 18 as direct dependency (`react: ^18.3.1`, `react-dom: ^18.3.1`)
- **TypeScript Types**: Uses `@types/react: ^18.3.23` and `@types/react-dom: ^18.3.7`

**NEVER upgrade to React 19 or higher without explicit approval.**

If you encounter React version conflicts:

1. Check `npm ls react @types/react` to identify version mismatches
2. Downgrade to React 18 compatible versions
3. Run `npm run typecheck` to verify TypeScript compatibility
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

The project has been updated to fix previous issues with npm scripts. You can now safely run the following commands:

- `npm run typecheck` - Run TypeScript type checking
- `npm run build` - Build the library
- `npm run test` - Run unit tests
- `npm run clean` - Clean build artifacts
- `npm run format` - Format code with Prettier

Because of some persisting issues, never run the development server for testing:

- `npm run dev` (in react/demo-app directory) - Start the development server

### Setting Up the Project

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the library:
   ```bash
   npm run build
   ```

3. Run the demo application:
   ```bash
   cd react/demo-app
   npm run dev
   ```
   
   Or run type checking:
   ```bash
   npm run typecheck
   ```

### Library Development

The library uses Vite for building and TypeScript for type checking:

- Build the library:
  ```bash
  cd react/library
  npm run build
  ```

- Type check the library:
  ```bash
  cd react/library
  npm run typecheck
  ```

- Link the library for local development:
  ```bash
  cd react/library
  npm link
  ```

## Testing Information

### Running Tests

You can now safely run tests with:

```bash
cd react/library
npm test
```

You can also use static analysis for additional code quality checks:

```bash
cd react/library
npm run typecheck
# Use ESLint for code quality checks
npm run lint
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
npm run dev
```

You can also use static analysis for code quality checks:

```bash
cd react/demo-app
npm run typecheck
# Use ESLint for code quality checks
npm run lint
```

## LLM-Specific Development Guidelines

### Version Compatibility Troubleshooting

When encountering TypeScript errors, follow this debugging sequence:

1. **Check React versions**: Run `npm ls react @types/react` to identify version mismatches
2. **Verify package.json**: Ensure all React dependencies specify React 18 versions
3. **Fix version conflicts**: Use
   `npm install react@^18.3.1 react-dom@^18.3.1 @types/react@^18.3.23 @types/react-dom@^18.3.7`
4. **Run type checks**: Execute `npm run typecheck` in both library and demo app
5. **Build verification**: Run `npm run build` to ensure no compilation errors

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

### Testing Requirements

- Use Vitest for testing (integrated with Vite build system)
- Test files: `*.test.tsx` or `*.test.ts` alongside components
- Mock external dependencies using Vitest's mocking capabilities
- Ensure tests pass with React 18 compatibility

### Build Process

1. **Library build**: Uses Vite with TypeScript declaration generation
2. **Demo app build**: Uses Next.js 15 with React 18 compatibility
3. **Type checking**: Run `npm run typecheck` before commits
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

## Coding Conventions (JetBrains Defaults)

This project follows JetBrains' default coding conventions for JavaScript and TypeScript. Adhering to these conventions
ensures code consistency and readability across the project.

### Formatting

- **Indentation**: 4 spaces (not tabs)
- **Line length**: Maximum 120 characters
- **Braces**:
    - Opening brace on the same line as the statement
    - Closing brace aligned with the original statement
- **Spacing**:
    - Space after keywords (`if`, `for`, `while`, etc.)
    - Space around operators (`+`, `-`, `=`, etc.)
    - No space between function name and parentheses
    - Space after commas in argument lists
    - No space after property name and before colon in object literals, but space after colon: `{width: 50}`
- **String literals**:
    - Use double quotes (`"`) rather than single quotes (`'`) for string literals
    - Use template literals (backticks) when string interpolation is needed or for multi-line strings
- **Line breaks**:
    - Line break after opening brace
    - Line break before closing brace
    - Line break after semicolons
- **Semicolons**: Generally required at the end of statements
    - Required in .ts files
    - May be omitted in some .tsx files, particularly in the demo app
- **Control structures**:
    - Switch-case statements have cases indented inside the switch block
    - Case blocks are further indented inside each case

### Naming Conventions

- **Variables and functions**: camelCase
- **Classes and interfaces**: PascalCase
- **Constants**: UPPER_SNAKE_CASE for true constants, camelCase for variables that won't be reassigned
- **Private properties**: camelCase with no underscore prefix
- **Type parameters**: PascalCase, typically single letters (T, K, V) or descriptive names with a 'T' suffix
- **Enum members**: PascalCase
- **File names**: Match the main export, typically PascalCase for components

### Code Organization

- **Imports**: Grouped and sorted:
    1. React and React-related imports
    2. Third-party library imports
    3. Project imports (absolute paths)
    4. Project imports (relative paths)
    5. CSS/style imports
- **Component structure**:
    1. Type definitions and interfaces
    2. JSDoc component documentation
    3. Component function
    4. Helper functions and hooks
    5. Default export
- **Props**: Destructured in function parameters with default values

### TypeScript Specifics

- **Type annotations**: Use explicit type annotations for function parameters and return types
- **Interfaces vs Types**: Prefer interfaces for object shapes, types for unions/intersections
- **Generics**: Use generics with constraints when appropriate
- **Optional properties**: Use the `?` operator for optional properties
- **Null handling**: Avoid `null`, prefer `undefined` for optional values
- **Type assertions**: Use `as` syntax rather than angle brackets

### JSDoc Comments

- **Components**: Document with JSDoc comments including description, properties, and examples
- **Functions**: Document parameters, return values, and thrown exceptions
- **Properties**: Document with inline JSDoc comments in interface/type definitions
- **Formatting**:
    - JSDoc blocks start with `/**` on a separate line
    - Each line within the block starts with ` * ` (space, asterisk, space)
    - The closing `*/` is on a separate line
    - Parameter descriptions use `@param {type} name - Description` format
    - Return value descriptions use `@returns {type} Description` format
    - Examples are enclosed in code blocks with the appropriate language tag
    - Empty lines within JSDoc blocks have a ` *` (space, asterisk) without additional text
- **Type documentation**:
    - Type definitions have a brief description above the type declaration
    - Interface properties have inline JSDoc comments explaining their purpose
    - Enum values have explanatory comments when their meaning isn't obvious

### React Specifics

- **Functional components**: Use functional components with hooks, not class components
- **Hooks**: Follow React hooks naming convention (`useXxx`)
- **Event handlers**: Name with `handleXxx` pattern
- **Props**: Define using TypeScript interfaces or types with JSDoc comments
- **Default values**: Use parameter defaults, not `defaultProps`
- **JSX formatting**:
    - JSX attributes are aligned and indented when they span multiple lines
    - JSX closing tags are aligned with their opening tags
    - Self-closing tags have a space before the closing bracket: `<Component />`
    - JSX expressions in curly braces have consistent spacing: `{condition ? (...) : (...)}`
    - JSX conditional rendering uses parentheses for multi-line expressions
    - Component props are destructured with multi-line formatting and proper indentation when there are many props

### ESLint Configuration

The project uses ESLint with TypeScript support. The configuration enforces most of these conventions automatically.
Always run ESLint before committing code:

```bash
npm run lint
```

### Prettier Configuration

The project uses Prettier with a JSON configuration file (`.prettierrc.json`). The configuration enforces the formatting
conventions described in this document. See [PRETTIER.md](./PRETTIER.md) for detailed documentation of all Prettier
settings.

Run Prettier to automatically format code:

```bash
npm run format
```
