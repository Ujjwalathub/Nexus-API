import type { EntityItem, NodeRef } from "@/types/lore";

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90_000);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
    if (!res.ok) {
      let detail = `${res.status} ${res.statusText}`;
      try {
        const body = await res.json();
        if (body?.detail) detail = String(body.detail);
      } catch {
        /* ignore */
      }
      throw new Error(detail);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export function generateLore(nodes: NodeRef[]) {
  return request<{ lore: string }>("/generate-lore", {
    method: "POST",
    body: JSON.stringify({ nodes }),
  });
}

export function generateAvatar(
  name: string,
  type: string,
  description: string,
) {
  return request<{ image_url: string }>("/generate-avatar", {
    method: "POST",
    body: JSON.stringify({ name, type, description }),
  });
}

export function extractEntities(text: string) {
  return request<{ entities: EntityItem[] }>("/extract-entities", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
