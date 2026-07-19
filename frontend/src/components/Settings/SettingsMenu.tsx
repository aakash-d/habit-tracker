"use client";

import { useState } from "react";
import { Settings, Sun, Moon } from "lucide-react";
import { useTrackerStore } from "@/store/useTrackerStore";

export function SettingsMenu() {
    const [open, setOpen] = useState(false);

    const darkMode = useTrackerStore((s) => s.settings.darkMode);
    const weekStart = useTrackerStore((s) => s.settings.weekStart);
    const toggleDarkMode = useTrackerStore((s) => s.toggleDarkMode);
    const setWeekStart = useTrackerStore((s) => s.setWeekStart);

    return (
        <div className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                aria-label="Settings"
            >
                <Settings size={16} />
            </button>

            {open && (
                <>
                    {/* click-away backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpen(false)}
                    />
                    <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-800 dark:bg-gray-900">
                        {/* Dark mode toggle */}
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm font-medium">Dark mode</span>
                            <button
                                onClick={toggleDarkMode}
                                className={[
                                    "flex h-6 w-11 items-center rounded-full p-0.5 transition",
                                    darkMode ? "bg-blue-600" : "bg-gray-300",
                                ].join(" ")}
                                aria-label="Toggle dark mode"
                            >
                                <span
                                    className={[
                                        "flex h-5 w-5 items-center justify-center rounded-full bg-white transition-transform",
                                        darkMode ? "translate-x-5" : "translate-x-0"
                                    ].join(" ")}
                                >
                                    {darkMode ? (
                                        <Moon size={12} className="text-blue-600" />
                                    ) : (
                                        <Sun size={12} className="text-orange-500" />
                                    )}
                                </span>
                            </button>
                        </div>

                        {/* Week start */}
                        <div>
                            <span className="mb-1.5 block text-sm font-medium">
                                Week starts on
                            </span>
                            <div className="flex gap-1.5">
                                <button
                                    onClick={() => setWeekStart(0)}
                                    className={[
                                        "flex-1 rounded-lg border px-2 py-1.5 text-sm transition",
                                        weekStart === 0
                                            ? "border-blue-600 bg-blue-600 text-white"
                                            : "border-gray-300 dark:border-gray-700",
                                    ].join(" ")}
                                >
                                    Sunday
                                </button>
                                <button
                                    onClick={() => setWeekStart(1)}
                                    className={[
                                        "flex-1 rounded-lg border px-2 py-1.5 text-sm transition",
                                        weekStart === 1
                                            ? "border-blue-600 bg-blue-600 text-white"
                                            : "border-gray-300 dark:border-gray-700",
                                    ].join(" ")}
                                >
                                    Monday
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}