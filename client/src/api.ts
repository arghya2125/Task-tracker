export interface Task {
  id: number;
  title: string;
  done: boolean;
  created_at: string;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export const getTasks = () => request<Task[]>("/api/tasks");

export const addTask = (title: string) =>
  request<Task>("/api/tasks", { method: "POST", body: JSON.stringify({ title }) });

export const toggleTask = (id: number) =>
  request<Task>(`/api/tasks/${id}/toggle`, { method: "PATCH" });

export const deleteTask = (id: number) =>
  request<void>(`/api/tasks/${id}`, { method: "DELETE" });
