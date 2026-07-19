"use client";

import { useEffect } from "react";
import { useTrackerStore } from "@/store/useTrackerStore";

export function ThemeSync() {
    const darkMode = useTrackerStore((s) => s.settings.darkMode);

    useEffect(() => {
        const root = document.documentElement;
        if (darkMode) {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
    }, [darkMode]);

    return null;
}