"use client";

import { format } from "date-fns";
import { Flame, TrendingUp, TrendingDown } from "lucide-react";
import { MonthDetail as MonthDetailData } from "@/lib/stats";

function prettyDate(ds: string) {
  return format(new Date(`${ds}T00:00:00`), "EEE, MMM d");
}

export function MonthDetail({
  detail,
  delta,
  months,
  onSelectMonth,
}: {
  detail: MonthDetailData | null;
  delta: number | null;
  months: { month: string; label: string }[];
  onSelectMonth: (month: string) => void;
}) {
  if (!detail)
    return <p className="text-sm text-gray-400">No data for this month.</p>;

  const pct = Math.round(detail.rate * 100);

  return (
    <div className="flex flex-col gap-4">
      {/* Header + month picker */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold">
            {detail.label}
            {detail.isPartial && (
              <span className="ml-1.5 text-xs font-normal text-gray-400">
                (so far)
              </span>
            )}
          </h3>
          {delta !== null && (
            <span
              className={[
                "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
                delta >= 0
                  ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
              ].join(" ")}
              title="Change vs. previous month"
            >
              {delta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {delta >= 0 ? "+" : ""}
              {Math.round(delta)} pts
            </span>
          )}
        </div>

        <select
          value={detail.month}
          onChange={(e) => onSelectMonth(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        >
          {months.map((m) => (
            <option
              key={m.month}
              value={m.month}
              className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
            >
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* Metric tiles */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-lg bg-gray-100 p-2.5 dark:bg-gray-800">
          <p className="text-xs text-gray-500">Completion</p>
          <p className="text-lg font-bold">{pct}%</p>
        </div>
        <div className="rounded-lg bg-gray-100 p-2.5 dark:bg-gray-800">
          <p className="text-xs text-gray-500">Tasks done</p>
          <p className="text-lg font-bold">
            {detail.completed}
            <span className="text-sm font-normal text-gray-400">
              /{detail.scheduled}
            </span>
          </p>
        </div>
        <div className="rounded-lg bg-gray-100 p-2.5 dark:bg-gray-800">
          <p className="text-xs text-gray-500">Perfect days</p>
          <p className="text-lg font-bold">
            {detail.perfectDays}
            <span className="text-sm font-normal text-gray-400">
              /{detail.daysTracked}
            </span>
          </p>
        </div>
        <div className="rounded-lg bg-gray-100 p-2.5 dark:bg-gray-800">
          <p className="text-xs text-gray-500">Best perfect streak</p>
          <p className="flex items-center gap-1 text-lg font-bold">
            {detail.longestPerfectStreak > 0 && (
              <Flame size={15} className="text-orange-500" />
            )}
            {detail.longestPerfectStreak}
          </p>
        </div>
      </div>

      {/* Best / worst day */}
      {detail.bestDay && detail.worstDay && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-2.5 dark:border-gray-800">
            <p className="text-xs text-gray-500">Best day</p>
            <p className="text-sm font-medium">
              {prettyDate(detail.bestDay.date)}{" "}
              <span className="text-gray-400">
                — {detail.bestDay.done}/{detail.bestDay.total}
              </span>
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-2.5 dark:border-gray-800">
            <p className="text-xs text-gray-500">Toughest day</p>
            <p className="text-sm font-medium">
              {prettyDate(detail.worstDay.date)}{" "}
              <span className="text-gray-400">
                — {detail.worstDay.done}/{detail.worstDay.total}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Per-habit bars for this month */}
      <div>
        <h4 className="mb-2 text-sm font-semibold text-gray-500">
          Habits this month
        </h4>
        <div className="flex flex-col gap-3">
          {detail.habitStats.map((s) => {
            const hp = Math.round(s.rate * 100);
            return (
              <div key={s.habit.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    {s.habit.icon && <span>{s.habit.icon}</span>}
                    {s.habit.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {s.completed}/{s.scheduled} · {hp}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={[
                      "h-full rounded-full transition-all",
                      hp >= 80
                        ? "bg-green-500"
                        : hp >= 50
                        ? "bg-blue-500"
                        : "bg-orange-500",
                    ].join(" ")}
                    style={{ width: `${hp}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}