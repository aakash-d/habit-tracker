import {
    startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    eachDayOfInterval, format, addMonths, isSameMonth, isToday,
} from "date-fns";
import { WeekStart } from "./types";

export const fmt = (date: Date) => format(date, "yyyy-MM-dd");

/** Returns the full grid of days (including leadin/trailing days) for a month */
export function getCalendarDays(month: string, weekStart: WeekStart): Date[] {
    const base = new Date(`${month}-01T00:00:00`);
    const gridStart = startOfWeek(startOfMonth(base), { weekStartsOn: weekStart });
    const gridEnd = endOfWeek(endOfMonth(base), { weekStartsOn: weekStart });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

/** Weekday header labels, respecting week.start. */
export function getWeeldayLabels(weekStart: WeekStart): string[] {
    const base = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return weekStart === 1 ? [...base.slice(1), base[0]] : base;
}

export function getMonthRange(
    month: string,
    weekStart: WeekStart
): { from: string; to: string } {
    const days = getCalendarDays(month, weekStart);
    return {
        from: fmt(days[0]),
        to: fmt(days[days.length - 1]),
    };
}

export { addMonths, isSameMonth, isToday };