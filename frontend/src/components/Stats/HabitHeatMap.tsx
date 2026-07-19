"use client";

import { format, getDay } from "date-fns";

interface Cell {
  date: string;
  rate: number;
  done: number;
  total: number;
}

function intensityClass(rate: number, total: number): string {
  if (total === 0) return "bg-gray-100 dark:bg-gray-800";
  if (rate === 0) return "bg-gray-200 dark:bg-gray-700";
  if (rate < 0.34) return "bg-green-200 dark:bg-green-900";
  if (rate < 0.67) return "bg-green-400 dark:bg-green-700";
  if (rate < 1) return "bg-green-500 dark:bg-green-600";
  return "bg-green-600 dark:bg-green-500";
}

export function HabitHeatmap({ data }: { data: Cell[] }) {
  if (data.length === 0) return null;

  // Pad the start so the first column aligns to the correct weekday row (Sun top).
  const firstDay = getDay(new Date(`${data[0].date}T00:00:00`));
  const padded: (Cell | null)[] = [...Array(firstDay).fill(null), ...data];

  // Chunk into weeks (columns of 7).
  const weeks: (Cell | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {Array.from({ length: 7 }).map((_, di) => {
              const cell = week[di];
              if (!cell) return <div key={di} className="h-3.5 w-3.5" />;
              return (
                <div
                  key={di}
                  className={`h-3.5 w-3.5 rounded-sm ${intensityClass(
                    cell.rate,
                    cell.total,
                  )}`}
                  title={`${format(new Date(`${cell.date}T00:00:00`), "MMM d")}: ${
                    cell.done
                  }/${cell.total}`}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
        <span>Less</span>
        <div className="h-3 w-3 rounded-sm bg-gray-200 dark:bg-gray-700" />
        <div className="h-3 w-3 rounded-am bg-green-200 dark:bg-green-900" />
        <div className="h-3 w-3 rounded-am bg-green-400 dark:bg-green-700" />
        <div className="h-3 w-3 rounded-am bg-green-500 dark:bg-green-600" />
        <div className="h-3 w-3 rounded-am bg-green-600 dark:bg-green-500" />
        <span>More</span>
      </div>
    </div>
  );
}
