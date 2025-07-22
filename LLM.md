# Audio UI Development Guide for LLMs

This document provides essential information for LLMs working on the Audio UI project, a React component library for audio and MIDI applications.

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

### IMPORTANT: Runtime Testing Limitations

**Note: Running the app, test HTML pages, or unit tests may fail and require manual cancellation.**

Due to known issues, avoid running the following commands:
- `npm run dev` (demo application)
- `npm test` (unit tests)
- Any commands that start a development server or run tests

Instead, rely on:
- Static code analysis
- TypeScript type checking (`npm run typecheck`)
- Linting (ESLint)
- Code review

### Setting Up the Project

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the library (for type checking only, not for running):
   ```bash
   npm run build
   ```

3. ~~Run the demo application~~ Use static analysis instead:
   ```bash
   # Instead of running the app with:
   # cd react/demo-app
   # npm run dev
   
   # Use type checking:
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

### Testing Setup

The project uses Jest and React Testing Library for testing React components.

1. Configure Jest:
   - Create a `jest.config.cjs` file in the library directory:
     ```js
     module.exports = {
       preset: 'ts-jest',
       testEnvironment: 'jsdom',
       moduleNameMapper: {
         '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
       },
       setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
       testMatch: ['**/__tests__/**/*.test.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
       transform: {
         '^.+\\.(ts|tsx)$': ['ts-jest', {
           tsconfig: 'tsconfig.json',
         }],
       },
     };
     ```

2. Create a Jest setup file:
   - Create a `jest.setup.js` file in the library directory:
     ```js
     // Import any global setup for Jest tests here
     require('@testing-library/jest-dom');
     ```

3. Add testing dependencies:
   ```bash
   cd react/library
   npm install --save-dev @testing-library/jest-dom @testing-library/react @types/jest identity-obj-proxy jest jest-environment-jsdom ts-jest
   ```

4. Add a test script to package.json:
   ```json
   {
     "scripts": {
       "test": "jest --config jest.config.cjs"
     }
   }
   ```

### Running Tests

**IMPORTANT: As noted above, running tests may fail and require manual cancellation.**

Instead of running tests with:
```bash
# DON'T RUN THIS - it may fail and require manual cancellation
# cd react/library
# npm test
```

Rely on static analysis:
```bash
cd react/library
npm run typecheck
# Use ESLint for code quality checks
npm run lint
```

### Writing Tests

Tests should be placed alongside the components they test with a `.test.tsx` extension. Here's an example test for the Button component:

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

**IMPORTANT: As noted above, running the demo application may fail and require manual cancellation.**

Instead of running the demo application with:
```bash
# DON'T RUN THIS - it may fail and require manual cancellation
# cd react/demo-app
# npm run dev
```

Rely on static analysis:
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
3. **Fix version conflicts**: Use `npm install react@^18.3.1 react-dom@^18.3.1 @types/react@^18.3.23 @types/react-dom@^18.3.7`
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

- Use Jest and React Testing Library
- Test files: `*.test.tsx` alongside components
- Mock external dependencies appropriately
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

### Performance Considerations

- Library is built as ES modules for tree-shaking
- Components use SVG for scalable graphics
- CSS is minimal and uses CSS custom properties for theming
- Demo app uses Next.js optimization features
