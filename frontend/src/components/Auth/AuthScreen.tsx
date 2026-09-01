"use client";

import { useState } from "react";
import { useLogin, useRegister } from "@/hooks/useAuth";

export function AuthScreen() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const login = useLogin();
  const register = useRegister();

  const pending = login.isPending || register.isPending;
  const error =
    (login.error as Error | null)?.message ??
    (register.error as Error | null)?.message ??
    null;

  const canSubmit =
    username.trim().length > 0 &&
    password.length > 0 &&
    (mode === "login" || inviteCode.trim().length > 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || pending) return;
    if (mode === "login") {
      login.mutate({ username: username.trim(), password });
    } else {
      register.mutate({
        username: username.trim(),
        password,
        inviteCode: inviteCode.trim(),
      });
    }
  };

  const switchMode = () => {
    setMode((m) => (m === "login" ? "register" : "login"));
    login.reset();
    register.reset();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-950">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h1 className="mb-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Habit Tracker
        </h1>
        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
          {mode === "login" ? "Log in to continue" : "Create your account"}
        </p>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

          {mode === "register" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Invite code
              </label>
              <input
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit || pending}
            className="mt-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition disabled:opacity-40"
          >
            {pending
              ? "Please wait…"
              : mode === "login"
              ? "Log in"
              : "Create account"}
          </button>
        </form>

        <button
          onClick={switchMode}
          className="mt-4 w-full text-center text-sm text-blue-500 hover:underline"
        >
          {mode === "login"
            ? "Need an account? Register"
            : "Already have an account? Log in"}
        </button>
      </div>
    </main>
  );
}