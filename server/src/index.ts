import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "./db";

interface TaskRow extends RowDataPacket {
  id: number;
  title: string;
  done: number; // MySQL BOOLEAN comes back as 0 or 1
  created_at: Date;
}

const toTask = (r: TaskRow) => ({
  id: r.id,
  title: r.title,
  done: r.done === 1,
  created_at: r.created_at,
});

const handler =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);

const app = express();
app.use(express.json());

// List all tasks, newest first
app.get(
  "/api/tasks",
  handler(async (_req, res) => {
    const [rows] = await pool.execute<TaskRow[]>(
      "SELECT id, title, done, created_at FROM tasks ORDER BY id DESC"
    );
    res.json(rows.map(toTask));
  })
);

// Create a task
app.post(
  "/api/tasks",
  handler(async (req, res) => {
    const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
    if (!title || title.length > 255) {
      res.status(400).json({ error: "Title is required (max 255 characters)" });
      return;
    }
    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO tasks (title) VALUES (?)",
      [title]
    );
    const [rows] = await pool.execute<TaskRow[]>(
      "SELECT id, title, done, created_at FROM tasks WHERE id = ?",
      [result.insertId]
    );
    res.status(201).json(toTask(rows[0]));
  })
);

// Toggle done / not done
app.patch(
  "/api/tasks/:id/toggle",
  handler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const [result] = await pool.execute<ResultSetHeader>(
      "UPDATE tasks SET done = NOT done WHERE id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    const [rows] = await pool.execute<TaskRow[]>(
      "SELECT id, title, done, created_at FROM tasks WHERE id = ?",
      [id]
    );
    res.json(toTask(rows[0]));
  })
);

// Delete a task
app.delete(
  "/api/tasks/:id",
  handler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const [result] = await pool.execute<ResultSetHeader>(
      "DELETE FROM tasks WHERE id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    res.status(204).end();
  })
);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
