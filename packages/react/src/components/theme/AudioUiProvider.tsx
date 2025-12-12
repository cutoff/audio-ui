"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { Themable } from "../types";
import { getAdaptiveDefaultColor, isDarkMode } from "../utils/colorUtils";
import { clampNormalized } from "../utils/normalizedProps";
import { DEFAULT_ROUNDNESS } from "../utils/themeDefaults";

/**
 * Theme context type with setter functions
 */
interface ThemeContextType {
    color: string | undefined;
    roundness: number;
    isDarkMode: boolean;
    setColor: (color: string) => void;
    setRoundness: (roundness: number) => void;
}

// Create context with default values
// Note: color will be resolved to adaptive default if not provided
const ThemeContext = createContext<ThemeContextType>({
    color: undefined,
    roundness: DEFAULT_ROUNDNESS,
    isDarkMode: false,
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
     * Initial color value (any valid CSS color value)
     * @default undefined (uses adaptive default: white in dark mode, black in light mode)
     */
    initialColor?: string;
    /**
     * Initial roundness value (normalized 0.0-1.0)
     * @default 0.3
     */
    initialRoundness?: number;
}

/**
 * AudioUiProvider component provides a context for themable properties
 * that can be used across the application.
 *
 * @example
 * ```tsx
 * <AudioUiProvider initialColor="purple" initialRoundness={0.4}>
 *   <App />
 * </AudioUiProvider>
 * ```
 */
export function AudioUiProvider({ children, initialColor, initialRoundness = DEFAULT_ROUNDNESS }: AudioUiProviderProps) {
    const [color, setColor] = useState<string | undefined>(initialColor);
    const [roundness, setRoundness] = useState<number>(clampNormalized(initialRoundness));

    // Track color mode at provider level - shared across all components
    // This prevents creating multiple MutationObservers and MediaQueryList listeners
    const [isDarkModeState, setIsDarkModeState] = useState(() => {
        if (typeof window === "undefined") return false;
        return isDarkMode();
    });

    useEffect(() => {
        if (typeof window === "undefined") return;

        // Function to check and update mode
        const checkMode = () => {
            setIsDarkModeState(isDarkMode());
        };

        // Check mode on mount
        checkMode();

        // Listen for class changes on document element (shared observer for all components)
        const observer = new MutationObserver(checkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        // Listen for system preference changes (shared listener for all components)
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => checkMode();
        mediaQuery.addEventListener("change", handleChange);

        return () => {
            observer.disconnect();
            mediaQuery.removeEventListener("change", handleChange);
        };
    }, []);

    // Memoize the context value to prevent unnecessary re-renders
    const contextValue = useMemo(
        () => ({
            color,
            roundness,
            setColor,
            setRoundness,
            isDarkMode: isDarkModeState, // Expose mode to consumers
        }),
        [color, roundness, isDarkModeState]
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
 * 4. Final fallback to adaptive default (white in dark mode, black in light mode)
 *
 * This hook automatically re-renders components when color mode or theme color changes
 * via the shared context (no per-component observers).
 *
 * @param props The component props that may include themable properties
 * @param defaultValues Default values to use as final fallback
 * @returns Resolved themable properties
 *
 * @example
 * ```tsx
 * const { resolvedColor, resolvedRoundness } = useThemableProps(
 *   { color, roundness },
 *   { color: undefined, roundness: 12 }
 * );
 * ```
 */
export function useThemableProps(
    props: Partial<Themable>,
    defaultValues: Partial<Themable>
): { resolvedColor: string; resolvedRoundness: number | undefined } {
    const themeContext = useAudioUiTheme();

    // Memoize resolved color to prevent unnecessary recalculations
    // Only recompute when inputs actually change
    const resolvedColor = useMemo(() => {
        return props.color ?? themeContext.color ?? defaultValues.color ?? getAdaptiveDefaultColor();
    }, [props.color, themeContext.color, defaultValues.color, themeContext.isDarkMode]);

    // Memoize resolved roundness and clamp to 0.0-1.0
    const resolvedRoundness = useMemo(() => {
        const value = props.roundness ?? themeContext.roundness ?? defaultValues.roundness;
        return value !== undefined ? clampNormalized(value) : undefined;
    }, [props.roundness, themeContext.roundness, defaultValues.roundness]);

    return { resolvedColor, resolvedRoundness };
}

export default AudioUiProvider;
