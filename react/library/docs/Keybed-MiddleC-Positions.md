# Middle C Positions on Physical MIDI Keyboards

This document outlines the conventional positions of the middle C key (MIDI note 60, C4) on various physical MIDI
keyboard sizes. This information will be used as part of the specifications for the Keybed component.

## MIDI Note Numbering Convention

In the MIDI standard:

- Middle C is assigned MIDI note number 60
- In our notation system, this is represented as C4
- Each octave spans 12 semitones (C, C#, D, D#, E, F, F#, G, G#, A, A#, B)

## Common Keyboard Sizes and Middle C Positions

Below are the standard layouts for common MIDI keyboard sizes and the position of middle C on each:

### 88-Key Keyboards (Full Piano)

- **Starting note:** A (typically A0)
- **Middle C position:** 4th C from the left
- **Layout:** Standard piano layout with 52 white keys and 36 black keys
- **Note range:** A0 to C8
- **Examples:** Full-size digital pianos, grand pianos

### 76-Key Keyboards

- **Starting note:** E (typically E1)
- **Middle C position:** 3rd C from the left
- **Layout:** 45 white keys and 31 black keys
- **Note range:** E1 to G7
- **Examples:** Semi-weighted MIDI controllers, intermediate digital pianos

### 73-Key Keyboards

- **Starting note:** E (typically E1)
- **Middle C position:** 3rd C from the left
- **Layout:** 43 white keys and 30 black keys
- **Note range:** E1 to D7
- **Examples:** Some semi-weighted MIDI controllers

### 61-Key Keyboards

- **Starting note:** C (typically C2)
- **Middle C position:** 3rd C from the left
- **Layout:** 36 white keys and 25 black keys
- **Note range:** C2 to C7
- **Examples:** Common MIDI controllers, entry-level synthesizers

### 49-Key Keyboards

- **Starting note:** C (typically C3)
- **Middle C position:** 2nd C from the left
- **Layout:** 29 white keys and 20 black keys
- **Note range:** C3 to C7
- **Examples:** Compact MIDI controllers, portable synthesizers

### 37-Key Keyboards

- **Starting note:** C (typically C3)
- **Middle C position:** 2nd C from the left
- **Layout:** 22 white keys and 15 black keys
- **Note range:** C3 to C6
- **Examples:** Mini MIDI controllers, portable keyboards

### 32-Key Keyboards

- **Starting note:** C (typically C3)
- **Middle C position:** 2nd C from the left
- **Layout:** 19 white keys and 13 black keys
- **Note range:** C3 to G5
- **Examples:** Compact MIDI controllers

### 25-Key Keyboards

- **Starting note:** C (typically C3)
- **Middle C position:** 2nd C from the left
- **Layout:** 15 white keys and 10 black keys
- **Note range:** C3 to C5
- **Examples:** Mini MIDI controllers, portable keyboards

## Visual Representation

```
25-key:  |C3|   |   |   |C4|   |   |   |C5|
         |  |   |   |   |  |   |   |   |  |
         Middle C is the 2nd C from the left

37-key:  |C3|   |   |   |C4|   |   |   |C5|   |   |   |C6|
         |  |   |   |   |  |   |   |   |  |   |   |   |  |
         Middle C is the 2nd C from the left

49-key:  |C3|   |   |   |C4|   |   |   |C5|   |   |   |C6|   |   |   |C7|
         |  |   |   |   |  |   |   |   |  |   |   |   |  |   |   |   |  |
         Middle C is the 2nd C from the left

61-key:  |C2|   |   |   |C3|   |   |   |C4|   |   |   |C5|   |   |   |C6|   |   |   |C7|
         |  |   |   |   |  |   |   |   |  |   |   |   |  |   |   |   |  |   |   |   |  |
         Middle C is the 3rd C from the left

76-key:  |E1|   |   |C2|   |   |   |C3|   |   |   |C4|   |   |   |C5|   |   |   |C6|   |   |   |C7|   |G7|
         |  |   |   |  |   |   |   |  |   |   |   |  |   |   |   |  |   |   |   |  |   |   |   |  |   |  |
         Middle C is the 3rd C from the left

88-key:  |A0|   |C1|   |   |   |C2|   |   |   |C3|   |   |   |C4|   |   |   |C5|   |   |   |C6|   |   |   |C7|   |   |C8|
         |  |   |  |   |   |   |  |   |   |   |  |   |   |   |  |   |   |   |  |   |   |   |  |   |   |   |  |   |   |  |
         Middle C is the 4th C from the left
```

## Transposition Considerations

The positions described above are for keyboards with no transposition applied. When transposition is applied:

- Positive transposition: Middle C shifts to the right on the keyboard
- Negative transposition: Middle C shifts to the left on the keyboard

For example, with a -12 semitone transposition on a 61-key keyboard, middle C would appear to be the 2nd C from the left
instead of the 3rd.

## Implementation Notes

When implementing the Keybed component:

1. The default configuration should match these standard layouts
2. For 61-key keyboards, the default starting note should be C
3. For 88-key keyboards, the default starting note should be A
4. Middle C (MIDI note 60, C4) should be positioned according to the conventions above
5. The component should support transposition that shifts the apparent position of middle C
6. While physical keyboards typically range from 25-88 keys, the component supports a wider range (1-128 keys) for
   software applications

## References

This information is based on standard MIDI keyboard layouts used by major manufacturers including Yamaha, Roland, Korg,
Nord, and others. While there may be some variations between specific models, these conventions are widely followed in
the industry.
