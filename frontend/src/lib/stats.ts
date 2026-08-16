import { addDays, addMonths, eachDayOfInterval, endOfMonth, format, startOfMonth } from "date-fns";
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

export interface MonthStat {
  month: string;                // "2026-08"
  label: string;                // "Aug 2026"
  scheduled: number;
  completed: number;
  rate: number;                 // 0..1
  perfectDays: number;
  longestPerfectStreak: number; // wihin this month
  isPartial: boolean;           // true for the current month
}

export interface MonthHabitStat {
  habit: Habit;
  scheduled: number;
  completed: number;
  rate: number;
}

export interface DaySummary {
  date: string;
  done: number;
  total: number;
  rate: number;
}

export interface MonthDetail {
  month: string;
  label: string;
  isPartial: boolean;
  scheduled: number;
  completed: number;
  rate: number;
  daysTracked: number;          // days with ≥1 scheduled habit
  perfectDays: number;
  longestPerfectStreak: number;
  habitStats: MonthHabitStat[];
  bestDay: DaySummary | null;
  worstDay: DaySummary | null;
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

/** Per-month completion stats, from the earliest habit through today */
export function getMonthlyStats(
  habits: Habit[],
  records: RecordsByDate,
  todayStr: string
): MonthStat[] {
  const active = habits.filter((h) => !h.archived);
  if (active.length === 0) return [];

  const earliest = active.reduce(
    (min, h) => (h.createdAt < min ? h.createdAt : min),
    active[0].createdAt
  );

  const today = new Date(`${todayStr}T00:00:00`);
  const currentMonthKey = format(today, "yyyy-MM");
  const lastMonthStart = startOfMonth(today);

  let cursor = startOfMonth(new Date(`${earliest}T00:00:00`));
  const result: MonthStat[] = [];

  while (cursor <= lastMonthStart) {
    const monthKey = format(cursor, "yyyy-MM");
    const isPartial = monthKey === currentMonthKey;
    const rangeEnd = isPartial ? today : endOfMonth(cursor);

    const days = eachDayOfInterval({ start: startOfMonth(cursor), end: rangeEnd });

    let scheduled = 0;
    let completed = 0;
    let perfectDays = 0;
    let longestPerfectStreak = 0;
    let run = 0;

    for (const day of days) {
      const ds = fmt(day);
      const dayHabits = getHabitsForDate(active, ds);
      if(dayHabits.length === 0) continue;

      const completions = records[ds]?.completions ?? {};
      const done = dayHabits.filter((h) => completions[h.id]).length;

      scheduled += dayHabits.length;
      completed += done;

      if (done == dayHabits.length) {
        perfectDays += 1;
        run += 1;
        longestPerfectStreak = Math.max(longestPerfectStreak, run);
      } else {
        run = 0;
      }
    }

    if (scheduled > 0) {
      result.push({
        month: monthKey,
        label: format(cursor, "MMM yyyy"),
        scheduled,
        completed,
        rate: completed / scheduled,
        perfectDays,
        longestPerfectStreak,
        isPartial,
      });
    }

    cursor = addMonths(cursor, 1);
  }

  return result;
}

/** All-time perfect-day streak (current + longest), ignoring month boundaries */
export function getPerfectDayStreak(
  habits: Habit[],
  records: RecordsByDate,
  todayStr: string
): { current: number; longest: number } {
  const active = habits.filter((h) => !h.archived);
  if (active.length === 0) return { current: 0, longest: 0 };

  const earliest = active.reduce(
    (min, h) => (h.createdAt < min ? h.createdAt : min),
    active[0].createdAt
  );

  const today = new Date(`${todayStr}T00:00:00`);
  const days : { date: string; perfect: boolean }[] = [];

  let cursor = new Date(`${earliest}T00:00:00`);
  while (cursor <= today) {
    const ds = fmt(cursor);
    const dayHabits = getHabitsForDate(active, ds);
    if (dayHabits.length > 0) {
      const completions = records[ds]?.completions ?? {};
      const done = dayHabits.filter((h) => completions[h.id]).length;
      days.push({ date: ds, perfect: done === dayHabits.length });
    }
    cursor = addDays(cursor, 1);
  }

  let longest = 0;
  let run = 0;
  for (const d of days) {
    if (d.perfect) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  }

  // Current streak: walk backwards; today incomplete doesn't break it (day isn't over)
  let current = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    const d = days[i];
    if (i === days.length - 1 && d.date === todayStr && !d.perfect) continue;
    if (d.perfect) current += 1;
    else break;
  }

  return { current, longest };
}

/** Detailed breakdown for a single month ("YYYY-MM"). */
export function getMonthDetail(
  habits: Habit[],
  records: RecordsByDate,
  month: string,
  todayStr: string
): MonthDetail | null {
  const active = habits.filter((h) => !h.archived);
  const today = new Date(`${todayStr}T00:00:00`);
  const monthStart = startOfMonth(new Date(`${month}-01T00:00:00`));
  const isPartial = format(monthStart, "yyyy-MM") === format(today, "yyyy-MM");
  const rangeEnd = isPartial ? today : endOfMonth(monthStart);

  if (monthStart > today) return null;

  const days = eachDayOfInterval({ start: monthStart, end: rangeEnd });

  const perHabit = new Map<string, { scheduled: number; completed: number }>();
  const daySummaries: DaySummary[] = [];

  let scheduled = 0;
  let completed = 0;
  let perfectDays = 0;
  let longestPerfectStreak = 0;
  let run = 0;

  for (const day of days) {
    const ds = fmt(day);
    const dayHabits = getHabitsForDate(active, ds);
    if (dayHabits.length === 0) continue;

    const completions = records[ds]?.completions ?? {};
    let dayDone = 0;

    for (const h of dayHabits) {
      const entry = perHabit.get(h.id) ?? { scheduled: 0, completed: 0 };
      entry.scheduled += 1;
      if (completions[h.id]) {
        entry.completed += 1;
        dayDone += 1;
      }
      perHabit.set(h.id, entry);
    }

    scheduled += dayHabits.length;
    completed += dayDone;

    daySummaries.push({
      date: ds,
      done: dayDone,
      total: dayHabits.length,
      rate: dayDone / dayHabits.length,
    });

    if (dayDone === dayHabits.length) {
      perfectDays += 1;
      run += 1;
      longestPerfectStreak = Math.max(longestPerfectStreak, run);
    } else {
      run = 0;
    }
  }

  if (scheduled === 0) return null;

  const habitStats: MonthHabitStat[] = active
    .filter((h) => perHabit.has(h.id))
    .map((h) => {
      const e = perHabit.get(h.id)!;
      return {
        habit: h,
        scheduled: e.scheduled,
        completed: e.completed,
        rate: e.scheduled === 0 ? 0 : e.completed / e.scheduled,
      };
    })
    .sort((a, b) => b.rate - a.rate); // best-performing first

  const sortedDays = [...daySummaries].sort((a, b) => b.rate - a.rate);

  return {
    month,
    label: format(monthStart, "MMMM yyyy"),
    isPartial,
    scheduled,
    completed,
    rate: completed / scheduled,
    daysTracked: daySummaries.length,
    perfectDays,
    longestPerfectStreak,
    habitStats,
    bestDay: sortedDays[0] ?? null,
    worstDay: sortedDays[sortedDays.length - 1] ?? null,
  };
}

/** Change in completion rate vs. the previous month, in percentage points. */
export function getMonthDelta(
  monthly: MonthStat[],
  month: string
): number | null {
  const idx = monthly.findIndex((m) => m.month === month);
  if (idx <= 0) return null;
  return (monthly[idx].rate - monthly[idx - 1].rate) * 100;
}