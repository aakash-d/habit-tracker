"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { addMonths } from "@/lib/dateUtils";
import { useTrackerStore } from "@/store/useTrackerStore";

export function CalendarHeader() {
    const currentMonth = useTrackerStore((s) => s.currentMonth);
    const setCurrentMonth = useTrackerStore((s) => s.setCurrentMonth);
    const setSelectedDate = useTrackerStore((s) => s.setSelectedDate);

    const monthDate = new Date(`${currentMonth}-01T00:00:00`);
    const label = format(monthDate, "MMMM yyyy");

    const shift = (delta: number) =>
        setCurrentMonth(format(addMonths(monthDate, delta), "yyyy-MM"));

    const goToday = () => {
        const now = new Date();
        setCurrentMonth(format(now, "yyyy-MM"));
        setSelectedDate(format(now, "yyyy-MM-dd"));
    };

    return (
        <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{label}</h2>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => shift(-1)}
                    className="rounded-lg p-2 hover:gb-gray-100 dark:hover:bg-gray-800"
                    aria-label="Previous month"
                >
                    <ChevronLeft size={18} />
                </button>
                <button
                    onClick={goToday}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    Today
                </button>
                <button
                    onClick={() => shift(1)}
                    className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                    aria-label="Next month"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}