<!--
 Copyright (c) 2026 Tylium.
 SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 See LICENSE.md for details.
-->

# Audio Parameter Specification

## Overview

This document outlines the architectural separation of concerns for audio and MIDI UI components in the Audio UI library. The goal is to separate the **Model** (what the parameter is and how it behaves) from the **View** (SVG/Canvas rendering) and the **Controller** (React state management and user interaction).

## The Tripartite Value System

To robustly handle audio and MIDI data, we identify three distinct value domains that must be translated between. **Crucially, the MIDI Value (Integer) serves as the central pivot and source of truth**, ensuring deterministic values and avoiding floating-point drift.

1.  **MIDI Value (The Source of Truth)**
    - **Type**: Integer
    - **Range**: 0 to (2^Resolution - 1).
    - **Characteristics**: Linear, discrete. Represents the quantized state of the parameter.
    - **Role**: The pivot point. All conversions (Real <-> Normalized) go through this integer value.

2.  **Normalized Value (The UI/Host Reality)**
    - **Type**: Float
    - **Range**: 0.0 to 1.0 inclusive.
    - **Characteristics**:
      - Linear with respect to the **Control Travel** (0% to 100% rotation).
      - Linear with respect to **MIDI Values**.
    - **Usage**: Used by visual components (`KnobView`) and Host Automation (VST3/AU).

3.  **Real Value (The Audio/DSP Reality)**
    - **Type**: `number | boolean | string` (Polymorphic).
    - **Range**: Defined by the specific Parameter Type.
    - **Characteristics**: Can be logarithmic, exponential, discrete, or boolean.
    - **Usage**: This is the value the application logic / audio engine actually uses.

## Architecture

We adopt a React-idiomatic Model-View-Controller (MVC) approach:

- **Model**: `AudioParameter` (Polymorphic Interface) and `AudioParameterConverter` (Class). Defines the physics, boundaries, and formatting.
- **Controller**: `useAudioParameter` (Hook). Connects the Model to React state, handling normalization/denormalization.
- **View**: `Knob`, `Switch`, `Slider` (Components). Presentation layers that enforce compatibility with specific parameter types.

### 1. The Domain Model

The `AudioParameter` is a polymorphic union type to handle different data shapes properly.

#### Base Definition

```typescript
export type AudioParameterType = "continuous" | "boolean" | "enum";

interface BaseAudioParameter {
  id: string;
  name: string; // 'title' in MIDI 2.0 PE
  type: AudioParameterType;

  // The physical MIDI resolution (7, 14 bits, etc.)
  // Default: 32 (High resolution for internal precision)
  midiResolution?: 7 | 8 | 14 | 16 | 32 | 64;
}
```

#### 1. Continuous Parameter (Float/Int)

Used for Volume, Frequency, Pan, etc.

```typescript
/**
 * A scale function that transforms normalized values (0..1) to scaled values (0..1)
 * Both forward and inverse must be provided for bidirectional conversion.
 */
export interface ScaleFunction {
  forward: (normalized: number) => number; // Real -> Normalized
  inverse: (scaled: number) => number; // Normalized -> Real
  name?: string;
}

// Predefined scale functions
export const LinearScale: ScaleFunction;
export const LogScale: ScaleFunction; // For volume/dB, frequency
export const ExpScale: ScaleFunction; // For envelope curves

// Type: can be ScaleFunction object or string shortcut
export type ScaleType = ScaleFunction | "linear" | "log" | "exp";

export interface ContinuousParameter extends BaseAudioParameter {
  type: "continuous";
  min: number;
  max: number;
  step?: number; // Granularity of the REAL value (e.g. 0.1, or 1 for Integers)
  defaultValue?: number;
  unit?: string; // "dB", "Hz"
  scale?: ScaleType; // Default: "linear" (can be string shortcut or ScaleFunction object)
}
```

**Important: `step` and Non-Linear Scales**

The `step` parameter defines a **linear grid in the real value domain**, regardless of the scale type. This means:

- **`step` is always applied in the real value domain** (after scale transformation)
- **`step` is optional** - omit it when a linear grid doesn't make sense for your use case
- **The scale transformation affects control feel, not the step grid**

**When `step` makes sense:**

- **Linear scales**: Always works well (e.g., `step: 1` for integer values, `step: 0.5` for half-units)
- **Log scales with linear units**: Works when the unit itself is linear (e.g., `step: 0.5` for dB in a volume parameter)
- **Exp scales with linear units**: Works when the unit itself is linear (e.g., `step: 1` for milliseconds in an attack parameter)

**When `step` may not make sense:**

- **Log scales with non-linear units**: For frequency (Hz) with log scale, linear Hz steps don't align with musical perception. Consider omitting `step` or using a very small step (e.g., `step: 0.01`) to allow smooth control while still providing some quantization.

**Examples:**

```typescript
// Volume with log scale: step makes sense (linear dB increments)
const volumeParam: ContinuousParameter = {
  id: "vol",
  name: "Volume",
  type: "continuous",
  min: -60,
  max: 6,
  step: 0.5, // 0.5 dB increments
  unit: "dB",
  scale: "log",
};

// Frequency with log scale: step may not make sense (musical intervals aren't linear Hz)
const freqParam: ContinuousParameter = {
  id: "freq",
  name: "Frequency",
  type: "continuous",
  min: 20,
  max: 20000,
  // No step - allow smooth control across the logarithmic range
  unit: "Hz",
  scale: "log",
};

// Attack time with exp scale: step makes sense (linear ms increments)
const attackParam: ContinuousParameter = {
  id: "attack",
  name: "Attack",
  type: "continuous",
  min: 0,
  max: 1000,
  step: 1, // 1 ms increments
  unit: "ms",
  scale: "exp",
};
```

**Scale Functions:**

The `scale` property defines how the parameter should be interpreted semantically. It transforms the normalized value (0..1) in the real domain to a scaled value (0..1) for MIDI quantization.

- **`"linear"` or `LinearScale`**: Standard linear mapping (default). Used for pan, modulation depth, etc.
- **`"log"` or `LogScale`**: Logarithmic scale. Used for volume/dB, frequency (musical intervals).
- **`"exp"` or `ExpScale`**: Exponential scale. Used for envelope curves, some filter parameters.

**Usage Examples:**

```typescript
// Using string shortcuts (convenience)
const volumeParam: ContinuousParameter = {
  id: "vol",
  name: "Volume",
  type: "continuous",
  min: -60,
  max: 6,
  unit: "dB",
  scale: "log", // Logarithmic for volume
};

// Using ScaleFunction objects (explicit, extensible)
import { LogScale } from "@cutoff/audio-ui-react";

const freqParam: ContinuousParameter = {
  id: "freq",
  name: "Frequency",
  type: "continuous",
  min: 20,
  max: 20000,
  unit: "Hz",
  scale: LogScale, // Can also use custom ScaleFunction objects
};

// Custom scale function (future extensibility)
const customScale: ScaleFunction = {
  forward: (n) => Math.pow(n, 2), // Square curve
  inverse: (s) => Math.sqrt(s),
  name: "square",
};
```

#### 2. Boolean Parameter (Switch/Button)

Used for Mute, Solo, Bypass.

```typescript
export interface BooleanParameter extends BaseAudioParameter {
  type: "boolean";
  defaultValue?: boolean;
  mode?: "toggle" | "momentary";
  trueLabel?: string; // e.g. "On"
  falseLabel?: string; // e.g. "Off"
}
```

**MIDI Mapping Strategy:**

- **Input (MIDI -> Real)**: Lenient.
  - 0 to <50% MaxMidi = `false`
  - > =50% MaxMidi to MaxMidi = `true`
- **Output (Real -> MIDI)**: Strict.
  - `false` -> 0 (Min)
  - `true` -> MaxMidi (e.g., 127)

#### 3. Discrete Parameter (Discrete Choices)

Used for Waveforms (Sine/Saw/Square), Filter Types (LP/BP/HP).

```typescript
export interface DiscreteParameter extends BaseAudioParameter {
  type: "discrete";
  defaultValue?: number | string;
  options: Array<{
    value: number | string;
    label: string;
    midiValue?: number; // Explicit MIDI value for custom mapping
  }>;

  // How 0..127 maps to the options
  midiMapping?: "spread" | "sequential" | "custom";
}
```

**MIDI Mapping Strategy:**

- **Spread (Default)**: Options are distributed evenly across the MIDI range.
  - e.g., 3 options over 0-127: `0` (Opt A), `64` (Opt B), `127` (Opt C).
- **Sequential**: MIDI value equals the Option Index.
  - e.g., `0` (Opt A), `1` (Opt B), `2` (Opt C).
- **Custom**: Uses the `midiValue` defined in each option.
  - The implementation should likely use the nearest matching MIDI value for input.

#### The Union Type

```typescript
export type AudioParameter = ContinuousParameter | BooleanParameter | DiscreteParameter;
```

### 2. Implementation (`AudioParameterConverter`)

The class wraps the configuration and handles the math for all types using the MIDI Pivot strategy.

- **`toMidi(realValue: T): number`**
  - **Primary Logic**: Quantizes the real value to the integer grid defined by `midiResolution`.
  - Continuous: `round(normalize(real) * MaxMidi)`.
  - Boolean: `false` -> 0, `true` -> MaxMidi.
  - Enum: Depends on `midiMapping` (Spread vs Sequential).

- **`fromMidi(midiValue: number): T`**
  - **Primary Logic**: Converts the integer MIDI value back to the real-world domain.
  - Continuous: `Midi / MaxMidi` -> Scale to min/max. **Applies step grid**.
  - Boolean: `Midi >= 50% MaxMidi` -> `true`.
  - Enum: Maps MIDI value to nearest Option.

- **`normalize(realValue: T): number`**
  - Pivot: `toMidi(realValue) / MaxMidi`.
  - Ensures UI always reflects the quantized state.

- **`denormalize(normalized: number): T`**
  - Pivot: `fromMidi(round(normalized * MaxMidi))`.
  - Ensures UI interactions snap to valid internal steps.

### 3. Component Compatibility

Components are not generic "do-it-all" wrappers. They declare which Parameter Types they support.

| Component       | Supported Types | Constraints                                         |
| :-------------- | :-------------- | :-------------------------------------------------- |
| **Knob**        | `continuous`    | Rejects Boolean/Enum. Use for variable control.     |
| **Slider**      | `continuous`    | Rejects Boolean/Enum.                               |
| **Switch**      | `boolean`       | Rejects Continuous/Enum. Use for On/Off.            |
| **CycleButton** | `enum`          | Specialized for discrete steps. Rejects Continuous. |
| **Button**      | `boolean`       | Momentary or Toggle.                                |

**Validation**: Components should throw a clear error (or render an error state) if passed an incompatible `AudioParameter`.

### 4. The View (Component Props)

Components use a generic prop structure but enforce the type.

```typescript
// Example for Knob
type KnobProps = {
  // Mode A: Explicit Model (Must be Continuous)
  parameter?: ContinuousParameter;

  // Mode B: Ad-hoc (Implies Continuous)
  min?: number;
  max?: number;
  value: number;
  onChange: (val: number) => void;
};

// Example for Switch
type SwitchProps = {
  parameter?: BooleanParameter;
  value: boolean;
  onChange: (val: boolean) => void;
};
```

## Integration Examples

### Integration in `Knob`

The `Knob` component acts as a Facade, supporting both direct `AudioParameter` injection and ad-hoc props (`min`, `max`, `step`). It validates that the parameter is compatible (Continuous).

```tsx
// packages/react/src/components/defaults/controls/Knob.tsx

function Knob(props: KnobProps) {
  // Construct the configuration object either from the prop or from the ad-hoc props
  const paramConfig = useMemo<ContinuousParameter>(() => {
    if (props.parameter) {
      if (props.parameter.type !== "continuous") {
        throw new Error("Knob component only supports continuous parameters.");
      }
      return props.parameter;
    }

    // Ad-hoc / Unmapped Mode (Implies Continuous)
    return {
      id: "adhoc-knob",
      type: "continuous",
      name: props.label || "",
      min: props.min ?? 0,
      max: props.max ?? 100,
      step: props.step,
      unit: props.unit,
      defaultValue: props.min ?? 0,
      midiResolution: 32, // High resolution default
    };
  }, [props.parameter, props.min, props.max, props.step, props.label, props.unit]);

  // Use the hook to handle all math
  const { normalizedValue, formattedValue, adjustValue } = useAudioParameter(props.value, props.onChange, paramConfig);

  const handleWheel = (e: WheelEvent) => {
    // Reverse deltaY so scrolling up increases value
    adjustValue(-e.deltaY);
  };

  return (
    <AdaptiveBox>
      <AdaptiveBox.Svg onWheel={handleWheel}>
        <KnobView
          normalizedValue={normalizedValue}
          // ... pass other styling props ...
        >
          {formattedValue}
        </KnobView>
      </AdaptiveBox.Svg>
      <AdaptiveBox.Label>{props.label ?? paramConfig.name}</AdaptiveBox.Label>
    </AdaptiveBox>
  );
}
```

### Integration in `CycleButton` (Discrete Parameter)

`CycleButton` supports two modes for defining options: explicit Parameter Model or implicit Children (Ad-hoc).

**Mode A: Parameter Driven**

```tsx
// Icons provided via render prop, data driven by parameter
<CycleButton
  parameter={waveformParam} // type: "discrete"
  value={currentWave}
  onChange={setWave}
  renderOption={(opt) => (opt.value === "saw" ? <SawIcon /> : <SquareIcon />)}
/>
```

**Mode B: Children Driven (Ad-hoc)**
The component infers the `DiscreteParameter` from the children structure.

```tsx
<CycleButton value={val} onChange={setVal}>
  <Option value="saw">
    <SawIcon />
  </Option>
  <Option value="sqr">
    <SquareIcon />
  </Option>
</CycleButton>
```

**Internal Logic:**

1. Scan children to build `DiscreteParameter`:
   `options: [{value: "saw", label: "saw"}, {value: "sqr", label: "sqr"}]`
2. Build visual map: `{"saw": <SawIcon />, "sqr": <SquareIcon />}`
3. Use `useAudioParameter` with the generated parameter.
4. Render using visual map for content.

**Wheel Interaction:**

- Uses discrete step-by-step navigation (one option per wheel tick)
- Performance optimized with O(1) value-to-index lookups using Map data structures
- Prevents jumping between extremes by tracking current index and moving incrementally

### Unmapped Parameter (MIDI-only)

For cases where the user just wants a raw MIDI control (e.g., a generic CC knob) without specific units or real-world values.

```typescript
// Usage
const unmappedParam = AudioParameterFactory.createMidiStandard7Bit("Mod Wheel");
// Creates: { type: "continuous", min: 0, max: 127, step: 1, unit: "", midiResolution: 7, ... }

return (
  <Knob
    parameter={unmappedParam}
    value={midiValue}
    onChange={setMidiValue}
  />
);
```

## Unmapped / Default Behavior

- **Default Continuous**: Linear, Min 0, Max 127, Step 1.
- **Default Boolean**: False/True.
- **Factories**:
  - `AudioParameterFactory.createMidiStandard7Bit()` -> Continuous
  - `AudioParameterFactory.createSwitch()` -> Boolean
  - `AudioParameterFactory.createSelector(options)` -> Enum
