"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
const STORAGE_KEY = "gerege_theme";
const defaults = { design: "original", mode: "light", accent: "neutral", density: "comfortable" };
const ThemeContext = createContext(null);
function resolveMode(mode) {
    if (mode !== "system")
        return mode;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
export function ThemeProvider({ children }) {
    const [preferences, setPreferences] = useState(defaults);
    const [resolvedMode, setResolvedMode] = useState("light");
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
            if (saved) {
                if (saved.design === "native")
                    saved.design = "original";
                setPreferences({ ...defaults, ...saved });
            }
        }
        catch {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, []);
    useEffect(() => {
        const media = window.matchMedia("(prefers-color-scheme: dark)");
        const apply = () => {
            const nextMode = resolveMode(preferences.mode);
            setResolvedMode(nextMode);
            document.documentElement.dataset.theme = nextMode;
            document.documentElement.dataset.accent = preferences.accent;
            document.documentElement.dataset.density = preferences.density;
            document.documentElement.dataset.design = preferences.design;
            document.documentElement.style.colorScheme = nextMode;
        };
        apply();
        media.addEventListener("change", apply);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
        return () => media.removeEventListener("change", apply);
    }, [preferences]);
    const value = useMemo(() => ({
        ...preferences,
        resolvedMode,
        updateTheme: (next) => setPreferences((current) => ({ ...current, ...next })),
        toggleMode: () => setPreferences((current) => ({
            ...current,
            mode: resolveMode(current.mode) === "dark" ? "light" : "dark",
        })),
        resetTheme: () => setPreferences(defaults),
    }), [preferences, resolvedMode]);
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context)
        throw new Error("useTheme must be used inside ThemeProvider");
    return context;
}
