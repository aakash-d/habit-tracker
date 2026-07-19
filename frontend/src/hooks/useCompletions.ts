"use client";

import { api } from "@/lib/api";
import { RecordsByDate } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const key = (from: string, to: string) => ["completions", from, to];

export function useCompletions(from: string, to: string) {
    return useQuery({
        queryKey: key(from, to),
        queryFn: () =>
            api.get<RecordsByDate>(`/completions?from=${from}&to=${to}`),
    });
}

interface SetCompletionBody {
    habitId: string;
    date: string;
    done: boolean;
    note?: string;
}

export function useSetCompletion(from: string, to: string) {
    const qc = useQueryClient();
    const qk = key(from, to);

    return useMutation({
        mutationFn: (body: SetCompletionBody) =>
            api.put<void>("/completions", {
                habitId: Number(body.habitId),
                date: body.date,
                done: body.done,
                note: body.note,
            }),
        
        // OPTIMISTIC UPDATE
        onMutate: async (body) => {
            await qc.cancelQueries({ queryKey: qk });
            const previous = qc.getQueryData<RecordsByDate>(qk);

            qc.setQueryData<RecordsByDate>(qk, (old) => {
                const next: RecordsByDate = { ...(old ?? {}) };
                const day = next[body.date] ?? { completions : {}, taskNotes: {} };
                next[body.date] = {
                    ...day,
                    completions: { ...day.completions, [body.habitId]: body.done },
                };
                return next;
            });

            return { previous };
        },

        // Roll back on error
        onError: (_err, _body, context) => {
            if(context?.previous) qc.setQueryData(qk, context.previous);
        },

        // Re-sync with server after settle
        onSettled: () => {
            qc.invalidateQueries({ queryKey: ["completions"] });
            qc.invalidateQueries({ queryKey: ["streak"] });
        },
    });
}

export function useSetTaskNote(from: string, to: string) {
    const qc = useQueryClient();
    const qk = key(from, to);

    return useMutation({
        mutationFn: (body: { habitId: string; date: string; done: boolean; note: string; }) =>
            api.put<void>("/completions", {
                habitId: Number(body.habitId),
                date: body.date,
                done: body.done,
                note: body.note,
            }),
        
        onMutate: async (body) => {
            await qc.cancelQueries({ queryKey: qk });
            const previous = qc.getQueryData<RecordsByDate>(qk);

            qc.setQueryData<RecordsByDate>(qk, (old) => {
                const next: RecordsByDate = { ...(old ?? {}) };
                const day = next[body.date] ?? { completions : {}, taskNotes: {} };
                next[body.date] = {
                    ...day,
                    taskNotes: { ...(day.taskNotes ?? {}), [body.habitId]: body.note },
                };
                return next;
            });

            return { previous };
        },

        // Roll back on error
        onError: (_err, _body, context) => {
            if(context?.previous) qc.setQueryData(qk, context.previous);
        },

        // Re-sync with server after settle
        onSettled: () => 
            qc.invalidateQueries({ queryKey: ["completions"] }),
    });
}