import { addDays, startOfWeek, format } from "date-fns";
import { Habit, RecordsByDate, WeekStart } from "./types";
import { isScheduledOn } from "./scheduling";

const fmt = (d: Date) => format(d, "yyyy-MM-dd");

interface StreakResult {
    current: number;
    longest: number;
    unit: "days" | "weeks";
}

function isDone(records: RecordsByDate, date: string, habitId: string): boolean {
    return records[date]?.completions[habitId] ?? false;
}

/** Day-based streaks (daily / weekdays / specificDays) */
function dayBasedStreak(
    habit: Habit,
    records: RecordsByDate,
    todayStr: string
): { current: number; longest: number } {
    // Build the list of scheduled dates from createdAt through today, ascending
    const scheduledDates: string[] = [];
    let cursor = new Date(`${habit.createdAt}T00:00:00`);
    const end = new Date(`${todayStr}T00:00:00`);

    while (cursor <= end) {
        const ds = fmt(cursor);
        if (isScheduledOn(habit.frequency, ds)) scheduledDates.push(ds);
        cursor = addDays(cursor, 1);
    }

    // longest streak: walk ascending, count consecutive completed scheduled days
    let longest = 0;
    let run = 0;
    for (const ds of scheduledDates) {
        if (isDone(records, ds, habit.id)) {
            run += 1;
            longest = Math.max(longest, run);
        } else {
            run = 0;
        }
    }

    // Current streak: walk descending from the end
    // If the most recent scheduled day (today) is incomplete, skip it (day not over)
    // and count from the previous scheduled day
    let current = 0;
    for (let i = scheduledDates.length - 1; i >= 0; i--) {
        const ds = scheduledDates[i];
        const done = isDone(records, ds, habit.id);
        if (i === scheduledDates.length - 1 && ds === todayStr && !done) {
            // today scheduled but not done yet - don't break, just skip it
            continue;
        }
        if (done) current += 1;
        else break;
    }
    return { current, longest };
}

/** Week-based streaks (timesPerWeek) */
function weekBasedStreak(
    habit: Habit,
    records: RecordsByDate,
    todayStr: string,
    weekStart: WeekStart
): { current: number; longest: number } {
    if (habit.frequency.type !== "timesPerWeek")
        return { current: 0, longest: 0 };
    const target = habit.frequency.count;

    // Count completions per week (keyed by that week's start date)
    const perWeek = new Map<string, number>();
    let cursor = new Date(`${habit.createdAt}T00:00:00`);
    const end = new Date(`${todayStr}T00:00:00`);

    while (cursor <= end) {
        const ds = fmt(cursor);
        if (isDone(records, ds, habit.id)) {
            const wk = fmt(startOfWeek(cursor, { weekStartsOn: weekStart }));
            perWeek.set(wk, (perWeek.get(wk) ?? 0) + 1);
        }
        cursor = addDays(cursor, 1);
    }

    // Build ordered list of week-starts from createdAt week -> current week
    const weeks: string[] = [];
    let wCursor = startOfWeek(new Date(`${habit.createdAt}T00:00:00`), {
        weekStartsOn: weekStart,
    });
    const currentWeekStart = startOfWeek(end, { weekStartsOn: weekStart });
    while (wCursor <= currentWeekStart) {
        weeks.push(fmt(wCursor));
        wCursor = addDays(wCursor, 7);
    }

    // longest run of weeks that hit target
    let longest = 0;
    let run = 0;
    for (const wk of weeks) {
        if ((perWeek.get(wk) ?? 0) >= target) {
            run += 1;
            longest = Math.max(longest, run);
        } else {
            run = 0;
        }
    }

    // Current run, from most recent week backward
    // The in-progress current week is not counted as a failure if under target
    let current = 0;
    const currentWk = fmt(currentWeekStart);
    for(let i = weeks.length - 1; i >= 0; i--) {
        const wk = weeks[i];
        const hit = (perWeek.get(wk) ?? 0) >= target;
        if (wk === currentWk && !hit) {
            // current week still in progress - skip, don't break
            continue;
        }
        if (hit) current += 1;
        else break;
    }

    return { current, longest };
}

export function getStreak(
    habit: Habit,
    records: RecordsByDate,
    todayStr: string,
    weekStart: WeekStart
): StreakResult {
    if (habit.frequency.type === "timesPerWeek") {
        const { current, longest } = weekBasedStreak(habit, records, todayStr, weekStart);
        return { current, longest, unit: "weeks" };
    }
    const { current, longest } = dayBasedStreak(habit, records, todayStr);
    return { current, longest, unit: "days" };
}