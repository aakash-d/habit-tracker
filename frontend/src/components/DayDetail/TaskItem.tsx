"use client";

import { useEffect, useState } from "react";
import { Check, StickyNote, Flame } from "lucide-react";
import { Habit, Frequency } from "@/lib/types";
import { useTrackerStore } from "@/store/useTrackerStore";
import { getMonthRange } from "@/lib/dateUtils";
import { useCompletions, useSetCompletion, useSetTaskNote, useSetValue } from "@/hooks/useCompletions";
import { useCategories } from "@/hooks/useCategories";
import { useStreak } from "@/hooks/useStreak";
import { asCount } from "@/lib/measurement";

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

    const setValue = useSetValue(from, to);
    const count = asCount(habit.measurement);

    const serverValue = records[date]?.values?.[habit.id];
    const [valueInput, setValueInput] = useState(
    serverValue != null ? String(serverValue) : ""
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        setValueInput(serverValue != null ? String(serverValue) : "");
    }, [serverValue, date, habit.id]);

    const commitValue = () => {
        const trimmed = valueInput.trim();
        if (trimmed === "") return; // nothing typed — don't send
        const parsed = Number(trimmed);
        if (!Number.isFinite(parsed) || parsed < 0) {
            setValueInput(serverValue != null ? String(serverValue) : "");
            return;
        }
        if (parsed === serverValue) return; // unchanged
        setValue.mutate({
            habitId: habit.id,
            date,
            value: parsed,
            measurement: habit.measurement,
        });
    };

    return (
        <div className="rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="p-3">
                {/* Row 1 — checkbox, name, meta, category, note */}
                <div className="flex items-start gap-3">
                    {/* Checkbox toggle */}
                    <button
                        onClick={() => {
                            if (count && count.direction === "atLeast") {
                                setValue.mutate({
                                    habitId: habit.id,
                                    date,
                                    value: done ? 0 : count.target,
                                    measurement: habit.measurement,
                                });
                            } else {
                                setCompletion.mutate({ habitId: habit.id, date, done: !done });
                            }
                        }}
                        className="flex min-w-0 flex-1 items-start gap-3 text-left"
                    >
                    <span
                        className={[
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition",
                        done
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-gray-300 dark:border-gray-600",
                        ].join(" ")}
                    >
                        {done && <Check size={14} strokeWidth={3} />}
                    </span>

                    {/* Icon + name */}
                    <span className="flex min-w-0 flex-col">
                        <span className="flex items-center gap-2">
                            {habit.icon && <span className="shrink-0">{habit.icon}</span>}
                            <span
                                className={[
                                "truncate text-sm",
                                done ? "text-gray-400 line-through" : "",
                                ].join(" ")}
                            >
                                {habit.name}
                            </span>
                        </span>

                        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-gray-400">
                            <span>{frequencyLabel(habit.frequency)}</span>
                            {streak && streak.current > 0 && (
                                <span className="flex items-center gap-0.5 text-orange-500">
                                    <Flame size={11} />
                                    {streak.current}
                                    {streak.unit === "weeks" ? "w" : "d"}
                                </span>
                            )}
                        </span>
                    </span>
                </button>

                <div className="flex shrink-0 items-center gap-2 pt-0.5">
                    {/* Category dot */}
                    {category && (
                        <span
                            className="h-2.5 w-2.5 rounded-full"
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
                        <StickyNote size={15} />
                    </button>
                </div>
            </div>

            {/* Row 2 — value input (measurable habits only) */}
            {count && (
                <div className="mt-2 flex items-center gap-2 pl-8">
                    <input
                        type="number"
                        min="0"
                        step="any"
                        value={valueInput}
                        onChange={(e) => setValueInput(e.target.value)}
                        onBlur={commitValue}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") e.currentTarget.blur();
                        }}
                        placeholder="0"
                        className="w-16 rounded-md border border-gray-300 bg-white px-2 py-1 text-right text-xs text-gray-900 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    />
                    <span className="text-xs text-gray-400">
                        {count.direction === "atMost" ? (
                            <>
                                / <span className="text-amber-500">max</span> {count.target}{" "}
                                {count.unit}
                            </>
                            ) : (
                                <>
                                    / {count.target} {count.unit}
                                </>
                            )}
                        </span>
                    </div>
                )}
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