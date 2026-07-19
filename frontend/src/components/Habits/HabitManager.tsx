"use client";

import { useState } from "react";
import { Pencil, Trash2, ArrowUp, ArrowDown, Plus } from "lucide-react";
import { Habit } from "@/lib/types";
import { HabitForm } from "./HabitForm";
import { useAddCategory, useCategories, useDeleteCategory } from "@/hooks/useCategories";
import { useArchiveHabit, useHabits, useReorderHabit } from "@/hooks/useHabits";

export function HabitManager({ onClose }: { onClose: () => void }) {
    const { data: habits = [] } = useHabits();
    const { data: categories = [] } = useCategories();
    const archiveHabit = useArchiveHabit();
    const reorderHabit = useReorderHabit();
    const addCategory = useAddCategory();
    const deleteCategory = useDeleteCategory();

    const [mode, setMode] = useState<"list" | "add" | { edit: Habit }>("list");
    const [newCatName, setNewCatName] = useState("");
    const [newCatColor, setNewCatColor] = useState("#3b82f6");

    const activeHabits = habits
        .filter((h) => !h.archived)
        .sort((a, b) => a.order - b.order);

    if (mode === "add") {
        return <HabitForm onDone={() => setMode("list")} />
    }
    if (typeof mode === "object") {
        return <HabitForm editing={mode.edit} onDone={() => setMode("list")} />
    }

    return (
        <div className="flex flex-col gap-5">
            {/* Habits list */}
            <div>
                <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-500">Habits</h4>
                    <button
                        onClick={() => setMode("add")}
                        className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white"
                    >
                        <Plus size={15} /> Add
                    </button>
                </div>

                <div className="flex flex-col gap-1.5">
                    {activeHabits.length === 0 && (
                        <p className="text-sm text-gray-400">No habits yet</p>
                    )}
                    {activeHabits.map((h, i) => {
                        const cat = categories.find((c) => c.id === h.categoryId);
                        return (
                            <div
                                key={h.id}
                                className="flex items-center gap-2 rounded-lg border border-gray-200 p-2.5 dark:border-gray-800"
                            >
                                {h.icon && <span>{h.icon}</span>}
                                <span className="flex-1 text-sm">{h.name}</span>
                                {cat && (
                                    <span
                                        className="h-2.5 w-2.5 rounded-full"
                                        style={{ backgroundColor: cat.color }}
                                        title={cat.name}
                                    />
                                )}
                                <button
                                    onClick={() => reorderHabit.mutate({ id: h.id, direction: "up" })}
                                    disabled={i === 0}
                                    className="rounded p-1 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-gray-800"
                                    aria-label="Move up"
                                >
                                    <ArrowUp size={15} />
                                </button>
                                <button
                                    onClick={() => reorderHabit.mutate({ id: h.id, direction: "down" })}
                                    disabled={i === activeHabits.length - 1}
                                    className="rounded p-1 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-gray-800"
                                    aria-label="Move down"
                                >
                                    <ArrowDown size={15} />
                                </button>
                                <button
                                    onClick={() => setMode({ edit: h })}
                                    className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    aria-label="Edit"
                                >
                                    <Pencil size={15} />
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm(`Archive "${h.name}"? History is kept`)) {
                                            archiveHabit.mutate(h.id);
                                        }
                                    }}
                                    className="rounded p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                                    aria-label="Archive"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Categories */}
            <div>
                <h4 className="mb-2 text-sm font-semibold text-gray-500">Categories</h4>
                <div className="mb-3 flex flex-col gap-1.5">
                    {categories.map((c) => (
                        <div
                            key={c.id}
                            className="flex items-center gap-2 rounded-lg border border-gray-200 p-2 dark:border-gray-800"
                        >
                            <span
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: c.color }}
                            />
                            <span className="flex-1 text-sm">{c.name}</span>
                            <button
                                onClick={() => {
                                    if (confirm(`Delete category "${c.name}"?`)) {
                                        deleteCategory.mutate(c.id);
                                    }
                                }}
                                className="rounded p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                                aria-label="Delete category"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Add category */}
                <div className="flex items-center gap-2">
                    <input
                        type="color"
                        value={newCatColor}
                        onChange={(e) => setNewCatColor(e.target.value)}
                        className="h-9 w-9 cursor-pointer rounded border border-gray-300 dark:border-gray-700"
                    />
                    <input
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="New category"
                        className="flex-1 rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700"
                    />
                    <button
                        onClick={() => {
                            if (newCatName.trim()) {
                                addCategory.mutate({ name: newCatName.trim(), color: newCatColor });
                                setNewCatName("");
                            }
                        }}
                        className="rounded-lg bg-gray-800 px-3 py-2 text-sm font-medium text-white dark:bg-gray-700"
                    >
                        Add
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end">
                <button
                    onClick={onClose}
                    className="rounded-lg px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    Done
                </button>
            </div>
        </div>
    );
}