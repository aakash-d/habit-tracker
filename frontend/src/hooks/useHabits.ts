"use client";

import { api } from "@/lib/api";
import { Frequency, Habit } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const KEY = ["habits"];

export function useHabits() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => api.get<Habit[]>("/habits"),
  });
}

interface HabitBody {
  name: string;
  icon?: string;
  categoryId?: string | null;
  frequency: Frequency;
  createdAt?: string;
}

export function useAddHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: HabitBody) => api.post<Habit>("/habits", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: HabitBody & { id: string }) =>
      api.put<Habit>(`/habits/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useArchiveHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch<Habit>(`/habits/${id}/archive`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useReorderHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, direction }: { id: string; direction: "up" | "down" }) =>
      api.patch<void>(`/habits/${id}/reorder?direction=${direction}`),
    onSuccess: async () => 
      await qc.invalidateQueries({ queryKey: KEY }),
  });
}
