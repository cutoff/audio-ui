# Audio UI Development Guide

This document provides essential information for developers working on the Audio UI project, a React component library for audio and MIDI applications.

## Project Structure

The project is organized as a monorepo with the following structure:

- `react/` - Contains the React implementation
  - `library/` - The component library
    - `src/` - Source code for the components
    - `dist/` - Built output (generated)
  - `demo-app/` - Next.js application for demonstrating the components

## Build/Configuration Instructions

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
   "scripts": {
     "test": "jest --config jest.config.cjs"
   }
   ```

### Running Tests

Run tests with:
```bash
cd react/library
npm test
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

Run the demo application with:
```bash
cd react/demo-app
npm run dev
```
