"use client";

import { useEffect, useState, ReactNode } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { AuthScreen } from "./AuthScreen";

export function AuthGate({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const [ready, setReady] = useState(false);

  // Wait for zustand/persist to rehydrate from localStorage before deciding
  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    );
  }

  if (!token) return <AuthScreen />;

  return <>{children}</>;
}