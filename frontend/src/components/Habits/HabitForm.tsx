"use client";

import { useState } from "react";
import { Habit, Frequency, Measurement } from "@/lib/types";
import { useAddHabit, useUpdateHabit } from "@/hooks/useHabits";
import { useCategories } from "@/hooks/useCategories";
import { asCount } from "@/lib/measurement";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type FreqType = Frequency["type"];

export function HabitForm({
    editing,
    onDone,
}: {
    editing?: Habit;
    onDone: () => void;
}) {
    const { data: categories = [] } = useCategories();
    const addHabit = useAddHabit();
    const updateHabit = useUpdateHabit();
    const existingCount = asCount(editing?.measurement);

    const [name, setName] = useState(editing?.name ?? "");
    const [icon, setIcon] = useState(editing?.icon ?? "");
    const [categoryId, setCategoryId] = useState(editing?.categoryId ?? "");
    const [freqType, setFreqType] = useState<FreqType>(
        editing?.frequency.type ?? "daily"
    );
    const [specificDays, setSpecificDays] = useState<number[]>(
        editing?.frequency.type === "specificDays" ? editing.frequency.days: []
    );
    const [timesPerWeek, setTimesPerWeek] = useState<number>(
        editing?.frequency.type === "timesPerWeek" ? editing.frequency.count: 3
    );
    const [startDate, setStartDate] = useState(
        editing?.createdAt ?? new Date().toISOString().slice(0, 10)
    );
    const [isMeasurable, setIsMeasurable] = useState(existingCount !== null);
    const [target, setTarget] = useState<string>(
    existingCount ? String(existingCount.target) : ""
    );
    const [unit, setUnit] = useState(existingCount?.unit ?? "");
    const [direction, setDirection] = useState<"atLeast" | "atMost">(
    existingCount?.direction ?? "atLeast"
    );

    const buildFrequency = (): Frequency => {
        switch (freqType) {
            case "daily":
                return { type: "daily" };
            case "weekdays":
                return { type: "weekdays" };
            case "specificDays":
                return { type: "specificDays", days: [...specificDays].sort() };
            case "timesPerWeek":
                return { type: "timesPerWeek", count: timesPerWeek };
        }
    };

    const buildMeasurement = (): Measurement | null => {
        if (!isMeasurable) return null;
        const parsed = Number(target);
        if (!Number.isFinite(parsed) || parsed <= 0) return null;
        return {
            type: "count",
            target: parsed,
            unit: unit.trim() || "units",
            direction,
        };
    };
    
    const toggleDay = (d: number) =>
        setSpecificDays((prev) =>
            prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
        );

    const canSave =
        name.trim().length > 0 &&
        startDate.length > 0 &&
        (freqType !== "specificDays" || specificDays.length > 0) &&
        (!isMeasurable || (Number(target) > 0 && unit.trim().length > 0));

    const handleSave = () => {
        const frequency = buildFrequency();
        const payload = {
            name: name.trim(),
            icon: icon.trim() || undefined,
            categoryId: categoryId || null,
            frequency,
            createdAt: startDate,
            measurement: buildMeasurement(),
        };
        if (editing) {
            updateHabit.mutate({ id: editing.id, ...payload }, { onSuccess: onDone });
        } else {
            addHabit.mutate(payload, { onSuccess: onDone });
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Name */}
            <div>
                <label className="mb-1 block text-sm font-medium">Name</label>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Drink water"
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700"
                />
            </div>

            {/* Icon */}
            <div>
                <label className="mb-1 block text-sm font-medium">Icon (emoji)</label>
                <input
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="e.g. 💧"
                    maxLength={2}
                    className="w-20 rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-center"
                />
            </div>

            {/* Category */}
            <div>
                <label className="mb-1 block text-sm font-medium">Category</label>
                <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700"
                >
                    <option value="" className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100">
                        None
                    </option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id} className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100">
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>
            
            {/* Frequency */}
            <div>
                <label className="mb-1 block text-sm font-medium">Frequency</label>
                <select
                    value={freqType}
                    onChange={(e) => setFreqType(e.target.value as FreqType)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700"
                >
                    <option value="daily" className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100">Daily</option>
                    <option value="weekdays" className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100">Weekdays (Mon-Fri)</option>
                    <option value="specificDays" className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100">Specific days</option>
                    <option value="timesPerWeek" className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"> X times per week</option>
                </select>
            </div>

            {/* Measurement */}
            <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
            <label className="flex cursor-pointer items-center gap-2">
                <input
                type="checkbox"
                checked={isMeasurable}
                onChange={(e) => setIsMeasurable(e.target.checked)}
                className="h-4 w-4 accent-blue-600"
                />
                <span className="text-sm font-medium">Track a measurable value</span>
            </label>

            {isMeasurable && (
                <div className="mt-3 flex flex-col gap-3">
                {/* Direction */}
                <div className="flex gap-1.5">
                    <button
                    type="button"
                    onClick={() => setDirection("atLeast")}
                    className={[
                        "flex-1 rounded-lg border px-2 py-1.5 text-xs transition",
                        direction === "atLeast"
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-300 dark:border-gray-700",
                    ].join(" ")}
                    >
                    At least (goal)
                    </button>
                    <button
                    type="button"
                    onClick={() => setDirection("atMost")}
                    className={[
                        "flex-1 rounded-lg border px-2 py-1.5 text-xs transition",
                        direction === "atMost"
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-300 dark:border-gray-700",
                    ].join(" ")}
                    >
                    At most (limit)
                    </button>
                </div>

                {/* Target + unit */}
                <div className="flex gap-2">
                    <div className="flex-1">
                    <label className="mb-1 block text-xs text-gray-500">Target</label>
                    <input
                        type="number"
                        min="0"
                        step="any"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        placeholder="2"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    />
                    </div>
                    <div className="flex-1">
                    <label className="mb-1 block text-xs text-gray-500">Unit</label>
                    <input
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        placeholder="L, reps, min…"
                        maxLength={12}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    />
                    </div>
                </div>

                <p className="text-xs text-gray-400">
                    {direction === "atMost"
                    ? `Complete when you stay at or under ${target || "—"} ${unit || "units"}.`
                    : `Complete when you reach ${target || "—"} ${unit || "units"}.`}
                </p>
                </div>
            )}
            </div>

            {/* Start date */}
            <div>
                <label className="mb-1 block text-sm font-medium">Start date</label>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:scheme-dark]"
                />
                <p className="mt-1 text-xs text-gray-400">
                    The habit will start appearing from this date.
                </p>
            </div>

            {/* Conditional: specific days */}
            {freqType === "specificDays" && (
                <div className="flex flex-wrap gap-1.5">
                    {DAY_LABELS.map((label, d) => {
                        const active = specificDays.includes(d);
                        return (
                            <button
                                key={d}
                                type="button"
                                onClick={() => toggleDay(d)}
                                className={[
                                    "rounded-lg border px-3 py-1.5 text-sm transition",
                                    active
                                        ? "border-blue-600 bg-blue-600 text-white"
                                        : "border-gray-300 dark:border-gray-700",  
                                ].join(" ")}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Conditional: times per week */}
            {freqType === "timesPerWeek" && (
                <div className="flex items-center gap-2">
                    <label className="text-sm">Times per week</label>
                    <input
                        type="number"
                        min={1}
                        max={7}
                        value={timesPerWeek}
                        onChange={(e) =>
                            setTimesPerWeek(
                                Math.min(7, Math.max(1, Number(e.target.value) || 1))
                            )
                        }
                        className="w-16 rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-center text-sm outline-none focus:border-blue-500 dark:border-gray-700"
                    />
                </div>
            )}

            {/* Actions */}
            <div className="mt-2 flex justify-end gap-2">
                <button
                    onClick={onDone}
                    className="rounded-lg px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={!canSave || addHabit.isPending || updateHabit.isPending}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
                >
                    {editing ? "Save changes" : "Add habit"}
                </button>
            </div>
        </div>
    );
}
