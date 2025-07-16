# Audio UI - React Component Library

A modern React component library for audio and MIDI applications, providing intuitive UI components for music software.

## Features

- 🎛️ **Audio-focused Components**: Knobs, sliders, buttons designed for audio interfaces
- 🎹 **Virtual Keyboard**: Interactive piano keyboard component
- 🎨 **Customizable Styling**: CSS custom properties for easy theming
- 📱 **Responsive Design**: Works seamlessly across different screen sizes
- 🔧 **TypeScript Support**: Full type safety and IntelliSense support
- ⚡ **Performance Optimized**: Tree-shakeable ES modules with minimal bundle size

## Available Components

The library provides the following audio-focused UI components:

- **Button** - Customizable button with audio interface styling
- **Knob** - Rotary knob control for parameter adjustment
- **KnobSwitch** - Multi-position rotary switch
- **Slider** - Linear slider control
- **Keyboard** - Virtual keyboard interface
- **Option** - Option selector for component configuration

## Quick Start

### Installation

```bash
# Install the library (when published)
npm install @cutoff/audio-ui-react

# Install required peer dependencies
npm install react@^18.2.0 react-dom@^18.2.0
```

### Basic Usage

```tsx
import React, { useState } from 'react';
import { Knob, Slider, Button } from '@cutoff/audio-ui-react';
import '@cutoff/audio-ui-react/style.css';

function AudioInterface() {
  const [volume, setVolume] = useState(50);
  const [cutoff, setCutoff] = useState(75);
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="audio-interface">
      <Knob
        value={volume}
        onChange={setVolume}
        label="Volume"
        min={0}
        max={100}
      />
      
      <Slider
        value={cutoff}
        onChange={setCutoff}
        label="Cutoff"
        min={0}
        max={100}
      />
      
      <Button
        value={enabled ? 100 : 0}
        onClick={() => setEnabled(!enabled)}
        label="Enable"
      />
    </div>
  );
}
```

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

## For Library Development

### Setting Up the Development Environment

```bash
# Clone the repository
git clone <repository-url>
cd audio-ui/react

# Install dependencies
npm install

# Build the library
npm run build

# Run the demo application
cd demo-app
npm run dev
```

## ⚠️ Important: React Version Policy

**This project maintains React 18 compatibility for maximum ecosystem support.**

### Version Requirements

- **Library**: React 18 peer dependencies (`react: ^18.2.0`, `react-dom: ^18.2.0`)
- **Demo App**: React 18 direct dependencies (`react: ^18.3.1`, `react-dom: ^18.3.1`)
- **TypeScript Types**: `@types/react: ^18.3.23`, `@types/react-dom: ^18.3.7`

### Why React 18?

- Ensures compatibility with the widest range of React applications
- Avoids breaking changes introduced in React 19
- Maintains stability for production applications
- Supports both legacy and modern React features

> **Note**: Do not upgrade to React 19 without explicit project approval and thorough testing.

## Development Workflow

### 1. Version Compatibility Check

Before making changes, verify React versions:

```bash
# Check installed React versions
npm ls react @types/react

# Should show React 18.x versions consistently
```

### 2. Development Process

```bash
# Make changes to library components
cd react/library
npm run build

# Test changes in demo app
cd ../demo-app
npm run dev
```

### 3. Type Checking

Always run TypeScript checks before committing:

```bash
# Check library types
cd react/library
npm run typecheck

# Check demo app types
cd ../demo-app
npx tsc --noEmit
```

### 4. Testing

```bash
# Run tests (when configured)
cd react/library
npm test
```

## Troubleshooting

### React Version Conflicts

If you encounter TypeScript errors related to React types:

1. **Check versions**: `npm ls react @types/react`
2. **Fix conflicts**: Install correct React 18 versions
3. **Verify**: Run `npm run typecheck` in both library and demo app

### Common Issues

- **"ReactNode" type conflicts**: Usually indicates React 19 types mixed with React 18
- **Build failures**: Ensure all dependencies are React 18 compatible
- **Component not rendering**: Check that props are properly typed and passed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Ensure React 18 compatibility
4. Run type checks and tests
5. Submit a pull request

## Architecture

### Library Structure

- **Components**: Individual UI components in `src/components/`
- **Exports**: All components exported from `src/index.ts`
- **Styling**: CSS and theme files in `src/styles.css` and `src/themes.css`
- **Types**: TypeScript definitions alongside components

### Demo App Structure

- **Pages**: Component demos in `app/components/[component]/page.tsx`
- **Shared UI**: Reusable demo components in `components/ui/`
- **Styling**: Tailwind CSS for demo app specific styling

## Performance

- **Tree-shaking**: Library built as ES modules
- **Minimal CSS**: Lightweight styling with CSS custom properties
- **SVG Graphics**: Scalable vector graphics for crisp rendering
- **TypeScript**: Full type safety with zero runtime overhead
