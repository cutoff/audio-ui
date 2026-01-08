<!--
 Copyright (c) 2026 Tylium.
 SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 See LICENSE.md for details.
-->

# CycleButton Architecture & Specification

## Overview

`CycleButton` is a discrete interaction control for enumerations (discrete options) that cycles through a set of values. It supports multiple visual variants (rotary knob-style, LED indicators, etc.) and handles discrete step-based interactions only. It supports cycling through options via click or keyboard.

## Modes of Operation

The component logic is designed to unify **Model** (logical parameter definition) and **View** (visual representation) through three distinct usage modes:

### 1. Ad-Hoc Mode (Children Only)

Designed for simple use cases where the component infers the data model directly from the UI markup.

- **Input**: `Option` children only. No `parameter` prop.
- **Model**: An `EnumParameter` is generated automatically.
  - `options`: Derived from children.
  - `defaultValue`: Derived from `defaultValue` prop on `CycleButton` (or first option).
  - `label`: Derived from `label` prop on Option > `children` (if text) > `value`.
- **View**: Mapped directly from `children`.

```tsx
import { CycleButton, Option } from "@cutoff/audio-ui-react";

<CycleButton defaultValue="sine" label="Waveform">
  <Option value="sine">Sine</Option>
  <Option value="square">Square</Option>
</CycleButton>;
```

### 2. Strict Mode (Parameter Only)

Designed for data-driven applications where the model is defined externally.

- **Input**: `parameter` prop (EnumParameter). No children.
- **Model**: Uses the provided `parameter` as the single source of truth.
- **View**: Uses `renderOption` prop (if provided) or falls back to `parameter.options[i].label`.

```tsx
<CycleButton parameter={waveformParam} renderOption={(opt) => <Icon name={opt.label} />} />
```

### 3. Hybrid Mode (Parameter + Children)

Designed for cases where you have a strict model but want to declare custom visuals (like icons) via JSX.

- **Input**: `parameter` prop AND `Option` children.
- **Model**: Uses the provided `parameter` (Strict). The `value` and `label` props on children are ignored for the model, but used for matching.
- **View**: Visual content is looked up in the children by matching `value`.

```tsx
import { CycleButton, Option } from "@cutoff/audio-ui-react";

<CycleButton parameter={waveformParam}>
  <Option value="sine">
    <SineIcon />
  </Option>
  <Option value="square">
    <SquareIcon />
  </Option>
</CycleButton>;
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

- **Controlled**: Use `value` prop on `CycleButton`.
- **Uncontrolled**: Use `defaultValue` prop on `CycleButton`.
- **Fallback**: Defaults to the first option if neither is provided.

## Interaction Behavior

`CycleButton` is a **discrete-only** control. It does not support continuous interaction (drag/wheel). All interactions result in discrete step changes.

- **Click / Space**: Cycles to the next value (wraps around).
- **Arrow Keys**: Steps up/down (clamped at min/max, does not wrap).

## Visual Variants

`CycleButton` is designed to support multiple visual variants:

- **Rotary variant**: Uses a knob-style visual (current default implementation)
- **LED variant**: Uses LED indicators to show the current value (planned)
- **Other variants**: Additional visual styles can be added as needed

The component architecture separates the discrete interaction logic from the visual representation, allowing different visual variants to share the same interaction behavior.
