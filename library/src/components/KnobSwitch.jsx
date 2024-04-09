import React from 'react';
import Knob from "./Knob.jsx";

export default function KnobSwitch(
    {
        label,
        value,
        children,
        style,
        stretch,
        onChange,
        onClick
    }) {
    const options = React.Children.toArray(children);

    // Determine the index of the selected option
    let selectedIndex;
    if (value !== undefined) {
        selectedIndex = options.findIndex(option => option.props.value === value);
    } else {
        const selectedOption = options.find(option => option.props.selected);
        selectedIndex = selectedOption ? options.indexOf(selectedOption) : 0;
    }

    // Ensure selectedIndex is within bounds
    selectedIndex = Math.max(0, Math.min(selectedIndex, options.length - 1));

    // Use the value of the selected option as the label, if available
    const selectedLabel = options[selectedIndex]?.props.children ?? label;

    return (
        <Knob min={0}
              max={options.length - 1}
              value={selectedIndex}
              label={label}
              style={style}
              stretch={stretch}
              onClick={onClick}
              onChange={onChange}
        >
            {selectedLabel}
        </Knob>
    )
        ;
}