"use client";

import { useState } from "react";
import Link from "next/link";
import { Settings2, BarChart3 } from "lucide-react";
import { SettingsMenu } from "@/components/Settings/SettingsMenu";
import { CalendarHeader } from "@/components/Calendar/CalendarHeader";
import { CalendarGrid } from "@/components/Calendar/CalendarGrid";
import { DayDetailPanel } from "@/components/DayDetail/DayDetailPanel";
import { Modal } from "@/components/ui/Modal";
import { HabitManager } from "@/components/Habits/HabitManager";

export default function Home() {
  const [managerOpen, setManagerOpen] = useState(false);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="mx-auto max-w-6xl p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Habit Tracker</h1>
          <div className="flex items-center gap-2">
            <Link
              href="/stats"
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <BarChart3 size={16} /> Insights
            </Link>
            <button
              onClick={() => setManagerOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <Settings2 size={16} /> Manage Habits
            </button>
            <SettingsMenu />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_320px]">
          {/* Calendar column */}
          <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <CalendarHeader />
            <CalendarGrid />
          </section>

          <aside className="rounded-xl border border-gray-200 bg-white p-4 dark:bg-gray-900">
            <DayDetailPanel />
          </aside>
        </div>
      </div>

      <Modal
        open={managerOpen}
        onClose={() => setManagerOpen(false)}
        title="Manage Habits"
      >
        <HabitManager onClose={() => setManagerOpen(false)} />
      </Modal>
    </main>
  );
}
