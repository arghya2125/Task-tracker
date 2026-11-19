import { FormEvent, useEffect, useState } from "react";
import { Task, addTask, deleteTask, getTasks, toggleTask } from "./api";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getTasks().then(setTasks).catch((e: Error) => setError(e.message));
  }, []);

  const run = async (action: () => Promise<void>) => {
    try {
      setError("");
      await action();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    run(async () => {
      const task = await addTask(title);
      setTasks((prev) => [task, ...prev]);
      setTitle("");
    });
  };

  const handleToggle = (id: number) =>
    run(async () => {
      const updated = await toggleTask(id);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    });

  const handleDelete = (id: number) =>
    run(async () => {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    });

  const remaining = tasks.filter((t) => !t.done).length;

  return (
    <main className="page">
      <h1>Task Tracker</h1>
      <p className="count">
        {tasks.length === 0 ? "No tasks yet" : `${remaining} of ${tasks.length} left to do`}
      </p>

      <form className="add" onSubmit={handleAdd}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
          maxLength={255}
          aria-label="New task"
        />
        <button type="submit">Add task</button>
      </form>

      {error && <p className="error">{error}</p>}

      <ul className="list">
        {tasks.map((t) => (
          <li key={t.id} className={t.done ? "done" : ""}>
            <label>
              <input type="checkbox" checked={t.done} onChange={() => handleToggle(t.id)} />
              <span>{t.title}</span>
            </label>
            <button className="remove" onClick={() => handleDelete(t.id)} aria-label={`Delete ${t.title}`}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
