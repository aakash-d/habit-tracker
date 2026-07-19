const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

async function request <T> (
    path: string,
    options?: RequestInit
): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });

    if(!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`API ${res.status}: ${text || res.statusText}`);
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
    patch: <T>(path: string, body: unknown) =>
        request<T>(path, {
            method: "PATCH",
            body: body ? JSON.stringify(body) : undefined,
        }),
    del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};