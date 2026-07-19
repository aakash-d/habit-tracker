"use client";

import { fmt, getMonthRange, isSameMonth, isToday } from "@/lib/dateUtils";
import { useTrackerStore } from "@/store/useTrackerStore";
import { getDayProgress } from "@/lib/scheduling";
import { ProgressRing } from "./ProgressRing";
import { useHabits } from "@/hooks/useHabits";
import { useCompletions } from "@/hooks/useCompletions";
import { useOneOffs } from "@/hooks/useOneOffs";

export function DayCell({ day }: { day: Date }) {
    const currentMonth = useTrackerStore((s) => s.currentMonth);
    const weekStart = useTrackerStore((s) => s.settings.weekStart);
    const selectedDate = useTrackerStore((s) => s.selectedDate);
    const setSelectedDate = useTrackerStore((s) => s.setSelectedDate);

    const { data: habits = [] } = useHabits();
    const { from, to } = getMonthRange(currentMonth, weekStart);
    const { data: records = {} } = useCompletions(from, to);

    const { data: oneOffTasks = [] } = useOneOffs(from, to);

    const dateStr = fmt(day);
    const monthDate = new Date(`${currentMonth}-01T00:00:00`);
    const inMonth = isSameMonth(day, monthDate);
    const today = isToday(day);
    const selected = selectedDate === dateStr;

    const { done, total } = getDayProgress(habits, records, dateStr, oneOffTasks);

    // Dim ring for future days
    const todayStr = fmt(new Date());
    const isFuture = dateStr > todayStr;

    return (
        <button
            onClick={() => setSelectedDate(dateStr)}
            className={[
                "aspect-square rounded-lg border p-1.5 text-left text-sm transition flex flex-col",
                inMonth
                    ? "border-gray-200 dark:border-gray-800"
                    : "border-transparent text-gray-300 dark:text-gray-600",
                selected
                    ? "ring-2 ring-blue-500"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800",  
            ].join(" ")}
        >
            <span
                className={[
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                    today ? "bg-blue-600 font-semibold text-white" : "",
                ].join(" ")}
            >
                {day.getDate()}
            </span>

            {/* Progress ring - only for in-month days with scheduled habits */}
            {inMonth && total > 0 && (
                <span className="mt-auto flex justify-end"> {/* self-end */}
                    <ProgressRing done={done} total={total} dimmed={isFuture} />
                </span>
            )}
        </button>
    );
}