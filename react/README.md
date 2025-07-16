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
