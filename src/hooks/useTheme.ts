import type { Theme } from '@/types/workspace'
import { EVENTS, STORAGE_KEYS, THEMES } from '@/constants/strings'
import { useEffect, useSyncExternalStore } from "react";

let fallbackTheme: Theme = THEMES.light;
function readTheme(): Theme {
    try {
        return localStorage.getItem(STORAGE_KEYS.theme) === THEMES.dark
            ? THEMES.dark
            : THEMES.light;
    } catch {
        return fallbackTheme;
    }
}
function subscribe(onChange: () => void) {
    const onStorage = (event: StorageEvent) => {
        if (event.key === STORAGE_KEYS.theme || event.key === null) onChange();
    };
    window.addEventListener(EVENTS.themeChange, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
        window.removeEventListener(EVENTS.themeChange, onChange);
        window.removeEventListener("storage", onStorage);
    };
}
export function useTheme() {
    const theme = useSyncExternalStore(
        subscribe,
        readTheme,
        () => THEMES.light,
    );
    useEffect(() => {
        document.documentElement.dataset.theme = theme;
    }, [theme]);
    return {
        theme,
        toggleTheme: () => {
            fallbackTheme =
                readTheme() === THEMES.light ? THEMES.dark : THEMES.light;
            try {
                localStorage.setItem(STORAGE_KEYS.theme, fallbackTheme);
            } catch {
                /* Works without device storage. */
            }
            window.dispatchEvent(new Event(EVENTS.themeChange));
        },
    };
}
