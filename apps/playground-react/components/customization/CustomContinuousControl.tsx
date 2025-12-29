"use client";

import React from "react";
import { ContinuousControl, ContinuousControlProps, AdaptiveBoxProps, ControlComponent } from "@cutoff/audio-ui-react";

/**
 * Props for the CustomContinuousControl component (generic wrapper around any ControlComponent view)
 */
export type CustomContinuousControlProps = ContinuousControlProps &
    AdaptiveBoxProps & {
        /**
         * The Visualization Component.
         * Must adhere to ControlComponent contract.
         */
        view: ControlComponent;
    };

/**
 * CustomContinuousControl component provides a generic wrapper for any ControlComponent view.
 * It connects a Data Model (AudioParameter) to a Visualization View (ControlComponent),
 * similar to ContinuousControl but as a playground example component.
 */
function CustomContinuousControl({
    view: View,
    min = 0,
    max = 1,
    step,
    value,
    onChange,
    label,
    displayMode,
    labelMode,
    labelPosition,
    labelAlign,
    className,
    style,
    parameter,
    paramId,
    interactionMode,
    interactionDirection,
    interactionSensitivity,
    onClick,
    onMouseDown,
    onMouseUp,
    onMouseEnter,
    onMouseLeave,
    renderValue,
    bipolar,
    unit,
    scale,
}: CustomContinuousControlProps) {
    return (
        <ContinuousControl
            view={View}
            min={min}
            max={max}
            step={step}
            bipolar={bipolar}
            value={value}
            label={label}
            displayMode={displayMode}
            labelMode={labelMode}
            labelPosition={labelPosition}
            labelAlign={labelAlign}
            className={className}
            style={style}
            onChange={onChange}
            paramId={paramId}
            onClick={onClick}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            parameter={parameter}
            interactionMode={interactionMode}
            interactionDirection={interactionDirection}
            interactionSensitivity={interactionSensitivity}
            renderValue={renderValue}
            unit={unit}
            scale={scale}
        />
    );
}

export default React.memo(CustomContinuousControl) as typeof CustomContinuousControl;
