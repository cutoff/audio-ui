<!--
 Copyright (c) 2026 Tylium.
 SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 See LICENSE.md for details.
-->

# Control Value API Design

This is a working design document. It captures the design space around how a control's value flows in and out of a component, and the trade-offs between options. It is not a settled specification; it exists to support decision-making.

## Context

Every interactive control (`Knob`, `Slider`, `Button`, `CycleButton`, `Keys`) exposes two primary data-binding surfaces:

- An **input**: the `value` prop carrying the control's current value.
- An **output**: the `onChange` callback fired when the value changes.

The present API shape for these two surfaces, for continuous controls, is:

```tsx
<Knob value={cutoffHz} onChange={(e) => setCutoffHz(e.value)} parameter={cutoffParam} />
```

- `value: T` — a primitive in the real-world domain (Hz, dB, boolean, etc.).
- `onChange: (event: AudioControlEvent<T>) => void` — a callback receiving a bag of three representations: real value, normalized 0..1, MIDI integer, and the parameter reference.

An audio parameter exists in three simultaneous domain representations that the library computes via `AudioParameterConverter`:

1. **Real value** (`T`): the user-facing primitive (Hz, dB, semitones, option value, boolean state).
2. **Normalized value** (`number` in `[0, 1]`): position within the parameter's domain, useful for UI rendering, automation, cross-parameter mapping.
3. **MIDI value** (`number`): integer representation (0–127 for 7-bit, 0–16383 for 14-bit), useful for hardware integration and protocol encoding.

The output `AudioControlEvent<T>` already exposes all three. The input side exposes only the first one.

## Triggering Observations

Two observations sparked this design discussion:

1. **A silent-bug class on `onChange`.** The common misuse `onChange={setX}` (instead of `onChange={(e) => setX(e.value)}`) writes the full event object into `setX`, corrupting state. TypeScript catches this statically; in JS or loose-TS environments, it is silent. A dev-mode warning hook (`useDevValueTypeWarning`) catches it at runtime but is a patch, not a fix of the design.

2. **Asymmetry between input and output.** The output gives three representations; the input accepts only one. A client who thinks in MIDI terms (e.g., binding directly to a MIDI controller) must convert to real value before passing it in, and convert back on the way out. This is extra ceremony that the library's own converter infrastructure could absorb.

Together these motivate a broader question: what is the best joint shape for `value` (input) and `onChange` (output)?

## Design Axes

Four axes inform every option below:

- **Correctness-by-construction.** Can the common bug class (wrong shape in, wrong shape out) be eliminated at the type/API level rather than surfaced by runtime warnings?
- **Shape symmetry.** Do the input and output surfaces mirror each other, producing a single mental model for the channel?
- **Explicitness.** Does the call site self-document which representation the consumer thinks in?
- **Ergonomics.** How much ceremony is required for the simplest case (controlled primitive state)? How much for the multi-representation case?

A good design wins on as many of these as possible.

## `onChange` Signature Options

### O1 — Keep `(event: AudioControlEvent<T>) => void`

```tsx
onChange?: (event: AudioControlEvent<T>) => void;

<Knob value={x} onChange={(e) => setX(e.value)} parameter={p} />
```

- **Correctness:** fails. `onChange={setX}` is a silent bug.
- **Symmetry:** input is a primitive, output is an object bag. Mismatched.
- **Explicitness:** high. The consumer names the field they extract.
- **Ergonomics:** no bare state-setter path; always requires an arrow wrapper.

### O2 — `(value: T, event: AudioControlEvent<T>) => void`

```tsx
onChange?: (value: T, event: AudioControlEvent<T>) => void;

<Knob value={x} onChange={setX} parameter={p} />
<Knob value={x} onChange={(v, e) => { setX(v); log(e.midiValue); }} parameter={p} />
```

- **Correctness:** eliminates the silent bug — `setX(value, event)` is just `setX(value)` thanks to JavaScript extra-arg discarding.
- **Symmetry:** better; the first-arg primitive matches the `value` input primitive.
- **Explicitness:** moderate. The first arg is the "default" representation, which privileges the real value over the others.
- **Ergonomics:** bare state-setter works; full event available as second arg.

### O3 — Paired callbacks per representation

```tsx
onValueChange?: (value: T, event: AudioControlEvent<T>) => void;
onNormalizedValueChange?: (normalizedValue: number, event: AudioControlEvent<T>) => void;
onMidiValueChange?: (midiValue: number, event: AudioControlEvent<T>) => void;

<Knob value={hz} onValueChange={setHz} parameter={p} />
<Knob normalizedValue={n} onNormalizedValueChange={setN} parameter={p} />
<Knob midiValue={cc} onMidiValueChange={setCC} parameter={p} />
```

- **Correctness:** eliminates the silent bug. Bare state-setter works for any representation.
- **Symmetry:** perfect when paired with V2 (three input props). Each channel is a bidirectional port over one representation.
- **Explicitness:** high. The chosen representation is named at the call site, in both directions.
- **Ergonomics:** simple path is simple (one value prop + one callback). Full event still available as second arg to every callback.
- **Cost:** larger prop surface (three callbacks instead of one); naming is longer.

## Value Input Options

### V1 — Single `value: T` (present)

```tsx
<Knob value={cutoffHz} parameter={cutoffParam} />
```

- The client must pre-convert any other representation into the real domain before passing it in.
- The simplest surface, but the least symmetric with the event output.

### V2 — Three mutually-exclusive props

```tsx
<Knob value={hz} parameter={p} />
<Knob normalizedValue={n} parameter={p} />
<Knob midiValue={cc} parameter={p} />
```

Types via discriminated union:

```ts
type ValueInput<T> =
  | { value: T; normalizedValue?: never; midiValue?: never }
  | { value?: never; normalizedValue: number; midiValue?: never }
  | { value?: never; normalizedValue?: never; midiValue: number };
```

- TypeScript enforces "pick exactly one".
- Self-documenting at the call site.
- Additive for existing consumers — `value={x}` still works unchanged.

### V3 — Tagged-object value prop

```tsx
<Knob value={42} parameter={p} />
<Knob value={{ normalized: 0.5 }} parameter={p} />
<Knob value={{ midi: 64 }} parameter={p} />
```

- Object-literal form is visually awkward.
- Helper-based form (`value={normalized(0.5)}`) requires imports for common use.
- Polymorphic `T | { normalized } | { midi }` types are ugly to consume and propagate.

### V4 — `value + valueScale` discriminator

```tsx
<Knob value={hz} parameter={p} />                          // scale defaults to "real"
<Knob value={0.5} valueScale="normalized" parameter={p} />
<Knob value={64} valueScale="midi" parameter={p} />
```

- Compact, but loses static safety — for continuous parameters, `value` is `number` regardless of scale, so TypeScript cannot distinguish a real 0.5 from a normalized 0.5.
- Accidental mismatch (`valueScale="midi"` with a real value) produces wrong visuals silently.

### V5 — `AudioControlValue` self-describing type

Discussed in depth below. A single prop carries all three representations plus the parameter reference.

## Combinations — Joint Shape of Input + Output

### Combo A — V1 + O1 (the present shape)

- Smallest API surface. Known silent-bug class. Input/output asymmetric.

### Combo B — V2 + O1

- Additive input expansion; output unchanged.
- Non-breaking, but input and output remain asymmetric in shape.

### Combo C — V2 + O3 (fully paired)

- Input and output mirror one-to-one.
- TypeScript discriminated union pairs `value`/`onValueChange`, `normalizedValue`/`onNormalizedValueChange`, `midiValue`/`onMidiValueChange`.
- Bare state-setter works on any representation: `onNormalizedValueChange={setNorm}`.
- Simple case is still simple: `<Knob value={x} onValueChange={setX} parameter={p} />`.
- Largest surface among the "primitive" combinations, but each call site reads as one pair.

### Combo D — V5 everywhere (AudioControlValue as both input and output)

A single type on both sides; see "AudioControlValue deep dive" below.

## `AudioControlValue` Deep Dive

### Motivation

The `AudioControlEvent<T>` type already models a complete snapshot of a parameter's state: `{ value, normalizedValue, midiValue, parameter }`. The observation: this shape is not only useful _outbound_ as an event; it could be the canonical _inbound_ representation too, eliminating the asymmetry entirely.

If the input prop accepts the same shape the output callback produces, then:

- `onChange={setV}` with `useState<AudioControlValue<T>>` round-trips trivially.
- The consumer picks a representation at construction time, not at prop-selection time.
- Controls don't need three separate input props.

### Conceptual Sketch

```ts
class AudioControlValue<T extends number | boolean | string = number> {
    readonly parameter: AudioParameter;

    // Exactly one of these is "authoritative" — the representation the consumer
    // passed in. The other two are derived on demand via the converter.
    private readonly _authoritative:
        | { kind: "value"; value: T }
        | { kind: "normalized"; normalized: number }
        | { kind: "midi"; midi: number };

    constructor(auth: /* ... */, parameter: AudioParameter);

    static fromValue<T>(value: T, parameter: AudioParameter): AudioControlValue<T>;
    static fromNormalized<T>(n: number, parameter: AudioParameter): AudioControlValue<T>;
    static fromMidi<T>(m: number, parameter: AudioParameter): AudioControlValue<T>;

    get value(): T;                // authoritative if kind === "value", else derived
    get normalizedValue(): number; // authoritative if kind === "normalized", else derived
    get midiValue(): number;       // authoritative if kind === "midi", else derived

    withValue(v: T): AudioControlValue<T>;
    withNormalized(n: number): AudioControlValue<T>;
    withMidi(m: number): AudioControlValue<T>;
}
```

The key insight: each instance **remembers which representation was authoritative at construction**. This avoids round-trip error on stepped / quantized parameters — reading back the representation you passed in gives exactly what you passed in, not a quantized approximation.

### Usage

```tsx
// Self-describing state
const [v, setV] = useState(AudioControlValue.fromValue(440, cutoffParam));

<Knob value={v} onChange={setV} />;

// MIDI-centric
const [v, setV] = useState(AudioControlValue.fromMidi(64, cutoffParam));

<Knob value={v} onChange={setV} />;

// Read any representation
console.log(v.value, v.normalizedValue, v.midiValue);
```

One prop, one callback. No choice at the API boundary; the choice was made at construction time and encoded in the value itself.

### Relationship to `AudioControlEvent<T>`

`AudioControlValue<T>` and `AudioControlEvent<T>` have the same conceptual fields. Under this design, they unify: `AudioControlEvent<T>` can be renamed / re-aliased to `AudioControlValue<T>` (or the inverse). A single type models both the input state and the output notification.

### Challenges (and resolution strategies)

#### Challenge 1 — Conversion and parameter definition live in `@cutoff/audio-ui-core`

`AudioParameter` is a plain data interface; `AudioParameterConverter` is the class that does all conversion math. `AudioControlValue` needs the conversion capability to compute non-authoritative representations.

Resolution options:

- **Option C1a (embedded delegation):** `AudioControlValue` holds an `AudioParameter` reference. Getters for non-authoritative representations lazily instantiate / cache an `AudioParameterConverter`. Conversion logic stays in `AudioParameterConverter`; the value simply delegates.

- **Option C1b (precomputed):** Constructor eagerly computes all three representations and stores them as plain fields. No lazy conversion, no converter reference held beyond construction. Slight wasted work if the consumer never reads non-authoritative fields; simpler memory model.

- **Option C1c (value + converter pair):** The value holds a direct reference to `AudioParameterConverter`. Consumers passing the same parameter to many controls would benefit from shared converter instances.

C1a is the user-facing simplest; C1b is the dumbest and most predictable; C1c is the most performance-conscious for high-component-count apps. C1b is probably the right default — precompute on construction, keep the type pure data. Performance impact is negligible (one `normalize()` + `toMidi()` call per value construction).

`AudioControlValue` naturally belongs in `packages/core/src/model/` next to `AudioParameter` and `AudioParameterConverter`. It is framework-agnostic.

#### Challenge 2 — Conflict with ad-hoc component props

Existing controls support **ad-hoc mode** (no `parameter` prop; `min`/`max`/`step`/`unit`/`scale`/`midiResolution`/`defaultValue` provided inline) and **strict mode** (`parameter` prop provided; ad-hoc props ignored). The `parameter` prop already takes precedence over ad-hoc props when both are supplied.

Under `AudioControlValue`, the parameter reference lives on the value itself. Three surfaces potentially describe a parameter: the value's embedded parameter, the `parameter` prop, and the ad-hoc props. Resolution rules need to be unambiguous.

Resolution options:

- **Option C2a (value wins):** When `value` is an `AudioControlValue`, its embedded parameter overrides both the `parameter` prop and any ad-hoc props. Those props become ignored in this mode. Simple rule, easy to document: "AudioControlValue carries everything."

- **Option C2b (consistency required):** When `value` is an `AudioControlValue`, the `parameter` prop and ad-hoc props either must match or must be absent. Dev-mode warning if they disagree. Stricter, more surface for misuse, no real benefit over C2a.

- **Option C2c (opt-in composition):** The value's parameter is the default; component props override selected fields (e.g., `unit="Hz"` overrides just the unit for display). Complex; punts the "override one field at a time" decision into every control.

C2a is the right default. It preserves a clean two-mode model: _either_ supply an `AudioControlValue` (everything comes from the value), _or_ supply a primitive with a `parameter` or ad-hoc props (everything comes from the props). The component type can discriminate:

```ts
type ValueInput<T> =
  | { value: AudioControlValue<T>; parameter?: never /* ad-hoc: never */ }
  | { value: T; parameter: AudioParameter /* ad-hoc: never */ }
  | { value: T; parameter?: never; min: number; max: number /* ad-hoc remaining */ };
```

#### Challenge 3 — Interaction with primitive-state consumers

A user whose application state is a plain primitive (`useState(440)` or a Redux store with numbers) must wrap on every render:

```tsx
<Knob value={AudioControlValue.fromValue(store.cutoff, cutoffParam)} onChange={(v) => setCutoff(v.value)} />
```

This is more ceremony than the present API. Two mitigations:

- **Keep the primitive-value form as a first-class overload.** Component accepts either `AudioControlValue<T>` or a primitive `T` (with `parameter` or ad-hoc props). Internally both reduce to an `AudioControlValue`; the component's downstream code uses the richer type.

- **Callback shape for primitive-state consumers.** If the callback receives an `AudioControlValue<T>`, primitive-state consumers write `onChange={(v) => setCutoff(v.value)}`. If it receives `(value: T, ctx: AudioControlValue<T>)`, they write `onChange={setCutoff}`. The second form pairs the primitive-ergonomic path with the rich-context path.

#### Challenge 4 — Serialization and persistence

Preset files, URL state, and external stores typically want primitives, not class instances. An `AudioControlValue` with methods does not JSON-serialize cleanly.

Resolution: `AudioControlValue` is a structural type, not a class. Implement as a plain object + free factory functions:

```ts
interface AudioControlValue<T> {
  readonly value: T;
  readonly normalizedValue: number;
  readonly midiValue: number;
  readonly parameter: AudioParameter;
  readonly authoritative: "value" | "normalized" | "midi";
}

function audioValue<T>(value: T, parameter: AudioParameter): AudioControlValue<T>;
function audioValueFromNormalized<T>(n: number, parameter: AudioParameter): AudioControlValue<T>;
function audioValueFromMidi<T>(m: number, parameter: AudioParameter): AudioControlValue<T>;
function withValue<T>(v: AudioControlValue<T>, newValue: T): AudioControlValue<T>;
// etc.
```

Plain objects serialize fine (the `parameter` field is also plain data). `JSON.stringify` round-trips cleanly minus the parameter identity (which the consumer reassembles via a registry on rehydration — or stores separately).

Trade-off: loses method-syntax (`v.withValue(x)` → `withValue(v, x)`), which is slightly less ergonomic but avoids classes in state.

### Comparison to Combo C (paired primitive channels)

Axis-by-axis, for Combo D (AudioControlValue I/O) vs. Combo C (paired primitive channels):

| Axis                        | Combo C (paired)                                        | Combo D (AudioControlValue)                                      |
| --------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------- |
| Correctness-by-construction | Yes                                                     | Yes                                                              |
| Shape symmetry              | Perfect, per-channel                                    | Perfect, single type                                             |
| Explicitness at call site   | High (named prop per rep)                               | Moderate (factory name carries intent)                           |
| Simple-case ergonomics      | `<Knob value={x} onValueChange={setX} />`               | `<Knob value={v} onChange={setV} />` with `v: AudioControlValue` |
| Primitive-state ergonomics  | Native (primitives in props)                            | Requires wrapping at prop boundary                               |
| API surface (prop count)    | 3 input × 3 output = 6                                  | 1 input + 1 output = 2                                           |
| Type complexity             | Discriminated unions with 3 branches                    | One parametric type                                              |
| Serialization               | Primitives — trivial                                    | Plain object — trivial if designed as POJO                       |
| Separation of concerns      | Clean (primitives don't know parameters)                | Looser (value bundles parameter reference)                       |
| Conflict with ad-hoc props  | None (ad-hoc props still work with `value={primitive}`) | Needs resolution rule (C2a above)                                |

Combo C wins on separation of concerns and primitive-state ergonomics. Combo D wins on surface minimalism and unified type. Neither dominates.

## Open Questions

1. **Does the library want to privilege primitive state or rich-value state?** If audio-ui apps typically keep real-value floats in their audio engines and bind UI to those floats, Combo C (or Combo B) is friendlier. If apps benefit from treating parameter values as first-class objects with identity (for automation, undo stacks, cross-control broadcasting), Combo D is friendlier.

2. **Is the parameter identity part of the value's identity?** In Combo D, two `AudioControlValue` instances with the same real value but different parameters are distinct. In Combo C, `value={440}` is portable between parameters; meaning is given by the adjacent `parameter` prop. Which model matches how consumers think?

3. **How common is the cross-representation use case, actually?** If most consumers only ever bind real values, the three-representation input may be over-engineering. If a meaningful fraction binds MIDI or normalized (e.g., for controller mapping UIs, automation editors), the input-side expansion earns its surface cost.

4. **What does uncontrolled mode look like under each option?** The present API is controlled-only for most controls (`defaultValue` exists for discrete). Combo C suggests `defaultValue` / `defaultNormalizedValue` / `defaultMidiValue`. Combo D suggests `defaultValue: AudioControlValue<T>`. Is either the right answer?

5. **Where does `parameter` live under Combo D?** The doc assumes it migrates onto the value. An alternative is to keep `parameter` as a prop and treat `AudioControlValue` as parameter-free (just the three representations). This restores separation-of-concerns but weakens the "value knows itself" property — you could not call `v.normalizedValue` without also holding the parameter separately.

6. **Does the dev-mode warning hook survive any of these refactors?** Under Combo A it's necessary. Under Combo B, C, or D with TypeScript users it becomes redundant; with JS users it may still catch shape mismatches. The cost/benefit of keeping it under each combo deserves its own call.

7. **Can Combo C and Combo D coexist?** In principle a component could accept either paired primitive props or a single `AudioControlValue`. That maximizes flexibility at the cost of a very large type. Practical for a v1, or punting the decision?

## Notes for Future Decisions

- All options except A are **breaking** for consumers of the current `value`/`onChange` shape. Developer Preview status (per project conventions) removes the need for migration bridges; breaking changes are acceptable.
- TypeScript carries most of the safety for all options; the dev-mode warning hook is only load-bearing for JS / loose-TS consumers (LLM sandboxes, hand-written glue).
- The `useAudioParameter` hook is the single internal touchpoint that all options flow through. Most of the adaptation work concentrates there; component call sites see minimal surface difference.
