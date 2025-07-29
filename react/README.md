# React Implementation - Development Guide

This directory contains the React implementation of the Audio UI component library.

> **For general usage, installation, and component documentation, see the [main README](../README.md) at the project
root.**

## Development Setup

### Prerequisites

- Node.js (version 18 or higher)
- npm (comes with Node.js)

### Quick Start

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Start the demo application
cd demo-app
npm run dev
```

## Project Structure

```
react/
├── library/           # Component library source
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── index.ts      # Main exports
│   │   ├── styles.css    # Component styles
│   │   └── themes.css    # Theme definitions
│   ├── dist/             # Built output
│   └── package.json
└── demo-app/          # Next.js demo application
    ├── app/
    │   └── components/   # Demo pages
    ├── components/       # Demo UI components
    └── package.json
```

## Development Workflow

### 1. Library Development

```bash
# Navigate to library directory
cd react/library

# Install dependencies
npm install

# Build the library
npm run build

# Type check
npm run typecheck

# Link for local development
npm link
```

### 2. Demo App Development

```bash
# Navigate to demo app directory
cd react/demo-app

# Install dependencies
npm install

# Link the local library
npm link @cutoff/audio-ui-react

# Start development server
npm run dev
```

### 3. Version Compatibility

**Critical**: This project maintains React 18 compatibility. Before making changes:

```bash
# Check React versions
npm ls react @types/react

# Should show React 18.x versions consistently
```

If you encounter version conflicts:

1. Install React 18 versions: `npm install react@^18.3.1 react-dom@^18.3.1 @types/react@^18.3.23`
2. Run type checks: `npm run typecheck`
3. Rebuild: `npm run build`

## Building and Testing

### Library Build

```bash
cd react/library
npm run build          # Build for production
npm run typecheck      # Type checking only
```

### Demo App Build

```bash
cd react/demo-app
npm run build          # Build Next.js app
npm run start          # Start production server
```

## Component Development

### Adding New Components

1. Create component file in `library/src/components/`
2. Export from `library/src/index.ts`
3. Add demo page in `demo-app/app/components/[component-name]/page.tsx`
4. Update library build and test

### Component Guidelines

- Use TypeScript with strict mode
- Define props interfaces with JSDoc comments
- Use functional components with hooks
- Prefix unused parameters with underscore
- Follow existing patterns for styling and theming

## Common Development Tasks

### Testing Changes

```bash
# In library directory
npm run build && npm run typecheck

# In demo app directory
npm run dev  # Test visually in browser
```

### Troubleshooting

**React type errors**: Usually indicates version mismatch

```bash
npm ls react @types/react
# Fix by installing consistent React 18 versions
```

**Build failures**: Check TypeScript errors

```bash
npm run typecheck  # Shows detailed error information
```

**Demo app not updating**: Rebuild library first

```bash
cd react/library && npm run build
cd ../demo-app && npm run dev
```

## Contributing

1. Ensure React 18 compatibility
2. Run type checks before committing
3. Test changes in demo app
4. Update documentation as needed

For detailed component API and usage examples, see the [main README](../README.md).
