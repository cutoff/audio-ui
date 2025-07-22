import React from 'react';
import Knob from './Knob';
import {Stretchable} from "../types";

/**
 * Props for the option elements within KnobSwitch
 */
export type KnobSwitchOptionProps = {
    /** Value associated with this option */
    value?: any;
    /** Whether this option is selected by default when no value prop is provided */
    selected?: boolean;
    /** Content to display when this option is selected */
    children?: React.ReactNode;
};

/**
 * Props for the KnobSwitch component
 */
export type KnobSwitchProps = Stretchable & {
    /** Text label displayed below the knob */
    label?: string;
    /** Currently selected value */
    value?: any;
    /** Child elements (KnobSwitch.Option components) */
    children: React.ReactNode;
    /** Additional inline styles */
    style?: React.CSSProperties;
    /** Handler for value changes. Can accept either a new value or a function to update the previous value */
    onChange?: (value: number | ((prev: number) => number)) => void;
    /** Handler for click events */
    onClick?: React.MouseEventHandler<SVGSVGElement>;
};

/**
 * A switch component that uses a knob interface to cycle through options.
 *
 * Features:
 * - Supports multiple options through child components
 * - Can be controlled (using value prop) or uncontrolled (using selected prop on options)
 * - Maintains consistent styling with other knob-based components
 * - Grid layout compatible
 * - Preserves all Knob component interaction behaviors
 *
 * The component wraps the base Knob component, converting discrete options into
 * a continuous range that the knob can interact with. The selected option's content
 * is displayed as the knob's label.
 *
 * This component inherits properties from:
 * - `Stretchable`: For responsive sizing
 *
 * @property {boolean} stretch - Whether the component should stretch to fill its container (from `Stretchable`)
 * @property {string} label - Text label displayed below the knob
 * @property {any} value - Currently selected value
 * @property {React.ReactNode} children - Child elements (KnobSwitch.Option components)
 * @property {React.CSSProperties} style - Additional inline styles
 * @property {Function} onChange - Handler for value changes
 * @property {React.MouseEventHandler} onClick - Handler for click events
 *
 * @example
 * ```tsx
 * // Basic usage with controlled value
 * <KnobSwitch
 *   label="Filter Type"
 *   value="lowpass"
 *   onChange={value => handleChange(value)}
 * >
 *   <KnobSwitch.Option value="lowpass">LP</KnobSwitch.Option>
 *   <KnobSwitch.Option value="highpass">HP</KnobSwitch.Option>
 *   <KnobSwitch.Option value="bandpass">BP</KnobSwitch.Option>
 * </KnobSwitch>
 *
 * // Using the updater function pattern
 * <KnobSwitch
 *   label="Waveform"
 *   onChange={prev => Math.min(prev + 1, maxOptions)}
 * >
 *   <KnobSwitch.Option value="sine">Sine</KnobSwitch.Option>
 *   <KnobSwitch.Option value="square" selected>Square</KnobSwitch.Option>
 *   <KnobSwitch.Option value="saw">Saw</KnobSwitch.Option>
 * </KnobSwitch>
 *
 * // Grid-aligned stretched switch
 * <KnobSwitch
 *   label="Mode"
 *   stretch={true}
 *   style={{ gridColumn: "1 / -1" }}
 * >
 *   <KnobSwitch.Option value="mono">Mono</KnobSwitch.Option>
 *   <KnobSwitch.Option value="stereo">Stereo</KnobSwitch.Option>
 * </KnobSwitch>
 * ```
 */
const KnobSwitch: React.FC<KnobSwitchProps> & {
    Option: React.FC<KnobSwitchOptionProps>;
} = ({
         label,
         value,
         children,
         style,
         stretch = false,
         onChange,
         onClick
     }) => {
    const options = React.Children.toArray(children);

    // Determine the index of the selected option
    const selectedIndex = React.useMemo(() => {
        if (value !== undefined) {
            const index = options.findIndex(
                option => React.isValidElement(option) && option.props.value === value
            );
            return Math.max(0, Math.min(index, options.length - 1));
        } else {
            const selectedOption = options.find(
                option => React.isValidElement(option) && option.props.selected
            );
            return selectedOption ? options.indexOf(selectedOption) : 0;
        }
    }, [value, options]);

    // Use the value of the selected option as the label, if available
    const selectedLabel = React.useMemo(() => {
        const option = options[selectedIndex];
        return React.isValidElement(option) ? option.props.children : label;
    }, [selectedIndex, options, label]);

    return (
        <Knob
            min={0}
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
    );
};

/**
 * Option component for KnobSwitch
 * @private
 */
const Option: React.FC<KnobSwitchOptionProps> = () => {
    return null; // This component is never rendered directly
};

KnobSwitch.Option = Option;

export default KnobSwitch;
