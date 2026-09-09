import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server/auth";
import { getDatabase } from "@/lib/server/db";
import { getLocalDateString } from "@/lib/engine/dateUtils";
import { computeAnalytics } from "@/lib/engine/taskEngine";
import { TaskDefinition, TaskOccurrence } from "@/lib/engine/types";

export async function GET(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  if (user.role !== "admin") {
    return NextResponse.json(
      { success: false, error: "Admin access required" },
      { status: 403 },
    );
  }

  try {
    const db = getDatabase();
    const summary = db
      .prepare(
        `
      SELECT
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'admin') AS admin_users,
        (SELECT COUNT(*) FROM sessions WHERE expires_at > datetime('now')) AS active_sessions,
        (SELECT COUNT(*) FROM task_definitions) AS total_tasks,
        (SELECT COUNT(*) FROM task_definitions WHERE status = 'active') AS active_tasks,
        (SELECT COUNT(*) FROM task_definitions WHERE is_recurring = 1 AND status = 'active') AS recurring_tasks,
        (SELECT COUNT(*) FROM task_occurrences) AS total_occurrences,
        (SELECT COUNT(*) FROM task_occurrences WHERE status = 'completed') AS completed_occurrences
    `,
      )
      .get() as {
      total_users: number;
      admin_users: number;
      active_sessions: number;
      total_tasks: number;
      active_tasks: number;
      recurring_tasks: number;
      total_occurrences: number;
      completed_occurrences: number;
    };

    const users = db
      .prepare(
        `
      SELECT
        u.id,
        u.username,
        u.email,
        u.provider,
        u.role,
        u.created_at,
        COUNT(DISTINCT t.id) AS task_count,
        COUNT(DISTINCT CASE WHEN t.status = 'active' THEN t.id END) AS active_task_count,
        COUNT(DISTINCT CASE WHEN o.status = 'completed' THEN o.id END) AS completed_count
      FROM users u
      LEFT JOIN task_definitions t ON t.user_id = u.id
      LEFT JOIN task_occurrences o ON o.user_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `,
      )
      .all() as Array<{
      id: string;
      username: string;
      email: string | null;
      provider: string;
      role: string;
      created_at: string;
      task_count: number;
      active_task_count: number;
      completed_count: number;
    }>;

    const taskRows = db
      .prepare(
        `
      SELECT id, user_id, title, description, is_recurring, recurrence_rule,
        start_date, created_at, deleted_from, status
      FROM task_definitions
    `,
      )
      .all() as Array<{
      id: string;
      user_id: string;
      title: string;
      description: string | null;
      is_recurring: number;
      recurrence_rule: string | null;
      start_date: string;
      created_at: string;
      deleted_from: string | null;
      status: string;
    }>;
    const occurrenceRows = db
      .prepare(
        `
      SELECT id, user_id, task_definition_id, date, status, completed_at, updated_at
      FROM task_occurrences
    `,
      )
      .all() as Array<{
      id: string;
      user_id: string;
      task_definition_id: string;
      date: string;
      status: string;
      completed_at: string | null;
      updated_at: string;
    }>;
    const today = getLocalDateString();
    const analyticsByUser = new Map<
      string,
      ReturnType<typeof computeAnalytics>
    >();
    for (const account of users) {
      const definitions: TaskDefinition[] = taskRows
        .filter((task) => task.user_id === account.id)
        .map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description || undefined,
          isRecurring: Boolean(task.is_recurring),
          recurrenceRule: task.recurrence_rule || undefined,
          startDate: task.start_date,
          createdAt: task.created_at,
          deletedFrom: task.deleted_from || undefined,
          status: task.status as TaskDefinition["status"],
        }));
      const occurrences: TaskOccurrence[] = occurrenceRows
        .filter((occurrence) => occurrence.user_id === account.id)
        .map((occurrence) => ({
          id: occurrence.id,
          taskDefinitionId: occurrence.task_definition_id,
          date: occurrence.date,
          status: occurrence.status as TaskOccurrence["status"],
          completedAt: occurrence.completed_at || undefined,
          updatedAt: occurrence.updated_at,
        }));
      analyticsByUser.set(
        account.id,
        computeAnalytics(definitions, occurrences, today),
      );
    }

    const usersWithAnalytics = users.map((account) => ({
      ...account,
      analytics: analyticsByUser.get(account.id),
    }));

    const totalOccurrences = Number(summary.total_occurrences);
    const completedOccurrences = Number(summary.completed_occurrences);

    return NextResponse.json(
      {
        success: true,
        summary: {
          ...summary,
          completion_rate: totalOccurrences
            ? Math.round((completedOccurrences / totalOccurrences) * 100)
            : 0,
        },
        users: usersWithAnalytics,
        generated_at: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error: unknown) {
    console.error("[Admin overview error]:", error);
    return NextResponse.json(
      { success: false, error: "Unable to load admin overview" },
      { status: 500 },
    );
  }
}
