"use client";

import { Flame } from "lucide-react";
import { MonthStat } from "@/lib/stats";

export function MonthlyTrend({
    stats,
    selectedMonth,
    onSelectMonth,
}: {
    stats: MonthStat[];
    selectedMonth?: string;
    onSelectMonth?: (month: string) => void;
}) {
    if (stats.length === 0)
        return<p className="text-sm text-gray-400">No monthly data yet.</p>

    const best = Math.max(...stats.map((s) => s.rate));

    return (
        <div className="flex flex-col gap-2">
            {stats.map((s) => {
                const pct = Math.round(s.rate * 100);
                const isSelected = selectedMonth === s.month;
                const isBest = s.rate === best && stats.length > 1;

                return (
                    <button
                        key={s.month}
                        onClick={() => onSelectMonth?.(s.month)}
                        className={[
                            "rounded-lg border p-2.5 text-left transition",
                            isSelected
                                ? "border-blue-500 ring-1 ring-blue-500"
                                : "border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800",
                        ].join(" ")}
                    >
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 font-medium">
                                {s.label}
                                {s.isPartial && (
                                    <span className="text-xs font-normal text-gray-400">
                                        (so far)
                                    </span>
                                )}
                                {isBest && <span title="Best Month">⭐</span>}
                            </span>
                            <span className="flex items-center gap-3 text-xs text-gray-500">
                                {s.longestPerfectStreak > 0 && (
                                    <span
                                        className="flex items-center gap-0.5 text-orange-500"
                                        title="Longest perfect-day streak this month"
                                    >
                                        <Flame size={12} />
                                        {s.longestPerfectStreak}
                                    </span>
                                )}
                                <span title="Perfect days">✓ {s.perfectDays}</span>
                                <span>
                                    {s.completed}/{s.scheduled} · {pct}%
                                </span>
                            </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                            <div
                                className={[
                                    "h-full rounded-full transition-all",
                                    pct >= 80
                                      ? "bg-green-500"
                                      : pct >= 50
                                      ? "bg-blue-500"
                                      : "bg-orange-500"  
                                ].join(" ")}
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                    </button>
                );
            })}
        </div>
    );
}