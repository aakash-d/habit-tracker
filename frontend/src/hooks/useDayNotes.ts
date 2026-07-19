"use client";

import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Backend returns { "2026=06=30": "Good day!" }
type DayNotesMap = Record<string, string>

const key = (from: string, to: string) => ["day-notes", from, to];

export function useDayNotes(from: string, to: string) {
    return useQuery({
        queryKey: key(from, to),
        queryFn: () => api.get<DayNotesMap>(`/day-notes?from=${from}&to=${to}`),
    });
}

export function useSetDayNote(from: string, to: string) {
    const qc = useQueryClient();
    const qk = key(from, to);

    return useMutation({
        mutationFn: (body: { date: string; note: string }) =>
            api.put<void>("/day-notes", body),

        onMutate: async (body) => {
            await qc.cancelQueries({ queryKey: qk });
            const previous = qc.getQueryData<DayNotesMap>(qk);

            qc.setQueryData<DayNotesMap>(qk, (old) => ({
                ...(old ?? {}),
                [body.date]: body.note,
            }));

            return { previous };
        },

        onError: (_e, _b, ctx) => {
            if(ctx?.previous) qc.setQueryData(qk, ctx.previous);
        },
        onSettled: () =>
            qc.invalidateQueries({ queryKey: qk }),
    });
}