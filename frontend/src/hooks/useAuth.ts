"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

interface AuthResponse {
  token: string;
  username: string;
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: { username: string; password: string }) =>
      api.post<AuthResponse>("/auth/login", body),
    onSuccess: (data) => {
      qc.clear(); // drop any cached data from a previous account
      setAuth(data.token, data.username);
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: {
      username: string;
      password: string;
      inviteCode: string;
    }) => api.post<AuthResponse>("/auth/register", body),
    onSuccess: (data) => {
      qc.clear();
      setAuth(data.token, data.username);
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const qc = useQueryClient();

  return () => {
    logout();
    qc.clear();
  };
}