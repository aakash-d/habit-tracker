"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { useTrackerStore } from "@/store/useTrackerStore";
import { getHabitsForDate, getOneOffsForDate } from "@/lib/scheduling";
import { TaskItem } from "./TaskItem";
import { OneOffItem } from "./OneOffItem";
import { DayNote } from "./DayNote";
import { useHabits } from "@/hooks/useHabits";
import { getMonthRange } from "@/lib/dateUtils";
import { useCompletions } from "@/hooks/useCompletions";
import { useAddOneOff, useOneOffs } from "@/hooks/useOneOffs";

export function DayDetailPanel() {
  const currentMonth = useTrackerStore((s) => s.currentMonth);
  const weekStart = useTrackerStore((s) => s.settings.weekStart);
  const { from, to } = getMonthRange(currentMonth, weekStart);

  const selectedDate = useTrackerStore((s) => s.selectedDate);
  const { data: habits = [], isLoading: habitsLoading, isError } = useHabits();
  const { data: records = {} } = useCompletions(from, to);
  const { data: oneOffTasks = [] } = useOneOffs(from, to);
  const addOneOff = useAddOneOff(from, to);

  const dayHabits = getHabitsForDate(habits, selectedDate);
  const dayOneOffs = getOneOffsForDate(oneOffTasks, selectedDate);

  const completions = records[selectedDate]?.completions ?? {};
  const habitsDone = dayHabits.filter((h) => completions[h.id]).length;
  const oneOffsDone = dayOneOffs.filter((t) => t.done).length;
  const doneCount = habitsDone + oneOffsDone;
  const total = dayHabits.length + dayOneOffs.length;

  const dateObj = new Date(`${selectedDate}T00:00:00`);

  const [newTask, setNewTask] = useState("");
  const submitOneOff = () => {
    if (newTask.trim()) {
      addOneOff.mutate({ name: newTask.trim(), date: selectedDate });
      setNewTask("");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">{format(dateObj, "EEEE")}</h2>
        <p className="text-sm test-gray-500 dark:text-gray-400">
          {format(dateObj, "MMMM d, yyyy")}
        </p>
      </div>
      {isError ? (
        <p className="text-sm text-red-500">
          Couldn&apos;t load data. Is the backend running?
        </p>
      ) : habitsLoading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : (
        <>
          {/* Progress summary */}
          <div className="flex items-center justify-between rounded-lg bg-gray-100 px-3 py-2 text-sm dark:bg-gray-800">
            <span className="text-gray-600 dark:text-gray-300">Progress</span>
            <span className="font-medium">
              {doneCount}/{total}
            </span>
          </div>

          {/* Task list */}
          {/* Habits */}
          <div className="flex flex-col gap-2">
            {dayHabits.length === 0 ? (
              <p className="text-sm text-gray-400">No habits for this day</p>
            ) : (
              dayHabits.map((habit) => (
                <TaskItem key={habit.id} habit={habit} date={selectedDate} />
              ))
            )}
          </div>

          {/* One-off tasks */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-500">
              One-off tasks
            </h3>
            <div className="flex flex-col gap-2">
              {dayOneOffs.map((task) => (
                <OneOffItem key={task.id} task={task} />
              ))}
            </div>

            {/* Quick add */}
            <div className="mt-2 flex items-center gap-2">
              <input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitOneOff()}
                placeholder="Add a one-off task"
                className="flex-1 rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700"
              />
              <button
                onClick={submitOneOff}
                className="flex items-center gap-1 rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium text-white"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>

          {/* Day note */}
          <DayNote date={selectedDate} />
        </>
      )}
    </div>
  );
}
