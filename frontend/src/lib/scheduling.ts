import { getDay } from "date-fns";
import { Habit, Frequency, RecordsByDate, OneOffTask } from "./types";

export function isScheduledOn(frequency: Frequency, date: string): boolean {
    const dow = getDay(new Date(`${date}T00:00:00`));

    switch (frequency.type) {
        case "daily":
            return true;
        case "weekdays":
            return dow >= 1 && dow <=5;
        case "specificDays":
            return frequency.days.includes(dow);
        case "timesPerWeek":
            return true;
    }
}

export function isFlexible(frequency: Frequency): boolean {
    return frequency.type === "timesPerWeek";
}

/** One-off tasks scheduled on a given date */
export function getOneOffsForDate(
    tasks: OneOffTask[],
    date: string
): OneOffTask[] {
    return tasks.filter((t) => t.date === date);
}

export function getHabitsForDate(habits: Habit[], date: string): Habit[] {
    return habits
        .filter(
            (h) => 
                !h.archived && 
                h.createdAt <= date &&
                isScheduledOn(h.frequency, date)
        )
        .sort((a, b) => a.order - b.order);
}

export function getDayProgress(
    habits: Habit[],
    records: RecordsByDate,
    date: string,
    oneOffs: OneOffTask[] = []
) : { done: number; total: number } {
    const scheduled = getHabitsForDate(habits, date);
    const completions = records[date]?.completions ?? {};
    const habitsDone = scheduled.filter((h) => completions[h.id]).length;

    const dayOneOffs = getOneOffsForDate(oneOffs, date);
    const oneOffsDone = dayOneOffs.filter((t) => t.done).length;

    return { 
        done: habitsDone + oneOffsDone,
        total: scheduled.length + dayOneOffs.length,
    };
}