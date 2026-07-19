"use client";

import { useEffect, useState } from "react";
import { Check, StickyNote, Flame } from "lucide-react";
import { Habit, Frequency } from "@/lib/types";
import { useTrackerStore } from "@/store/useTrackerStore";
import { getMonthRange } from "@/lib/dateUtils";
import { useCompletions, useSetCompletion, useSetTaskNote } from "@/hooks/useCompletions";
import { useCategories } from "@/hooks/useCategories";
import { useStreak } from "@/hooks/useStreak";

function frequencyLabel(freq: Frequency): string {
    switch(freq.type) {
        case "daily":
            return "Daily";
        case "weekdays":
            return "Weekdays";
        case "specificDays": {
            const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            return freq.days.map((d) => names[d]).join(" . ");
        }
        case "timesPerWeek":
            return `${freq.count}× / week`;
    }
}

export function TaskItem({ habit, date }: { habit: Habit; date: string }) {
    const currentMonth = useTrackerStore((s) => s.currentMonth);
    const weekStart = useTrackerStore((s) => s.settings.weekStart);
    const { from, to } = getMonthRange(currentMonth, weekStart);

    const { data: categories = [] } = useCategories();
    const { data: records = {} } = useCompletions(from, to);

    const { data: streak } = useStreak(habit.id, weekStart);
    const category = categories.find((c) => c.id === habit.categoryId);
    const done = records[date]?.completions[habit.id] ?? false;

    const setCompletion = useSetCompletion(from, to);
    const setTaskNote = useSetTaskNote(from, to);
    const serverTaskNote = records[date]?.taskNotes?.[habit.id] ?? "";

    const [noteValue, setNoteValue] = useState(serverTaskNote);
    useEffect(() => {
        setNoteValue(serverTaskNote);
    }, [serverTaskNote, date, habit.id]);

    const [showNote, setShowNote] = useState(false);
    const hasNote = noteValue.trim().length > 0;

    return (
        <div className="rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 p-3">
                {/* Checkbox toggle */}
                <button
                    onClick={() => setCompletion.mutate({habitId: habit.id, date, done: !done })}
                    className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                >
                    <span
                        className={[
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition",
                            done
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-gray-300 dark:border-gray-600",
                        ].join(" ")}
                    >
                        {done && <Check size={14} strokeWidth={3} />}
                    </span>

                    {/* Icon + name */}
                    <span className="flex flex-1 flex-col">
                        <span className="flex flex-1 items-center gap-2">
                            {habit.icon && <span>{habit.icon}</span>}
                            <span
                                className={[
                                    "text-sm",
                                    done ? "text-gray-400 line-through" : "",
                                ].join(" ")}
                            >
                                {habit.name}
                            </span>
                        </span>
                        <span className="flex items-center gap-2 text-xs text-gray-400">
                            <span>{frequencyLabel (habit.frequency)}</span>
                            {streak && streak.current > 0 && (
                                <span className="flex items-center gap-0.5 text-orange-500">
                                    <Flame size={12} />
                                    {streak.current} {streak.unit === "weeks" ? "wk": "d"}
                                </span>
                            )}
                        </span>
                    </span>
                </button>

                {/* Category dot */}
                {category && (
                    <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: category.color }}
                        title={category.name}
                    />
                )}

                {/* Note toggle */}
                <button
                    onClick={() => setShowNote((v) => !v)}
                    className={[
                        "rounded p-1 transition hover:bg-gray-100 dark:hover:bg-gray-800",
                        hasNote ? "text-blue-500" : "text-gray-400",
                    ].join(" ")}
                    aria-label="Toggle note"
                    title={hasNote ? "Edit note" : "Add note"}
                >
                    <StickyNote size={16} />
                </button>
            </div>
            
            {/* Expandable note input */}
            {showNote && (
                <div className="border-t border-gray-200 p-2 dark:border-gray-800">
                    <input
                        value={noteValue}
                        onChange={(e) => setNoteValue(e.target.value)}
                        onBlur={() => {
                            if (noteValue !== serverTaskNote) {
                                setTaskNote.mutate({ habitId: habit.id, date, done, note: noteValue });
                            }
                        }}
                        placeholder="Add a note for this task..."
                        className="w-full rounded-md bg-transparent px-2 py-1.5 text-sm outline-none"
                        autoFocus
                    />
                </div>
            )}
        </div>
    );
}