"use client";

import { Check, Trash2 } from "lucide-react";
import { OneOffTask } from "@/lib/types";
import { useTrackerStore } from "@/store/useTrackerStore";
import { getMonthRange } from "@/lib/dateUtils";
import { useDeleteOneOff, useToggleOneOff } from "@/hooks/useOneOffs";
import { useCategories } from "@/hooks/useCategories";

export function OneOffItem({ task }: { task: OneOffTask }) {
    const currentMonth = useTrackerStore((s) => s.currentMonth);
    const weekStart = useTrackerStore((s) => s.settings.weekStart);
    const { from, to } = getMonthRange(currentMonth, weekStart);

    const toggleOneOff = useToggleOneOff(from, to);
    const deleteOneOff = useDeleteOneOff(from, to);
    const { data: categories = [] } = useCategories();

    const category = categories.find((c) => c.id === task.categoryId);

    return (
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-800">
            <button
                onClick={() => toggleOneOff.mutate(task.id)}
                className="flex flex-1 items-center gap-3 text-left"
            >
                <span
                    className={[
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition",
                        task.done
                            ? "border-purple-600 bg-purple-600 text-white"
                            : "border-gray-300 dark:border-gray-600",
                    ].join(" ")}
                >
                    {task.done && <Check size={14} strokeWidth={3} />}
                </span>
                <span
                    className={[
                        "text-sm",
                        task.done ? "text-gray-400 line-through" : "",
                    ].join(" ")}
                >
                    {task.name}
                </span>
            </button>

            {category && (
                <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: category.color }}
                    title={category.name}
                />
            )}

            <button
                onClick={() => deleteOneOff.mutate(task.id)}
                className="rounded p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                aria-label="Delete task"
            >
                <Trash2 size={15} />
            </button>
        </div>
    );
}

