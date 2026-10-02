"use client";

import { format } from "date-fns";
import { TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { VolumeStat } from "@/lib/stats";

function fmtNum(n: number): string {
  // Avoid "2.00" — show decimals only when meaningful
  const rounded = Math.round(n * 100) / 100;
  return Number.isInteger(rounded)
    ? rounded.toLocaleString()
    : rounded.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function prettyDate(ds: string) {
  return format(new Date(`${ds}T00:00:00`), "MMM d");
}

export function VolumeStats({ stats }: { stats: VolumeStat[] }) {
  if (stats.length === 0)
    return (
      <p className="text-sm text-gray-400">
        No measurable habits yet. Add a target to a habit to track volume.
      </p>
    );

  return (
    <div className="flex flex-col gap-3">
      {stats.map((s) => {
        const isLimit = s.direction === "atMost";
        const onTrack = isLimit
          ? s.average <= s.target
          : s.average >= s.target;

        return (
          <div
            key={s.habit.id}
            className="rounded-lg border border-gray-200 p-3 dark:border-gray-800"
          >
            {/* Header */}
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
                {s.habit.icon && <span className="shrink-0">{s.habit.icon}</span>}
                <span className="truncate">{s.habit.name}</span>
              </span>
              <span className="shrink-0 text-xs text-gray-400">
                {isLimit ? "max" : "goal"} {fmtNum(s.target)} {s.unit}
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-md bg-gray-100 p-2 dark:bg-gray-800">
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-sm font-bold">
                  {fmtNum(s.total)}{" "}
                  <span className="text-xs font-normal text-gray-400">
                    {s.unit}
                  </span>
                </p>
              </div>

              <div className="rounded-md bg-gray-100 p-2 dark:bg-gray-800">
                <p className="text-xs text-gray-500">Avg / day</p>
                <p
                  className={[
                    "flex items-center gap-1 text-sm font-bold",
                    onTrack ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400",
                  ].join(" ")}
                >
                  {onTrack ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                  {fmtNum(s.average)}
                  <span className="text-xs font-normal text-gray-400">
                    {s.unit}
                  </span>
                </p>
              </div>

              <div className="rounded-md bg-gray-100 p-2 dark:bg-gray-800">
                <p className="text-xs text-gray-500">
                  {isLimit ? "Lowest day" : "Best day"}
                </p>
                {s.extremeDay ? (
                  <p className="text-sm font-bold">
                    {fmtNum(s.extremeDay.value)}
                    <span className="ml-1 text-xs font-normal text-gray-400">
                      {prettyDate(s.extremeDay.date)}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">—</p>
                )}
              </div>

              <div className="rounded-md bg-gray-100 p-2 dark:bg-gray-800">
                {isLimit ? (
                  <>
                    <p className="text-xs text-gray-500">Over limit</p>
                    <p
                      className={[
                        "flex items-center gap-1 text-sm font-bold",
                        s.daysOverLimit > 0 ? "text-red-600 dark:text-red-400" : "",
                      ].join(" ")}
                    >
                      {s.daysOverLimit > 0 && <AlertTriangle size={13} />}
                      {s.daysOverLimit}
                      <span className="text-xs font-normal text-gray-400">
                        {s.daysOverLimit === 1 ? "day" : "days"}
                      </span>
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-gray-500">Days logged</p>
                    <p className="text-sm font-bold">
                      {s.daysLogged}
                      <span className="text-xs font-normal text-gray-400">
                        /{s.scheduledDays}
                      </span>
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Logged-coverage caveat */}
            {s.daysLogged < s.scheduledDays && (
              <p className="mt-2 text-xs text-gray-400">
                Averaged over {s.scheduledDays} scheduled{" "}
                {s.scheduledDays === 1 ? "day" : "days"} · logged on{" "}
                {s.daysLogged}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}