# AudioUI by Cutoff

<a href="https://playground.cutoff.dev" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/Playground-Try%20It%20Live-blue?style=for-the-badge" alt="Playground" /></a>
<a href="https://discord.gg/7RB6t2xqYW" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/Discord-Join%20Community-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord" /></a>

AudioUI is a professional, open-source React component library for building high-performance user interfaces for audio and MIDI applications. It provides a meticulously crafted set of components designed to meet the demanding needs of music software, digital audio workstations (DAWs), audio plugins with a web UI, and other audio-centric web applications.

## Design Philosophy

AudioUI is built on a few core principles designed to address the unique challenges of building audio software:

- **Performance First**: Audio applications have strict performance requirements. Components are optimized for minimal re-renders and low-latency interactions to ensure the UI never stutters, even under heavy load.
- **Hybrid Architecture**: We provide both **opinionated components** for rapid development and **non-opinionated primitives** for deep customization.
  - _Opinionated Components_ (Knob, Slider, Button, CycleButton, Keys): Ready-to-use components with carefully designed APIs, multiple visual variants and sensible defaults, based on a thorough analysis of existing audio plugins and apps.
  - _Non-Opinionated Components_ (Generic controls, primitives): Full customization through generic control components, SVG primitives, and base building blocks. Ideal for creating unique visual designs that match your brand or existing plugin aesthetics.
- **Universal Access**: Designed from the ground up to be fully accessible (ARIA support, keyboard navigation) and mobile-ready (responsive, touch-optimized).
- **Developer Experience**: Written entirely in TypeScript for type safety and provides a flexible theming system based on CSS variables.

## Project Status

**Developer Preview** — AudioUI is currently in active development. The core components and APIs are functional and ready for use, but the library is still evolving. During this phase:

- ✅ Core components APIs (Knob, Slider, Button, CycleButton, Keys) are stable and production-ready (more visual variants are being added to cover 90% of real-life apps and plugin visuals)
- ✅ Comprehensive audio parameters model with support for Continuous, Discrete and Boolean controls
- ✅ Generic film strips and bitmap images components for each type of audio parameter
- ✅ Comprehensive interaction system for each type of parameter (drag, wheel, keyboard)
- ✅ Layout system (Adaptive Box with CSS-based sizing system or adaptive size)
- ✅ Theming and customization system with SVG primitives and base components
- ✅ Built-in support for dark and light mode
- ✅ Ready for mobile devices (responsive, touch ready)
- 🔄 Additional visual variants, components and primitives are being added
- 🔄 Size system is being improved
- 🔄 Documentation is being expanded

**Note:** As a Developer Preview release, breaking changes may occur as we refine the API and architecture. We recommend pinning to specific versions for production use.

**We're eager for community feedback before the first stable release!** Your input on APIs, features, and use cases is invaluable in shaping AudioUI. Join our [Discord server](https://discord.gg/7RB6t2xqYW) to share your thoughts, report issues, or request features.

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

## Packages

This monorepo contains the following packages:

| Package / Path                               | Description                                                                                                                                                                                                                                            |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@cutoff/audio-ui-react` (`packages/react`)  | The React component library implementation, published to npm. Provides React components, hooks, and React-specific adapters that wrap the framework-agnostic core.                                                                                     |
| `@cutoff/audio-ui-core` (`packages/core`)    | Framework-agnostic core package. Contains all business logic, models, controllers, utilities, and styles that are independent of any UI framework. Can be used by any framework implementation (React, Solid, Vue, etc.) or in non-framework contexts. |
| `playground-react` (`apps/playground-react`) | A [Next.js](https://nextjs.org/) app for developing and testing components.                                                                                                                                                                            |

**Architecture Note**: The library is designed with a clear separation between framework-agnostic core logic (`packages/core/`) and framework-specific implementations (`packages/react/`). The framework-agnostic architecture enables potential implementations for other frameworks that would share the same core logic.

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

AudioUI by Cutoff is a dual-licensed project.

- **Open Source (GPL-3.0):** You may use this library for free in open-source projects under the terms of the GNU General Public License v3.0.
- **Commercial License:** For use in proprietary, closed-source applications, you must purchase a commercial license. This license removes the copyleft restrictions of the GPL and includes professional support.

Commercial licenses are available at **[cutoff.dev](https://cutoff.dev)**.

For full details, please see the [LICENSE.md](license-telf/LICENSE.md) file and the documents within the [license-telf](license-telf/) directory.

## Contributing

We welcome contributions to AudioUI. If you would like to contribute, please fork the repository and submit a pull request. All contributors must sign our Contributor License Agreement (CLA), which can be found in the `license-telf/` directory.

## Community

Join our [Discord server](https://discord.gg/7RB6t2xqYW) for:

- **Support**: Get help with using AudioUI in your projects
- **Wish List**: Share feature requests and vote on upcoming additions
- **General Discussions**: Connect with other developers building audio applications
- **Announcements**: Stay updated on new releases and important updates
