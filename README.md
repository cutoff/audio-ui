# Audio UI - React Component Library

A modern React component library for audio and MIDI applications, providing intuitive UI components for music software.

## Features

- 🎛️ **Audio-focused Components**: Knobs, sliders, buttons designed for audio interfaces
- 🎹 **Virtual Keybed**: Interactive piano keyboard component
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
- **Keybed** - Virtual keyboard interface
- **Option** - Option selector for component configuration

## Quick Start

### Installation

```bash
# Install the library (when published)
pnpm add @cutoff/audio-ui-react

# Install required peer dependencies
pnpm add react@^18.2.0 react-dom@^18.2.0
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
    - `playground-app/` - Next.js application for demonstrating the components

## Build/Configuration Instructions

### Setting Up the Project

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Build the library:
   ```bash
   pnpm build
   ```

3. Run the playground application:
   ```bash
   cd react/playground-app
   pnpm dev
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

## For Library Development

### Setting Up the Development Environment

```bash
# Clone the repository
git clone <repository-url>
cd audio-ui/react

# Install dependencies
pnpm install

# Build the library
pnpm build

# Run the playground application
cd playground-app
pnpm dev
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
pnpm ls react @types/react

# Should show React 18.x versions consistently
```

### 2. Development Process

```bash
# Make changes to library components
cd react/library
pnpm build

# Test changes in playground app
cd ../playground-app
pnpm dev
```

### 3. Type Checking

Always run TypeScript checks before committing:

```bash
# Check library types
cd react/library
pnpm typecheck

# Check playground app types
cd ../playground-app
pnpm exec tsc --noEmit
```

### 4. Testing

```bash
# Run tests (when configured)
cd react/library
pnpm test
```

## Troubleshooting

### React Version Conflicts

If you encounter TypeScript errors related to React types:

1. **Check versions**: `pnpm ls react @types/react`
2. **Fix conflicts**: Install correct React 18 versions
3. **Verify**: Run `pnpm typecheck` in both library and demo app

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

### Documentation Guidelines

- **Documentation Files**:
    - `AGENTS.md` is the primary documentation file for LLMs (AI assistants)
    - `CLAUDE.md` and `GEMINI.md` are symbolic links to `AGENTS.md`
    - Always edit `AGENTS.md` directly, never modify the symbolic link files
    - Changes to `AGENTS.md` are automatically reflected in the linked files

## Licensing

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)**. The full license text is available in the `LICENSE.md` file in the root of this repository.

### Commercial Licensing

A commercial license is available for proprietary use cases that are incompatible with the GPLv3. This license removes the copyleft restrictions and includes a Service Level Agreement (SLA) for professional support.

**Commercial licenses can be acquired at [https://audioui.dev](https://audioui.dev)**

For complete details on the dual-licensing model and commercial terms, please see the documents in the `license/` directory.

---

## Architecture

### Library Structure

- **Components**: Individual UI components in `src/components/`
- **Exports**: All components exported from `src/index.ts`
- **Styling**: CSS and theme files in `src/styles.css` and `src/themes.css`
- **Types**: TypeScript definitions alongside components

### Playground App Structure

- **Pages**: Component demos in `app/components/[component]/page.tsx`
- **Shared UI**: Reusable demo components in `components/ui/`
- **Styling**: Tailwind CSS for playground app specific styling

## Performance

- **Tree-shaking**: Library built as ES modules
- **Minimal CSS**: Lightweight styling with CSS custom properties
- **SVG Graphics**: Scalable vector graphics for crisp rendering
- **TypeScript**: Full type safety with zero runtime overhead
