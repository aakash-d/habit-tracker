"use client";

import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

interface StreakResponse {
    current: number;
    longest: number;
    unit: "days" | "weeks";
}

export function useStreak(habitId: string, weekStart: 0 | 1) {
    return useQuery({
        queryKey: ["streak", habitId, weekStart],
        queryFn: () =>
            api.get<StreakResponse>(`/habits/${habitId}/streak?weekStart=${weekStart}`),
    });
}