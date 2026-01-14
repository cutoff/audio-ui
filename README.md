# AudioUI

AudioUI is a professional, open-source React component library for building high-performance user interfaces for audio and MIDI applications. It provides a meticulously crafted set of components designed to meet the demanding needs of music software, digital audio workstations (DAWs), audio plugins with a web UI, and other audio-centric web applications.

## Core Components

AudioUI provides a range of components essential for building audio applications:

### Built-in Controls
- **Knob:** A versatile rotary knob for parameter control.
- **Slider:** A linear slider for horizontal or vertical adjustments.
- **Button:** A customizable button with styles suited for audio interfaces.
- **CycleButton:** A discrete control for cycling through a set of options. Supports multiple visual variants (rotary knob-style, LED indicators, etc.).

### Device Components
- **Keys:** A responsive and interactive piano keyboard.

### Generic Components
- **FilmStrip Controls:** Bitmap sprite sheet-based controls (FilmStripContinuousControl, FilmStripDiscreteControl, FilmStripBooleanControl) for industry-standard control representation.
- **Image-Based Controls:** Image-based knobs and switches (ImageKnob, ImageRotarySwitch, ImageSwitch) for custom visual designs.

### Primitives
- **Control Primitives:** Low-level control components (ContinuousControl, DiscreteControl, BooleanControl) for building custom controls.
- **SVG Primitives:** SVG view primitives (ValueRing, RotaryImage, RadialImage, RadialText, TickRing, LabelRing) for composing custom radial controls.

## Features

- **Performance First:** Built for the high demands of audio applications, with a focus on minimal re-renders and low-latency interactions.
- **Deep Customization:** A flexible theming system built on CSS variables allows for complete control over the look and feel.
- **Fully Accessible:** All components are designed with accessibility in mind, supporting keyboard navigation and ARIA standards.
- **Mobile & Touch Ready:** Designed from the ground up to work flawlessly on touch devices.
- **TypeScript Native:** Written entirely in TypeScript for a superior developer experience.

## Packages

This monorepo contains the following packages:

| Package / Path                               | Description                                                                                                                                                                                                                                            |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@cutoff/audio-ui-react` (`packages/react`)  | The React component library implementation, published to npm. Provides React components, hooks, and React-specific adapters that wrap the framework-agnostic core.                                                                                     |
| `@cutoff/audio-ui-core` (`packages/core`)    | Framework-agnostic core package. Contains all business logic, models, controllers, utilities, and styles that are independent of any UI framework. Can be used by any framework implementation (React, Solid, Vue, etc.) or in non-framework contexts. |
| `playground-react` (`apps/playground-react`) | A [Next.js](https://nextjs.org/) app for developing and testing components.                                                                                                                                                                            |

**Architecture Note**: The library is designed with a clear separation between framework-agnostic core logic (`packages/core/`) and framework-specific implementations (`packages/react/`). This architecture allows for future implementations in other frameworks (e.g., `packages/solid/` for SolidJS) that would share the same core logic.

## Getting Started

### Using the Component Library

To use AudioUI components in your project, install the `@cutoff/audio-ui-react` package from npm:

```bash
pnpm add @cutoff/audio-ui-react
```

You will also need to install its peer dependencies:

```bash
pnpm add react@^18.2.0 react-dom@^18.2.0
```

Here is a basic example of how to use a component:

```tsx
import React, { useState } from "react";
import { Knob } from "@cutoff/audio-ui-react";
import "@cutoff/audio-ui-react/style.css";

function MyAudioModule() {
  const [cutoff, setCutoff] = useState(75);

  return (
    <div>
      <Knob value={cutoff} onChange={setCutoff} label="Cutoff" min={0} max={100} />
    </div>
  );
}
```

### Developing Locally

To develop AudioUI locally, clone the repository and install the dependencies:

```bash
git clone git@github.com:cutoff/audio-ui.git
cd audio-ui
pnpm install
```

This monorepo uses `pnpm` workspaces. The primary packages are:

- `@cutoff/audio-ui-react`: The React component library.
- `@cutoff/audio-ui-core`: The framework-agnostic core logic.
- `playground-react`: The Next.js playground application.

To start the development server, run:

```bash
pnpm dev
```

This command will start the Next.js playground application, which is used to develop and visually test the components from the library. The playground is the recommended environment for most development tasks.

## Key Scripts

- `pnpm dev`: Starts the playground application for local development.
- `pnpm build`: Builds the `@cutoff/audio-ui-react` component library.
- `pnpm typecheck`: Runs TypeScript checks across the entire monorepo.
- `pnpm lint`: Lints the codebase.
- `pnpm test`: Runs the test suite for the component library.

## Licensing

AudioUI is a dual-licensed project.

- **Open Source (GPL-3.0):** You may use this library for free in open-source projects under the terms of the GNU General Public License v3.0.
- **Commercial License:** For use in proprietary, closed-source applications, you must purchase a commercial license. This license removes the copyleft restrictions of the GPL and includes professional support.

Commercial licenses are available at **[https://audioui.dev](https://audioui.dev)**.

For full details, please see the [LICENSE.md](license-telf/LICENSE.md) file and the documents within the [license-telf](license-telf/) directory.

## Contributing

We welcome contributions to AudioUI. If you would like to contribute, please fork the repository and submit a pull request. All contributors must sign our Contributor License Agreement (CLA), which can be found in the `license-telf/` directory.
