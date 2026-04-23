<!--
 Copyright (c) 2026 Tylium.
 SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 See LICENSE.md for details.
-->

# Integration Design

This document analyses how AudioUI's control component API interacts with the ecosystem of technologies it is likely to be paired with, and uses that lens to inform the API design discussion in `control-value-api-design.md`.

## Principle: Agnostic Core, Layered Glue

AudioUI's core is framework-agnostic (`@cutoff/audio-ui-core`) and has no third-party integration code. The React package is the UI layer. Beyond those, integrations with specific technologies (WebMidi, WebAudio, Tone.js, JUCE WebUI, Cutoff Fusion, etc.) belong in **separate modules or companion packages** — not inside the library itself.

This document treats those integrations as **consumers** of the library's API and asks: does the API shape create friction, or does it let each glue layer stay small and obvious?

## Integration Targets at a Glance

| Integration                        | Primary representation                                                  | Secondary                       | Multi-resolution             | Parameter identity                                  | Transport            |
| ---------------------------------- | ----------------------------------------------------------------------- | ------------------------------- | ---------------------------- | --------------------------------------------------- | -------------------- |
| **WebMidi API**                    | MIDI integer (u7, occasionally u14)                                     | —                               | u7 default, u14 via RPN/NRPN | None (raw CC/note semantics)                        | Browser API          |
| **Web Audio API**                  | Real value (Hz, linear gain, etc.)                                      | —                               | N/A (`float` everywhere)     | `AudioParam` has min/max/default but not scale/unit | In-process JS        |
| **Tone.js**                        | Real value, unit-typed (`Frequency`, `Decibels`, `NormalRange`, `Time`) | Normalized 0..1 (`NormalRange`) | N/A                          | `Tone.Param` with `units` hint                      | In-process JS        |
| **JUCE WebUI**                     | Normalized 0..1                                                         | Formatted text                  | N/A                          | Backend parameter tree via JS bridge                | JS↔C++ bridge        |
| **Cutoff Fusion** (`midim::Value`) | MIDI integer, resolution-tagged (U7/U8/U14/U16) with `ScaleMode`        | —                               | First-class                  | External (device profiles)                          | Tauri/serde over IPC |

No single representation is native to all five. Any integration-friendly design must make MIDI, normalized, and real each first-class on both input and output sides, or it pushes ceremony into every glue layer.

## Per-Integration Analysis

### WebMidi API

The browser's Web MIDI API exposes `MIDIMessageEvent` with `data: Uint8Array`. For Control Change, `data[1]` is the CC number and `data[2]` is the u7 value (0–127). High-resolution (14-bit) values require pairing CC/CC+32 messages or using RPN/NRPN, reconstructed manually into a u14 integer.

**Outbound** (UI → MIDI): the app sends `MIDIOutput.send([status, cc, value])` where `value` is a u7. To emit u14, the app sends two messages (MSB then LSB).

**Inbound** (MIDI → UI): the app receives CC events, tracks "last value" per CC, binds the UI control to that tracked value.

**Friction per Combo**:

- **A (`value: T` real, `onChange(event)`):** high. Every bind requires converting MIDI↔real, requiring parameter min/max/scale definitions on the JS side. Apps that only care about MIDI wire values are forced through a real-value detour.
- **B (V2 multi-input, O1 single event):** low. `midiValue={lastCcValue}` binds natively; `onChange={(e) => sendCc(e.midiValue)}` closes the loop. Parameter definitions still needed for scale computation inside the control, but the app code is MIDI-native.
- **C (paired channels):** lowest. `<Knob midiValue={cc} onMidiValueChange={setCc} />` is one line. The library still needs a parameter to compute normalized-for-display and real-for-labelling, but the app state and wire protocol stay in MIDI.
- **D (AudioControlValue):** moderate. `<Knob value={AudioControlValue.fromMidi(cc, param)} onChange={setV} />` forces constructing `AudioControlValue` at every render. Good if the app's state is already `AudioControlValue`; extra ceremony if the app stores raw u7 integers from the MIDI wire.

### Web Audio API

Web Audio's `AudioParam` (for `GainNode.gain`, `BiquadFilterNode.frequency`, `DelayNode.delayTime`, etc.) exposes `.value: number` in the real-value domain — Hz for frequency, linear gain for gain, seconds for delay. No normalized concept, no MIDI concept.

**Outbound**: app sets `audioParam.value = realValue`, or schedules ramps via `setValueAtTime` / `linearRampToValueAtTime`.

**Inbound**: not relevant in most cases — Web Audio is a write-heavy API, the UI is the source of truth.

**Friction per Combo**:

- **A:** native fit. `value={cutoffHz} onChange={(e) => { setCutoffHz(e.value); filterNode.frequency.value = e.value; }}`.
- **B:** equally native. `value={cutoffHz} onChange={(e) => ...}` unchanged; additional reps unused.
- **C:** `<Knob value={cutoffHz} onValueChange={setCutoffHz} />`; event fully redundant for pure-real apps.
- **D:** wraps primitive state, mostly redundant here. Works but adds wrapper ceremony that yields no benefit.

All four combos are workable for Web Audio alone. The real-value path is privileged in A/B/C/D equally.

### Tone.js

Tone.js layers unit-typed params over Web Audio. A `Tone.Gain` has `gain` typed `GainFactor` (linear 0..1); a `Tone.Filter` has `frequency` typed `Frequency` (Hz). A `Tone.Envelope` has `NormalRange`-typed fields. The library supplies utility converters (`Tone.gainToDb`, `Tone.dbToGain`, `Tone.ftom`, `Tone.mtof`, etc.) but stores params as real-domain floats internally.

**Flow**: identical to Web Audio, plus occasional normalized bindings for `NormalRange` params.

**Friction per Combo**:

- **A:** native for `GainFactor`, `Frequency`, `Decibels`, `Time`. For `NormalRange`, the value IS normalized-by-semantics, so binding `value={t.envelope.sustain}` works directly — it just happens to be 0..1 by contract, and the AudioUI parameter would be declared with `min: 0, max: 1`. No real conflict.
- **B, C:** same as A for real params. For `NormalRange`, `normalizedValue` binding could match more naturally ("this parameter IS a normalized signal"), but `value` works too. Minor cosmetic preference.
- **D:** wrapping overhead.

Tone.js doesn't strongly discriminate between combos. Real-value-native design is sufficient.

### JUCE WebUI

JUCE hosts a WebView (WebView2 on Windows, WKWebView on macOS/iOS) and communicates with C++ via a bidirectional JS bridge. The standard pattern is to expose parameter values to the WebView as **normalized 0..1** floats, because:

- JUCE's `AudioProcessorParameter::getValue()` is normalized by contract.
- Host automation, preset formats, and DAW integration are normalized-centric in JUCE.
- Denormalization to real-world units is a backend concern, handled in C++.

**Outbound** (UI → C++): the UI sends normalized values back via JS bridge; backend denormalizes and applies.

**Inbound** (C++ → UI): the backend pushes normalized values on parameter changes (host automation, MIDI learn, preset load).

**Friction per Combo**:

- **A:** friction. The JS frontend must either denormalize itself (duplicating parameter metadata JS-side) or the C++ side must send both normalized and real values.
- **B, C:** low. `normalizedValue={juceNorm}` + `onNormalizedValueChange={(n) => juce.setParameter(id, n)}` (Combo C) or the event-style equivalent (Combo B). The app stays normalized-native throughout.
- **D:** requires wrapping each received normalized value into `AudioControlValue.fromNormalized(n, param)`. Parameter definitions must exist on the JS side to construct the value, which duplicates JUCE's backend parameter knowledge.

For JUCE WebUI specifically, normalized-first input (B or C) is the clear fit.

### Cutoff Fusion (`midim::Value`)

Fusion's `midim::Value` is a tagged enum `U7 | U8 | U14 | U16` carrying the integer plus a `ScaleMode` (`MinCenterMax`, `ZeroExtWithRounding`, `SteppedRange(n)`). It serde-serializes externally-tagged:

```json
{ "U7": [127, "MinCenterMax"] }
{ "U14": [8192, "MinCenterMax"] }
```

Rich conversions live on the Rust side (`u7()`, `u14()`, `as_normalized()`, `as_bipolar()`, `inverse()`, etc.). Practice in existing apps (`summit_player`): the DTO layer flattens `Value` to a plain `lastValue: number` over the Tauri wire; resolution is tracked separately via device profile metadata. The rich enum stays in Rust.

**Outbound** (UI → Rust): Tauri invoke with a MIDI integer + (separately) resolution info → Rust reconstructs `midim::Value::U7(n, MinCenterMax)` → emits MIDI.

**Inbound** (Rust → UI): Tauri event with a flat integer (or a tagged enum, depending on which DTO is used) → UI displays.

Two paths, depending on the DTO shape:

- **Flat integer DTO** (current `summit_player` pattern, `lastValue: number`): perfectly fits AudioUI's flat `midiValue: number`. No impedance mismatch. Combos B/C both work natively.
- **Tagged enum DTO** (future-proof for preserving resolution information in transit): requires glue code to unwrap `{ U7: [127, "..."] }` on receive and rewrap on emit. AudioUI stays representation-agnostic; glue lives in a companion package.

**Friction per Combo**:

- **A:** high for both DTO paths. Forces a real-value detour through parameter definitions.
- **B:** low. `midiValue={extractInt(midimValue)}` + `onChange={(e) => sendMidim({ U7: [e.midiValue, "MinCenterMax"] })}`.
- **C:** lowest. `<Knob midiValue={extractInt(v)} onMidiValueChange={(n) => send(wrap(n))} />`.
- **D:** moderate-to-high. `AudioControlValue.fromMidi` requires a JS-side `AudioParameter` instance; the parameter metadata originates from Rust device profiles, so the glue must translate device-profile data into AudioUI parameter definitions before wrapping. Feasible but non-trivial, and every change in the Fusion parameter model ripples into the glue.

Additional note: **the `ScaleMode` concept is richer than AudioUI's `bipolar` boolean.** `MinCenterMax` and `ZeroExtWithRounding` both produce different upscaling math. If Fusion apps want to preserve that distinction at the UI, AudioUI's current model cannot express it. This is an agnostic-library gap that would be addressed either by extending AudioUI's parameter model (complicates the core) or by the glue layer resolving to a flat representation before handing off (acceptable for most use cases — UI visual fidelity does not need wire-level scaling modes).

## Synthesis — Cross-Integration Fit

Combining the per-integration analyses:

| Combo                     | WebMidi         | WebAudio | Tone.js  | JUCE WebUI      | Cutoff Fusion   | Cross-integration fit                                                                                                                                               |
| ------------------------- | --------------- | -------- | -------- | --------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A** (present)           | High friction   | Native   | Native   | High friction   | High friction   | **Poor** — native only for real-value audio APIs                                                                                                                    |
| **B** (V2 + O1)           | Low friction    | Native   | Native   | Low friction    | Low friction    | **Good** — covers all, asymmetric I/O shape                                                                                                                         |
| **C** (paired)            | Lowest friction | Native   | Native   | Lowest friction | Lowest friction | **Best** — lowest friction across all, symmetric I/O                                                                                                                |
| **D** (AudioControlValue) | Moderate        | Moderate | Moderate | Moderate        | Moderate-high   | **Mediocre** — wrapping tax in every integration; parameter-bundling assumption clashes with integrations that don't carry parameter identity (WebMidi, JUCE WebUI) |

Key observations:

1. **Every integration except Web Audio / Tone.js has a non-real native representation.** A library that only accepts real values pushes conversion into every glue layer, contradicting the "small, obvious glue" goal.

2. **Integrations do not generally carry AudioUI's `AudioParameter` concept.** WebMidi has raw CC bytes; JUCE has a backend parameter tree not mirrored in JS; Fusion has device profiles in Rust. Combo D's "value bundles parameter" assumption requires glue layers to _construct_ `AudioParameter` instances client-side for integrations that don't provide them. This inverts the intended direction of dependency: glue should unwrap integration data into library primitives, not synthesize library concepts from scratch.

3. **The paired-channel design (Combo C) lets each glue layer express its representation directly.** A WebMidi glue layer emits `midiValue`/`onMidiValueChange` pairs; a JUCE glue layer emits `normalizedValue`/`onNormalizedValueChange` pairs; a WebAudio glue layer emits `value`/`onValueChange` pairs. None of them needs to know about the other two representations.

4. **For the existing primitive-state pattern (WebAudio/Tone.js, the least demanding case), Combo C's simple path (`value` + `onValueChange`) is identical in weight to Combo A.** No ceremony cost paid for the capability gained elsewhere.

5. **Combo B is a viable second choice** if the library prefers a single `onChange` event prop for output. It retains the multi-input advantage and closes most of the integration-friction gap, at the cost of asymmetric I/O surface.

## Recommendation — Combo C (Paired Channels)

Across the five integration targets, **Combo C (V2 multi-input + O3 paired callbacks)** is the only shape that makes every integration glue layer small and linear.

```ts
// Input side — pick one
{ value: T; onValueChange?: (value: T, event: AudioControlEvent<T>) => void }
{ normalizedValue: number; onNormalizedValueChange?: (value: number, event: AudioControlEvent<T>) => void }
{ midiValue: number; onMidiValueChange?: (value: number, event: AudioControlEvent<T>) => void }
```

Integrations write one line of JSX per control and one line of callback plumbing. No integration pays a tax for the capabilities the others need. No integration is required to synthesise AudioUI concepts it does not natively carry.

**Combo D is best reserved for a companion package** (e.g., `@cutoff/audio-ui-react-fusion` or a hypothetical `@cutoff/audio-ui-react-state`) that targets apps already modelling parameter values as first-class domain objects. Such a package could expose `AudioControlValue` helpers and a `useAudioControlValue` React hook, layered _on top of_ Combo C primitives, without requiring the core library to adopt the wrapped-value pattern.

## Companion Package Sketches

Given Combo C as the library shape, the integration modules would look approximately like:

### `@cutoff/audio-ui-react-webmidi` (hypothetical)

Exposes a `useWebMidiCC(cc: number, channel: number)` hook returning `{ midiValue, onMidiValueChange }`. The hook owns the connection to the Web MIDI API, debounces outbound messages, and exposes the last received value.

```tsx
const volumeBinding = useWebMidiCC(7, 1);

<Knob {...volumeBinding} parameter={volumeParam} />;
```

### `@cutoff/audio-ui-react-juce` (hypothetical)

Exposes a `useJuceParameter(id: string)` hook returning `{ normalizedValue, onNormalizedValueChange }`. The hook subscribes to the JUCE JS bridge's parameter events and posts changes back.

```tsx
const cutoffBinding = useJuceParameter("cutoff");

<Knob {...cutoffBinding} parameter={cutoffParam} />;
```

### `@cutoff/audio-ui-react-fusion` (hypothetical)

Exposes a `useCutoffController(controllerId: string)` hook returning `{ midiValue, onMidiValueChange }`. The hook subscribes to Tauri events carrying `midim::Value` payloads, extracts the integer (regardless of resolution variant), and wraps the outbound integer back into the appropriate `midim::Value` variant based on parameter metadata from the device profile.

```tsx
const cutoffBinding = useCutoffController("Cc(14,46)");

<Knob {...cutoffBinding} parameter={cutoffParam} />;
```

### Cross-integration `AudioControlValue` package (hypothetical)

A separate package for apps that benefit from bundled-value semantics:

```tsx
const [v, setV] = useState(AudioControlValue.fromValue(440, cutoffParam));

<AudioControl {...v} onChange={setV} />;
```

Where `AudioControl` is a wrapper around Combo C controls that destructures the `AudioControlValue` into the matching paired props.

## Notes for the Core Library

- The library retains its representation-agnostic stance: `AudioParameterConverter` handles all three-way conversion internally; consumers never import a resolution-specific utility from the library.
- `ScaleMode`-style nuance (MinCenterMax vs. ZeroExtWithRounding vs. SteppedRange) lives in the integration glue, not in `AudioParameter`. The current `bipolar: boolean` and `scale: ScaleType` fields cover the UI-level cases adequately; richer MIDI 2.0 scaling semantics belong outside the UI library.
- No import or type reference to WebMidi, WebAudio, Tone.js, JUCE, or Fusion appears in `@cutoff/audio-ui-core` or `@cutoff/audio-ui-react`. All such references live in companion packages.

## Open Questions for Integration Packages

1. **Where do companion packages live?** Sub-packages of this monorepo, separate repositories, or individual packages in a future `@cutoff/audio-ui-integrations-*` namespace?
2. **Do device-profile-driven integrations (Fusion) ship parameter definitions?** Or does the consumer import parameter definitions from a profile registry separately? (Suggestion: the latter — parameters are consumer-owned data, profile registries are a distinct concern.)
3. **Should any glue package take a dependency on `AudioControlValue`?** If `AudioControlValue` is published as part of core, integration packages can choose to expose it. If not, the Combo C primitives are sufficient.
4. **Does the library want a blessed `useAudioParameter`-level hook per representation** (e.g., `useMidiValueBinding(param)` returning `{ midiValue, onMidiValueChange }`) to reduce boilerplate in consumer apps that handle their own transport? This is a convenience-layer question once the core shape is settled.
