import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server/auth";
import { query } from "@/lib/server/db";
import { getLocalDateString } from "@/lib/engine/dateUtils";
import { computeAnalytics } from "@/lib/engine/taskEngine";
import { TaskDefinition, TaskOccurrence } from "@/lib/engine/types";

export async function GET(
  request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  const admin = await getAuthUser(request);
  if (!admin)
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  if (admin.role !== "admin")
    return NextResponse.json(
      { success: false, error: "Admin access required" },
      { status: 403 },
    );
  try {
    const { userId } = await context.params;
    const users = await query(
      "SELECT id, username, email, provider, role, created_at FROM users WHERE id = ?",
      [userId],
    );
    const user = users[0] as Record<string, unknown> | undefined;
    if (!user)
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    const [rawTasks, rawOccurrences] = await Promise.all([
      query(
        "SELECT id, title, description, is_recurring, recurrence_rule, start_date, created_at, deleted_from, status FROM task_definitions WHERE user_id = ? ORDER BY created_at DESC",
        [userId],
      ),
      query(
        "SELECT id, task_definition_id, date, status, completed_at, updated_at FROM task_occurrences WHERE user_id = ?",
        [userId],
      ),
    ]);
    const definitions = rawTasks.map(
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
    const occurrences = rawOccurrences.map(
      (occurrence) =>
        ({
          ...occurrence,
          taskDefinitionId: occurrence.task_definition_id,
          completedAt: occurrence.completed_at || undefined,
          updatedAt: occurrence.updated_at,
        }) as unknown as TaskOccurrence,
    );
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
  } catch (error) {
    console.error("[Admin user details error]:", error);
    return NextResponse.json(
      { success: false, error: "Unable to load user details" },
      { status: 500 },
    );
  }
}
