export type StretchableProps = {
    /** Whether the knob should stretch to fill its container
     *  @default false
     */
    stretch?: boolean;
};

export type ControlProps = {
    /** Minimum value of the knob */
    min: number;
    /** Maximum value of the knob */
    max: number;
    /** Current value of the knob */
    value: number;
    /** Label displayed below the knob */
    label?: string;
};

export type BipolarControlProps = {
    /** Whether to start the arc from the center (360°) instead of MAX_START_ANGLE */
    bipolar?: boolean;
};
