"use client";

import { api } from "@/lib/api";
import { OneOffTask } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const key = (from: string, to: string) => ["one-offs", from, to];

export function useOneOffs(from: string, to: string) {
    return useQuery({
        queryKey: key(from, to),
        queryFn: () => api.get<OneOffTask[]>(`/one-offs?from=${from}&to=${to}`),
    });
}

export function useAddOneOff(from: string, to: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: { name: string; date: string; categoryId?: string | null; note?: string }) =>
            api.post<OneOffTask>("/one-offs", {
                name: body.name,
                date: body.date,
                categoryId: body.categoryId ? Number(body.categoryId) : null,
                note: body.note,
            }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["one-offs"] }),
    });
}

export function useToggleOneOff(from: string, to: string) {
    const qc = useQueryClient();
    const qk = key(from, to);

    return useMutation({
        mutationFn: (id: string) => api.patch<OneOffTask>(`/one-offs/${id}/toggle`),

        // Optimistic toggle
        onMutate: async (id) => {
            await qc.cancelQueries({ queryKey: qk });
            const previous = qc.getQueryData<OneOffTask[]>(qk);

            qc.setQueryData<OneOffTask[]>(qk, (old) =>
                (old ?? []).map((t) => (t.id === id ? { ...t, done: !t.done } : t))
            );

            return { previous };
        },
        onError: (_e, _id, ctx) => {
            if(ctx?.previous) qc.setQueryData(qk, ctx.previous);
        },
        onSettled: () =>
            qc.invalidateQueries({ queryKey: ["one-offs"] }),
    });
}

export function useDeleteOneOff(from: string, to: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api.del<void>(`/one-offs/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["one-offs"] }),
    });
}