"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Flame, ArrowRight } from "lucide-react";
import { useTrackerStore } from "@/store/useTrackerStore";
import { useHabits } from "@/hooks/useHabits";
import { useCompletions } from "@/hooks/useCompletions";
import { getMonthRange, fmt } from "@/lib/dateUtils";
import { getMonthDetail } from "@/lib/stats";

export function MonthSummaryCard() {
  const currentMonth = useTrackerStore((s) => s.currentMonth);
  const weekStart = useTrackerStore((s) => s.settings.weekStart);

  const { from, to } = getMonthRange(currentMonth, weekStart);
  const { data: habits = [] } = useHabits();
  const { data: records = {} } = useCompletions(from, to);

  const today = useMemo(() => fmt(new Date()), []);

  const detail = useMemo(
    () => getMonthDetail(habits, records, currentMonth, today),
    [habits, records, currentMonth, today]
  );

  if (!detail) {
    return (
      <div className="mt-3 rounded-lg border border-dashed border-gray-200 p-3 text-center text-xs text-gray-400 dark:border-gray-800">
        No progress data for this month yet.
      </div>
    );
  }

  const pct = Math.round(detail.rate * 100);
  const barColor =
    pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-blue-500" : "bg-orange-500";

  return (
    <div className="mt-3 rounded-lg border border-gray-200 p-3 dark:border-gray-800">
      {/* Top row: label + link */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          This month
          {detail.isPartial && (
            <span className="ml-1 normal-case tracking-normal">(so far)</span>
          )}
        </span>
        <Link
          href="/stats"
          className="flex items-center gap-0.5 text-xs text-blue-500 hover:underline"
        >
          Details <ArrowRight size={12} />
        </Link>
      </div>

      {/* Progress bar */}
      <div className="mb-2 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-sm font-bold">{pct}%</span>
      </div>

      {/* Stat row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
        <span>
          <span className="font-medium text-gray-700 dark:text-gray-200">
            {detail.completed}/{detail.scheduled}
          </span>{" "}
          tasks
        </span>
        <span>
          <span className="font-medium text-gray-700 dark:text-gray-200">
            {detail.perfectDays}
          </span>{" "}
          perfect {detail.perfectDays === 1 ? "day" : "days"}
        </span>
        {detail.longestPerfectStreak > 0 && (
          <span className="flex items-center gap-0.5 text-orange-500">
            <Flame size={12} />
            <span className="font-medium">{detail.longestPerfectStreak}</span>
            <span className="text-gray-500 dark:text-gray-400">best streak</span>
          </span>
        )}
      </div>
    </div>
  );
}