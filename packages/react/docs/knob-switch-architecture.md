# KnobSwitch Architecture & Specification

## Overview

`KnobSwitch` is a specialized rotary control for enumerations (discrete options) that combines the visual language of a knob with the behavior of a multi-state switch. It supports cycling through options via click, drag, or keyboard.

## Modes of Operation

The component logic is designed to unify **Model** (logical parameter definition) and **View** (visual representation) through three distinct usage modes:

### 1. Ad-Hoc Mode (Children Only)

Designed for simple use cases where the component infers the data model directly from the UI markup.

- **Input**: `Option` children only. No `parameter` prop.
- **Model**: An `EnumParameter` is generated automatically.
  - `options`: Derived from children.
  - `defaultValue`: Derived from `defaultValue` prop on `KnobSwitch` (or first option).
  - `label`: Derived from `label` prop on Option > `children` (if text) > `value`.
- **View**: Mapped directly from `children`.

```tsx
import { KnobSwitch, Option } from "@cutoff/audio-ui-react";

<KnobSwitch defaultValue="sine" label="Waveform">
  <Option value="sine">Sine</Option>
  <Option value="square">Square</Option>
</KnobSwitch>;
```

### 2. Strict Mode (Parameter Only)

Designed for data-driven applications where the model is defined externally.

- **Input**: `parameter` prop (EnumParameter). No children.
- **Model**: Uses the provided `parameter` as the single source of truth.
- **View**: Uses `renderOption` prop (if provided) or falls back to `parameter.options[i].label`.

```tsx
<KnobSwitch parameter={waveformParam} renderOption={(opt) => <Icon name={opt.label} />} />
```

### 3. Hybrid Mode (Parameter + Children)

Designed for cases where you have a strict model but want to declare custom visuals (like icons) via JSX.

- **Input**: `parameter` prop AND `Option` children.
- **Model**: Uses the provided `parameter` (Strict). The `value` and `label` props on children are ignored for the model, but used for matching.
- **View**: Visual content is looked up in the children by matching `value`.

```tsx
import { KnobSwitch, Option } from "@cutoff/audio-ui-react";

<KnobSwitch parameter={waveformParam}>
  <Option value="sine">
    <SineIcon />
  </Option>
  <Option value="square">
    <SquareIcon />
  </Option>
</KnobSwitch>;
```

## Option Component Specification

The `Option` component serves two purposes depending on the mode:

1.  **Visual Mapping**: "For Value X, render ReactNode Y".
2.  **Model Inference** (Ad-hoc only): "Create an option with Value X and Label Z".

### Props

| Prop       | Type        | Description                                                             |
| ---------- | ----------- | ----------------------------------------------------------------------- |
| `value`    | `any`       | The identifier for this option. Falls back to index if omitted.         |
| `children` | `ReactNode` | The visual content (Text or Icon) to render.                            |
| `label`    | `string`    | **Important**: The semantic label for accessibility and the data model. |

### Label Inference Logic (Ad-Hoc Mode)

When inferring the `label` for the generated `EnumParameter`:

1.  **`props.label`** (Highest Priority) - _Always use this for Icons._
2.  **`props.children`** (if string/number) - _Convenient for text options._
3.  **`String(value)`** (Fallback) - _Last resort._

### State Management

**`selected` Prop Removed**: The `selected` prop has been removed from `Option` to enforce React's controlled/uncontrolled patterns.

- **Controlled**: Use `value` prop on `KnobSwitch`.
- **Uncontrolled**: Use `defaultValue` prop on `KnobSwitch`.
- **Fallback**: Defaults to the first option if neither is provided.

## Interaction Behavior

- **Click / Space**: Cycles to the next value (wraps around).
- **Arrow Keys**: Steps up/down (clamped at min/max, does not wrap).
- **Drag**: High sensitivity (0.1) for responsive stepping.
- **Wheel**: Discrete stepping (1 notch ≈ 1 step).
