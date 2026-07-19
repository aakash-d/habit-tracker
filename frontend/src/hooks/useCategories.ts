"use client";

import { api } from "@/lib/api";
import { Category } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const KEY = ["categories"];

export function useCategories() {
    return useQuery({
        queryKey: KEY,
        queryFn: () => api.get<Category[]>("/categories"),
    });
}

export function useAddCategory() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: { name: string; color: string }) =>
            api.post<Category>("/categories", body),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
}

export function useUpdateCategory() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...body }: { id: string; name: string; color: string }) =>
            api.put<Category>(`/categories/${id}`, body),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
}

export function useDeleteCategory() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api.del<void>(`/categories/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
}