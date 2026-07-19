"use client";

import { useEffect, useState } from "react";
import { useDayNotes, useSetDayNote } from "@/hooks/useDayNotes";
import { getMonthRange } from "@/lib/dateUtils";
import { useTrackerStore } from "@/store/useTrackerStore";

export function DayNote({ date }: { date: string }) {
    const currentMonth = useTrackerStore((s) => s.currentMonth);
    const weekStart = useTrackerStore((s) => s.settings.weekStart);
    const { from, to } = getMonthRange(currentMonth, weekStart);

    const { data: notes = {} } = useDayNotes(from, to);
    const setDayNote = useSetDayNote(from, to);

    const serverNote = notes[date] ?? "";
    const [value, setValue] = useState(serverNote);

    // Keep local state in sync when switching days / server data loads
    useEffect(() => {
        setValue(serverNote);
    }, [serverNote, date]);

    const save = () => {
        if(value !== serverNote) {
            setDayNote.mutate({ date, note: value });
        }
    };

    return (
        <div>
            <label className="mb-1 block text-sm font-semibold text-gray-500">
                Day note
            </label>
            <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={save}
                placeholder="How did today go?"
                rows={3}
                className="2-full resize-none rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700"
            />
        </div>
    );
}