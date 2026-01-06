"use client";

import React, { useMemo } from "react";
import classNames from "classnames";
import AdaptiveBox from "@/primitives/AdaptiveBox";
import SvgKnob from "./SvgKnob";
import { AdaptiveBoxProps, AdaptiveSizeProps, BaseProps, InteractiveControlProps, ThemableProps } from "@/types";
import { useThemableProps } from "@/defaults/AudioUiProvider";
import { CLASSNAMES } from "@cutoff/audio-ui-core";
import { EnumParameter } from "@cutoff/audio-ui-core";
import { useAudioParameter } from "@/hooks/useAudioParameter";
import { useInteractiveControl } from "@/hooks/useInteractiveControl";
import { useAdaptiveSize } from "@/hooks/useAdaptiveSize";
import { useEnumParameterResolution } from "@/hooks/useEnumParameterResolution";
import { clampNormalized } from "@cutoff/audio-ui-core";
import { DEFAULT_ROUNDNESS } from "@cutoff/audio-ui-core";

/**
 * Props for the KnobSwitch component
 */
export type KnobSwitchProps = AdaptiveSizeProps &
    AdaptiveBoxProps &
    InteractiveControlProps<any> &
    BaseProps &
    ThemableProps & {
        /** Label displayed below the component */
        label?: string;
        /** Current value of the component (Controlled mode) */
        value?: any;
        /** Default value of the component (Uncontrolled mode) */
        defaultValue?: any;
        /** Child elements (Option components) */
        children?: React.ReactNode;
        /** Identifier for the parameter this control represents */
        paramId?: string;
        /** Audio Parameter definition (Strict Model Mode) */
        parameter?: EnumParameter;
        /** Custom renderer for options (used when parameter is provided but no children map exists) */
        renderOption?: (option: { value: any; label: string }) => React.ReactNode;
        /** Thickness of the knob's stroke (normalized 0.0-1.0, maps to 1-20) */
        thickness?: number;
    };

/**
 * A switch component that uses a knob interface to cycle through options.
 *
 * Supports three modes of operation:
 * 1. Ad-Hoc Mode (Children only): Model inferred from Option children.
 * 2. Strict Mode (Parameter only): Model provided via parameter prop. View via renderOption.
 * 3. Hybrid Mode (Parameter + Children): Model from parameter, View from children (matched by value).
 */
function KnobSwitch({
    value,
    defaultValue,
    onChange,
    renderOption,
    label,
    adaptiveSize = false,
    size = "normal",
    displayMode,
    labelMode,
    labelPosition,
    labelAlign,
    color,
    roundness,
    thickness = 0.4,
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
    className,
    style,
    children,
}: KnobSwitchProps) {
    // Resolve color and roundness with proper fallbacks
    const clampedRoundness = roundness !== undefined ? clampNormalized(roundness) : undefined;
    const clampedThickness = clampNormalized(thickness);
    const { resolvedColor, resolvedRoundness } = useThemableProps(
        { color, roundness: clampedRoundness },
        { color: undefined, roundness: DEFAULT_ROUNDNESS }
    );

    const { derivedParameter, visualContentMap, defaultVal } = useEnumParameterResolution({
        children,
        paramId,
        parameter,
        defaultValue,
        label,
    });

    const effectiveValue = value !== undefined ? value : defaultVal;

    const { normalizedValue, setNormalizedValue, displayValue, adjustValue, converter } = useAudioParameter(
        effectiveValue,
        onChange,
        derivedParameter
    );

    const stepSize = useMemo(() => {
        const count = derivedParameter.options.length;
        return count > 1 ? 1 / (count - 1) : 0;
    }, [derivedParameter.options.length]);

    const interactiveProps = useInteractiveControl({
        adjustValue,
        interactionMode: interactionMode ?? "both",
        direction: interactionDirection ?? "vertical",
        sensitivity: interactionSensitivity ?? 0.1,
        wheelSensitivity: stepSize > 0 ? stepSize / 4 : 0,
        editable: !!onChange,
    });

    const { sizeClassName, sizeStyle } = useAdaptiveSize(adaptiveSize, size, "knob");

    // Memoize classNames
    const componentClassNames = useMemo(() => {
        return classNames(
            sizeClassName,
            CLASSNAMES.root,
            CLASSNAMES.container,
            onChange || onClick ? CLASSNAMES.highlight : "",
            className
        );
    }, [sizeClassName, className, onChange, onClick]);

    // Content wrapper style with container query units for scalable text/icons
    const contentWrapperStyle = useMemo(
        () => ({
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "22cqmin",
            fontWeight: "500",
            color: "var(--audioui-text-color)",
            cursor: "inherit",
        }),
        []
    );

    // Icon wrapper style with container query units
    const iconWrapperStyle = useMemo(
        () => ({
            width: "50cqmin",
            height: "50cqmin",
        }),
        []
    );

    // Option lookup map for O(1) performance
    const optionByValueMap = useMemo(() => {
        if (!renderOption) return null;
        const lookupMap = new Map<any, { value: any; label: string }>();
        derivedParameter.options.forEach((opt) => {
            lookupMap.set(opt.value, opt);
        });
        return lookupMap;
    }, [renderOption, derivedParameter.options]);

    // Wrap SVG/React elements in sized container
    const wrapContent = (node: React.ReactNode): React.ReactNode => {
        // Return text content as-is
        if (typeof node === "string" || typeof node === "number") {
            return node;
        }

        // Wrap React elements in sized container
        return (
            <div className="audioui-icon-wrapper" style={iconWrapperStyle}>
                {node}
            </div>
        );
    };

    const content = useMemo(() => {
        if (visualContentMap && visualContentMap.has(effectiveValue)) {
            return wrapContent(visualContentMap.get(effectiveValue));
        }

        if (renderOption && optionByValueMap) {
            const opt = optionByValueMap.get(effectiveValue);
            if (opt) return wrapContent(renderOption(opt));
        }

        return displayValue;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visualContentMap, effectiveValue, renderOption, optionByValueMap, displayValue, iconWrapperStyle]);

    const effectiveLabel = label ?? derivedParameter.name;

    const cycleNext = () => {
        const count = derivedParameter.options.length;
        if (count <= 1) return;

        const currentIdx = derivedParameter.options.findIndex((opt) => opt.value === effectiveValue);
        if (currentIdx === -1) return;

        const nextIdx = (currentIdx + 1) % count;
        const nextVal = derivedParameter.options[nextIdx].value;
        const nextNorm = converter.normalize(nextVal);
        setNormalizedValue(nextNorm);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        interactiveProps.onMouseDown(e);
        onMouseDown?.(e);
    };

    const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
        if (interactionMode === "wheel") return;

        onClick?.(e as unknown as React.MouseEvent);
        if (!e.defaultPrevented) {
            cycleNext();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === " ") {
            e.preventDefault();
            cycleNext();
        } else if (e.key === "ArrowUp" || e.key === "ArrowRight") {
            e.preventDefault();
            const count = derivedParameter.options.length;
            if (count <= 1) return;

            const currentIdx = derivedParameter.options.findIndex((opt) => opt.value === effectiveValue);
            if (currentIdx === -1) return;

            if (currentIdx < count - 1) {
                const nextVal = derivedParameter.options[currentIdx + 1].value;
                setNormalizedValue(converter.normalize(nextVal));
            }
        } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
            e.preventDefault();
            const count = derivedParameter.options.length;
            if (count <= 1) return;

            const currentIdx = derivedParameter.options.findIndex((opt) => opt.value === effectiveValue);
            if (currentIdx === -1) return;

            if (currentIdx > 0) {
                const nextVal = derivedParameter.options[currentIdx - 1].value;
                setNormalizedValue(converter.normalize(nextVal));
            }
        } else {
            interactiveProps.onKeyDown(e);
        }
    };

    const clickableStyle = onClick && !onChange ? { cursor: "pointer" as const } : {};

    return (
        <AdaptiveBox
            displayMode={displayMode ?? "scaleToFit"}
            labelMode={labelMode}
            className={componentClassNames}
            style={{
                ...sizeStyle,
                ...interactiveProps.style,
                ...clickableStyle,
                ...style,
            }}
            labelHeightUnits={20}
            minWidth={40}
            minHeight={40}
        >
            <AdaptiveBox.Svg
                viewBoxWidth={SvgKnob.viewBox.width}
                viewBoxHeight={SvgKnob.viewBox.height}
                onWheel={interactiveProps.onWheel}
                onClick={handleClick}
                onMouseDown={handleMouseDown}
                onTouchStart={interactiveProps.onTouchStart}
                onKeyDown={handleKeyDown}
                onMouseUp={onMouseUp}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                tabIndex={interactiveProps.tabIndex}
                role={interactiveProps.role}
                aria-valuenow={typeof effectiveValue === "number" ? effectiveValue : undefined}
                aria-valuetext={displayValue}
                aria-label={effectiveLabel}
            >
                <SvgKnob
                    normalizedValue={normalizedValue}
                    bipolar={false}
                    thickness={clampedThickness}
                    roundness={resolvedRoundness ?? DEFAULT_ROUNDNESS}
                    color={resolvedColor}
                />
            </AdaptiveBox.Svg>
            {/* HTML overlay for content - rendered outside SVG to avoid Safari foreignObject bugs */}
            <AdaptiveBox.HtmlOverlay>
                <div style={contentWrapperStyle}>{content}</div>
            </AdaptiveBox.HtmlOverlay>
            {effectiveLabel && (
                <AdaptiveBox.Label position={labelPosition} align={labelAlign ?? "center"}>
                    {effectiveLabel}
                </AdaptiveBox.Label>
            )}
        </AdaptiveBox>
    );
}

export default React.memo(KnobSwitch);
