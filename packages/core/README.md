# @cutoff/audio-ui-core

Framework-agnostic core of AudioUI — parameter models, interaction logic, shared styles, and utilities for building audio/MIDI interfaces. This package is the foundation of [`@cutoff/audio-ui-react`](https://www.npmjs.com/package/@cutoff/audio-ui-react) and is intended for future framework bindings (Solid, Vue, etc.) or advanced direct use in non-framework contexts.

**Most users should install `@cutoff/audio-ui-react` instead** — this package is for framework implementers and advanced integrations.

[Documentation](https://cutoff.dev/audio-ui/docs) ·
[GitHub](https://github.com/cutoff/audio-ui)

## Install

```bash
npm install @cutoff/audio-ui-core
```

## What's here

- Parameter models: `ContinuousParameter`, `DiscreteParameter`, `BooleanParameter`
- Interaction controllers (drag, wheel, keyboard)
- Shared styles (`./styles.css`, `./themes.css`)
- Unit conversion utilities (real value ↔ normalized ↔ MIDI)

See the [main documentation](https://cutoff.dev/audio-ui/docs) for usage.

## License

Dual-licensed under the Tylium Evolutive License Framework (TELF): GPL-3.0 or Commercial. See [LICENSE.md](https://github.com/cutoff/audio-ui/blob/main/LICENSE.md).
