import { addDays, format } from "date-fns";
import { Habit, RecordsByDate, WeekStart } from "./types";
import { isScheduledOn, getHabitsForDate } from "./scheduling";
import { getStreak } from "./streaks";

const fmt = (d: Date) => format(d, "yyyy-MM-dd");

export interface HabitStat {
  habit: Habit;
  scheduled: number;
  completed: number;
  rate: number; // 0..1
  currentStreak: number;
  longestStreak: number;
  unit: "days" | "weeks";
}

/** Per-habit completion rate over [createdAt, today] */
export function getHabitStats(
  habits: Habit[],
  records: RecordsByDate,
  todayStr: string,
  weekStart: WeekStart,
): HabitStat[] {
  const active = habits
    .filter((h) => !h.archived)
    .sort((a, b) => a.order - b.order);

  return active.map((habit) => {
    let scheduled = 0;
    let completed = 0;

    let cursor = new Date(`${habit.createdAt}T00:00:00`);
    const end = new Date(`${todayStr}T00:00:00`);
    while (cursor <= end) {
      const ds = fmt(cursor);
      if (isScheduledOn(habit.frequency, ds)) {
        scheduled += 1;
        if (records[ds]?.completions[habit.id]) completed += 1;
      }
      cursor = addDays(cursor, 1);
    }
    const streak = getStreak(habit, records, todayStr, weekStart);
    return {
      habit,
      scheduled,
      completed,
      rate: scheduled === 0 ? 0 : completed / scheduled,
      currentStreak: streak.current,
      longestStreak: streak.longest,
      unit: streak.unit,
    };
  });
}

/** Overall daily completion ratio for the heatmap, last N days. */
export function getHeatmapData(
  habits: Habit[],
  records: RecordsByDate,
  todayStr: string,
  days: number,
): { date: string; rate: number; done: number; total: number }[] {
  const result: { date: string; rate: number; done: number; total: number }[] =
    [];
  const end = new Date(`${todayStr}T00:00:00`);
  const start = addDays(end, -(days - 1));

  let cursor = start;
  while (cursor <= end) {
    const ds = fmt(cursor);
    const scheduled = getHabitsForDate(habits, ds);
    const completions = records[ds]?.completions ?? {};
    const done = scheduled.filter((h) => completions[h.id]).length;
    const total = scheduled.length;

    result.push({
      date: ds,
      done,
      total,
      rate: total === 0 ? 0 : done / total,
    });
    cursor = addDays(cursor, 1);
  }
  return result;
}

/** Summary metrics. */
export function getSummary(stats: HabitStat[]) {
  const totalHabits = stats.length;
  const avgRate =
    totalHabits === 0 ? 0 : stats.reduce((s, x) => s + x.rate, 0) / totalHabits;
  const bestStreak = stats.reduce(
    (best, x) =>
      x.currentStreak > best.value
        ? { value: x.currentStreak, unit: x.unit }
        : best,

    { value: 0, unit: "days" as "days" | "weeks" },
  );
  return { totalHabits, avgRate, bestStreak };
}
