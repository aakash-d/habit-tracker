import { useAuthStore } from "@/store/useAuthStore";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

async function request <T> (
    path: string,
    options?: RequestInit
): Promise<T> {
    const token = useAuthStore.getState().token;

    const res = await fetch(`${BASE}${path}`, {
        headers: { 
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options?.headers,
        },
        ...options,
    });

    // Token expired ot invalid  -> force logout
    if (res.status === 401 || res.status === 403) {
        if (token)
            useAuthStore.getState().logout();
        throw new Error("Session expired. Please log in again.");
    }

    if(!res.ok) {
        let message = res.statusText;
        try {
            const body = await res.json();
            if(body?.message)
                message = body.message;
        } catch {
            const text = await res.text().catch(() => "");
            throw new Error(`API ${res.status}: ${text || res.statusText}`);
        }
        throw new Error(message);
    }

    // 204 No Content = nothing to parse
    if(res.status === 204)
        return undefined as T;

    return res.json() as Promise<T>;
}

export const api = {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body: unknown) =>
        request<T>(path, { method: "POST", body: JSON.stringify(body) }),
    put: <T>(path: string, body: unknown) =>
        request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
    patch: <T>(path: string, body?: unknown) =>
        request<T>(path, {
            method: "PATCH",
            body: body ? JSON.stringify(body) : undefined,
        }),
    del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};