"use client";

import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { Themable } from "../types";

/**
 * Theme context type extending Themable with setter functions
 */
interface ThemeContextType extends Themable {
    /**
     * Set the primary color
     */
    setColor: (color: string) => void;
    /**
     * Set the roundness value
     */
    setRoundness: (roundness: number) => void;
}

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
    color: "var(--primary-color)",
    roundness: 12,
    setColor: () => {},
    setRoundness: () => {},
});

/**
 * Props for the AudioUiProvider component
 */
export interface AudioUiProviderProps {
    /**
     * Child components that will have access to the theme context
     */
    children: ReactNode;
    /**
     * Initial color value
     * @default "blue"
     */
    initialColor?: string;
    /**
     * Initial roundness value
     * @default 12
     */
    initialRoundness?: number;
}

/**
 * AudioUiProvider component provides a context for themable properties
 * that can be used across the application.
 *
 * @example
 * ```tsx
 * <AudioUiProvider initialColor="purple" initialRoundness={8}>
 *   <App />
 * </AudioUiProvider>
 * ```
 */
export function AudioUiProvider({ children, initialColor = "var(--primary-color)", initialRoundness = 12 }: AudioUiProviderProps) {
    const [color, setColor] = useState<string>(initialColor);
    const [roundness, setRoundness] = useState<number>(initialRoundness);

    // Memoize the context value to prevent unnecessary re-renders
    const contextValue = useMemo(
        () => ({
            color,
            roundness,
            setColor,
            setRoundness,
        }),
        [color, roundness]
    );

    return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

/**
 * Hook to access the theme context
 *
 * @returns The theme context value
 *
 * @example
 * ```tsx
 * const { color, roundness, setColor, setRoundness } = useAudioUiTheme();
 * ```
 */
export function useAudioUiTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useAudioUiTheme must be used within an AudioUiProvider");
    }
    return context;
}

/**
 * Hook to resolve themable props with the proper fallback mechanism:
 * 1. Use component prop if provided
 * 2. Use theme context value if available
 * 3. Fall back to the provided default value
 *
 * @param props The component props that may include themable properties
 * @param defaultValues Default values to use as final fallback
 * @returns Resolved themable properties
 *
 * @example
 * ```tsx
 * const { resolvedColor, resolvedRoundness } = useThemableProps(
 *   { color, roundness },
 *   { color: "blue", roundness: 12 }
 * );
 * ```
 */
export function useThemableProps(
    props: Partial<Themable>,
    defaultValues: Partial<Themable>
): { resolvedColor: string; resolvedRoundness: number | undefined } {
    const themeContext = useAudioUiTheme();

    // Since defaultValues.color could be undefined, provide a final fallback to the current theme token
    const resolvedColor = props.color ?? themeContext.color ?? defaultValues.color ?? "var(--primary-color)";

    // resolvedRoundness can be undefined if it's meant to be calculated dynamically
    const resolvedRoundness = props.roundness ?? themeContext.roundness ?? defaultValues.roundness;

    return { resolvedColor, resolvedRoundness };
}

export default AudioUiProvider;
