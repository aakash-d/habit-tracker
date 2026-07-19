"use client"

import { getCalendarDays, getWeeldayLabels } from "@/lib/dateUtils";
import { useTrackerStore } from "@/store/useTrackerStore";
import { DayCell } from "./DayCell";

export function CalendarGrid() {
    const currentMonth = useTrackerStore((s) => s.currentMonth);
    const weekStart = useTrackerStore((s) => s.settings.weekStart);

    const days = getCalendarDays(currentMonth, weekStart);
    const labels = getWeeldayLabels(weekStart);

    return(
        <div>
            {/* Weekday header */}
            <div className="grid grid-cols-7 gap-1">
                {labels.map((label) => (
                    <div
                        key={label}
                        className="py-2 text-center text-xs font-medium text-gray-400"
                    >
                        {label}
                    </div>
                ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((day) => (
                    <DayCell key={day.toISOString()} day={day} />
                ))}
            </div>
        </div>
    );
}