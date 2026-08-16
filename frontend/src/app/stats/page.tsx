"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTrackerStore } from "@/store/useTrackerStore";
import { getHabitStats, getHeatmapData, getMonthDelta, getMonthDetail, getMonthlyStats, getPerfectDayStreak, getSummary } from "@/lib/stats";
import { fmt } from "@/lib/dateUtils";
import { HabitHeatmap } from "@/components/Stats/HabitHeatMap";
import { CompletionBars } from "@/components/Stats/CompletionBars";
import { useHabits } from "@/hooks/useHabits";
import { useCompletions } from "@/hooks/useCompletions";
import { useState, useMemo } from "react";
import { MonthlyTrend } from "@/components/Stats/MonthlyTrend";
import { MonthDetail } from "@/components/Stats/MonthDetail";

export default function StatsPage() {
    const weekStart = useTrackerStore((s) => s.settings.weekStart);
    const { data: habits = [] } = useHabits();

    const today = useMemo(() => fmt(new Date()), []);

    // Range: earliest habit createdAt + today (fallback to ~12 weeks if no habits)
    const earliest = useMemo(() => {
        if(habits.length === 0) {
            return fmt(new Date(Date.now() - 84 * 24 * 60 * 60 * 1000));
        }
        return habits.reduce(
            (min, h) => (h.createdAt < min ? h.createdAt : min),
            habits[0].createdAt
        );
    }, [habits]);
    
    const { data: records = {} } = useCompletions(earliest, today);

    const stats = getHabitStats(habits, records, today, weekStart);
    const heatmap = getHeatmapData(habits, records, today, 84); // ~12 weeks
    const summary = getSummary(stats);

    const [selectedMonth, setSelectedMonth] = useState<string | undefined>(undefined);

    const monthly = useMemo(
        () => getMonthlyStats(habits, records, today),
        [habits, records, today]
    );

    const perfectStreak = useMemo(
        () => getPerfectDayStreak(habits, records, today),
        [habits, records, today]
    );
    
    // Default to most recent month without needing an effect
    const effectiveMonth = selectedMonth ?? monthly[monthly.length - 1]?.month;

    const monthDetail = useMemo(
        () =>
            effectiveMonth ? getMonthDetail(habits, records, effectiveMonth, today) : null,
        [habits, records, effectiveMonth, today]
    );

    const monthDelta = useMemo(
        () => (effectiveMonth ? getMonthDelta(monthly, effectiveMonth) : null),
        [monthly, effectiveMonth]
    );

    return (
        <main className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
            <div className="mx-auto max-w-4xl p-4 md:p-6">
                <div className="mb-4 flex items-center gap-3">
                    <Link
                        href="/"
                        className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                    >
                        <ArrowLeft size={16} /> Back
                    </Link>
                    <h1 className="text-2xl font-bold">Insights</h1>
                </div>

                {/* Summary cards */}
                <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                        <p className="text-sm text-gray-500">Active habits</p>
                        <p className="text-2xl font-bold">{summary.totalHabits}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                        <p className="text-sm text-gray-500">Avg completion</p>
                        <p className="text-2xl font-bold">
                            {Math.round(summary.avgRate * 100)}%
                        </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                        <p className="text-sm text-gray-500">Best current streak</p>
                        <p className="text-2xl font-bold">
                            {summary.bestStreak.value}
                            <span className="ml-1 text-base font-normal text-gray-400">
                                {summary.bestStreak.unit === "weeks" ? "wk" : "d"}
                            </span>
                        </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                        <p className="text-sm text-gray-500">Perfect-day streak</p>
                        <p className="text-2xl font-bold">
                            {perfectStreak.current}
                            <span className="ml-1 text-base font-normal text-gray-400">
                                / best {perfectStreak.longest}
                            </span>
                        </p>
                    </div>
                </div>

                {/* Heatmap */}
                <section className="mb-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                    <h2 className="mb-3 text-lg font-semibold">Activity (last 12 weeks)</h2>
                    <HabitHeatmap data={heatmap} />
                </section>

                <section className="mb-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                    <h2 className="mb-3 text-lg font-semibold">Monthly progress</h2>
                    <MonthlyTrend
                        stats={monthly}
                        selectedMonth={effectiveMonth}
                        onSelectMonth={setSelectedMonth}
                    />
                </section>

                <section className="mb-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                    <h2 className="mb-3 text-lg font-semibold">Month breakdown</h2>
                    <MonthDetail
                        detail={monthDetail}
                        delta={monthDelta}
                        months={monthly.map((m) => ({ month: m.month, label: m.label }))}
                        onSelectMonth={setSelectedMonth}
                    />
                </section>

                {/* Per-habit bars */}
                <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                    <h2 className="mb-3 text-lg font-semibold">Per-habit completion</h2>
                    <CompletionBars stats={stats} />
                </section>
            </div>
        </main>
    );
}