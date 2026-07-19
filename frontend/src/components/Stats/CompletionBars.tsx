"use client";

import { Flame } from "lucide-react";
import { HabitStat } from "@/lib/stats";

export function CompletionBars({ stats }: { stats: HabitStat[] }) {
  if (stats.length === 0)
    return <p className="text-sm text-gray-400">No habits to show.</p>;

  return (
    <div className="flex flex-col gap-3">
      {stats.map((s) => {
        const pct = Math.round(s.rate * 100);
        return (
          <div key={s.habit.id}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                {s.habit.icon && <span>{s.habit.icon}</span>}
                {s.habit.name}
              </span>
              <span className="flex items-center gap-3 text-xs text-gray-500">
                {s.currentStreak > 0 && (
                  <span className="flex items-center gap-0.5 text-orange-500">
                    <Flame size={12} />
                    {s.currentStreak}
                    {s.unit === "weeks" ? "wk" : "d"}
                  </span>
                )}
                <span>
                  {s.completed}/{s.scheduled} - {pct}%
                </span>
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
