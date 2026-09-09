import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server/auth";
import { getDatabase } from "@/lib/server/db";
import { getLocalDateString } from "@/lib/engine/dateUtils";
import { computeAnalytics } from "@/lib/engine/taskEngine";
import { TaskDefinition, TaskOccurrence } from "@/lib/engine/types";

export async function GET(
  request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  const admin = getAuthUser(request);
  if (!admin) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  if (admin.role !== "admin") {
    return NextResponse.json(
      { success: false, error: "Admin access required" },
      { status: 403 },
    );
  }

  try {
    const { userId } = await context.params;
    const db = getDatabase();
    const user = db
      .prepare(
        `
      SELECT id, username, email, provider, role, created_at
      FROM users
      WHERE id = ?
    `,
      )
      .get(userId) as
      | {
          id: string;
          username: string;
          email: string | null;
          provider: string;
          role: string;
          created_at: string;
        }
      | undefined;

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    const rawTasks = db
      .prepare(
        `
      SELECT id, title, description, is_recurring, recurrence_rule,
        start_date, created_at, deleted_from, status
      FROM task_definitions
      WHERE user_id = ?
      ORDER BY created_at DESC
    `,
      )
      .all(userId) as Array<{
      id: string;
      title: string;
      description: string | null;
      is_recurring: number;
      recurrence_rule: string | null;
      start_date: string;
      created_at: string;
      deleted_from: string | null;
      status: string;
    }>;
    const rawOccurrences = db
      .prepare(
        `
      SELECT id, task_definition_id, date, status, completed_at, updated_at
      FROM task_occurrences
      WHERE user_id = ?
    `,
      )
      .all(userId) as Array<{
      id: string;
      task_definition_id: string;
      date: string;
      status: string;
      completed_at: string | null;
      updated_at: string;
    }>;

    const definitions: TaskDefinition[] = rawTasks.map((task) => ({
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
    const occurrences: TaskOccurrence[] = rawOccurrences.map((occurrence) => ({
      id: occurrence.id,
      taskDefinitionId: occurrence.task_definition_id,
      date: occurrence.date,
      status: occurrence.status as TaskOccurrence["status"],
      completedAt: occurrence.completed_at || undefined,
      updatedAt: occurrence.updated_at,
    }));

    return NextResponse.json(
      {
        success: true,
        user,
        tasks: rawTasks,
        occurrences: rawOccurrences,
        analytics: computeAnalytics(
          definitions,
          occurrences,
          getLocalDateString(),
        ),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error: unknown) {
    console.error("[Admin user details error]:", error);
    return NextResponse.json(
      { success: false, error: "Unable to load user details" },
      { status: 500 },
    );
  }
}
