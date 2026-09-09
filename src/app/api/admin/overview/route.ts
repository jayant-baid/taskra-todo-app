import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server/auth";
import { query } from "@/lib/server/db";
import { getLocalDateString } from "@/lib/engine/dateUtils";
import { computeAnalytics } from "@/lib/engine/taskEngine";
import { TaskDefinition, TaskOccurrence } from "@/lib/engine/types";

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user)
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  if (user.role !== "admin")
    return NextResponse.json(
      { success: false, error: "Admin access required" },
      { status: 403 },
    );

  try {
    const [summaryRows, users, taskRows, occurrenceRows] = await Promise.all([
      query(`SELECT
        (SELECT COUNT(*)::int FROM users) AS total_users,
        (SELECT COUNT(*)::int FROM users WHERE role = 'admin') AS admin_users,
        (SELECT COUNT(*)::int FROM sessions WHERE expires_at::timestamptz > CURRENT_TIMESTAMP) AS active_sessions,
        (SELECT COUNT(*)::int FROM task_definitions) AS total_tasks,
        (SELECT COUNT(*)::int FROM task_definitions WHERE status = 'active') AS active_tasks,
        (SELECT COUNT(*)::int FROM task_definitions WHERE is_recurring = TRUE AND status = 'active') AS recurring_tasks,
        (SELECT COUNT(*)::int FROM task_occurrences) AS total_occurrences,
        (SELECT COUNT(*)::int FROM task_occurrences WHERE status = 'completed') AS completed_occurrences`),
      query(`SELECT u.id, u.username, u.email, u.provider, u.role, u.created_at,
        COUNT(DISTINCT t.id)::int AS task_count,
        COUNT(DISTINCT CASE WHEN t.status = 'active' THEN t.id END)::int AS active_task_count,
        COUNT(DISTINCT CASE WHEN o.status = 'completed' THEN o.id END)::int AS completed_count
        FROM users u LEFT JOIN task_definitions t ON t.user_id = u.id
        LEFT JOIN task_occurrences o ON o.user_id = u.id GROUP BY u.id ORDER BY u.created_at DESC`),
      query(`SELECT id, user_id, title, description, is_recurring, recurrence_rule,
        start_date, created_at, deleted_from, status FROM task_definitions`),
      query(
        `SELECT id, user_id, task_definition_id, date, status, completed_at, updated_at FROM task_occurrences`,
      ),
    ]);

    const summary = summaryRows[0] as Record<string, number>;
    const analyticsByUser = new Map<
      string,
      ReturnType<typeof computeAnalytics>
    >();
    for (const account of users as Array<{ id: string }>) {
      const definitions = (taskRows as Array<Record<string, unknown>>)
        .filter((task) => task.user_id === account.id)
        .map(
          (task) =>
            ({
              ...task,
              isRecurring: Boolean(task.is_recurring),
              recurrenceRule: task.recurrence_rule || undefined,
              startDate: task.start_date,
              createdAt: task.created_at,
              deletedFrom: task.deleted_from || undefined,
            }) as unknown as TaskDefinition,
        );
      const occurrences = (occurrenceRows as Array<Record<string, unknown>>)
        .filter((occurrence) => occurrence.user_id === account.id)
        .map(
          (occurrence) =>
            ({
              ...occurrence,
              taskDefinitionId: occurrence.task_definition_id,
              completedAt: occurrence.completed_at || undefined,
              updatedAt: occurrence.updated_at,
            }) as unknown as TaskOccurrence,
        );
      analyticsByUser.set(
        account.id,
        computeAnalytics(definitions, occurrences, getLocalDateString()),
      );
    }

    const total = Number(summary.total_occurrences);
    const completed = Number(summary.completed_occurrences);
    return NextResponse.json(
      {
        success: true,
        summary: {
          ...summary,
          completion_rate: total ? Math.round((completed / total) * 100) : 0,
        },
        users: (users as Array<Record<string, unknown>>).map((account) => ({
          ...account,
          analytics: analyticsByUser.get(account.id as string),
        })),
        generated_at: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[Admin overview error]:", error);
    return NextResponse.json(
      { success: false, error: "Unable to load admin overview" },
      { status: 500 },
    );
  }
}
