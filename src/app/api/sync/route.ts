import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server/auth";
import { query, withTransaction } from "@/lib/server/db";
import { TaskDefinition, TaskOccurrence } from "@/lib/engine/types";

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user)
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Sign in to sync across devices.",
        },
        { status: 401 },
      );
    const [rawTasks, rawOccurrences] = await Promise.all([
      query(
        "SELECT id, title, description, is_recurring, recurrence_rule, start_date, created_at, deleted_from, status FROM task_definitions WHERE user_id = ?",
        [user.id],
      ),
      query(
        "SELECT id, task_definition_id, date, status, completed_at, updated_at FROM task_occurrences WHERE user_id = ?",
        [user.id],
      ),
    ]);
    const tasks: TaskDefinition[] = rawTasks.map((task) => ({
      id: task.id as string,
      title: task.title as string,
      description: task.description || undefined,
      isRecurring: Boolean(task.is_recurring),
      recurrenceRule:
        (task.recurrence_rule as TaskDefinition["recurrenceRule"]) || undefined,
      startDate: task.start_date as string,
      createdAt: task.created_at as string,
      deletedFrom: task.deleted_from || undefined,
      status: task.status as TaskDefinition["status"],
    }));
    const occurrences: TaskOccurrence[] = rawOccurrences.map((occurrence) => ({
      id: occurrence.id as string,
      taskDefinitionId: occurrence.task_definition_id as string,
      date: occurrence.date as string,
      status: occurrence.status as TaskOccurrence["status"],
      completedAt: occurrence.completed_at || undefined,
      updatedAt: occurrence.updated_at as string,
    }));
    return NextResponse.json({
      success: true,
      tasks,
      occurrences,
      lastSyncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Sync GET error]:", error);
    return NextResponse.json(
      { success: false, error: "Sync failed" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user)
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Sign in to sync across devices.",
        },
        { status: 401 },
      );
    const body = (await request.json()) as {
      items?: Array<{
        id: string;
        action: string;
        payload: Record<string, unknown>;
        timestamp: number;
      }>;
    };
    const items = Array.isArray(body.items) ? body.items : [];
    if (!items.length)
      return NextResponse.json({ success: true, processed: 0 });
    await withTransaction(async (client) => {
      for (const item of items) {
        const payload = item.payload;
        if (item.action === "UPSERT_TASK")
          await client.query(
            `INSERT INTO task_definitions (id, user_id, title, description, is_recurring, recurrence_rule, start_date, created_at, deleted_from, status, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT (id,user_id) DO UPDATE SET title=EXCLUDED.title, description=EXCLUDED.description, is_recurring=EXCLUDED.is_recurring, recurrence_rule=EXCLUDED.recurrence_rule, start_date=EXCLUDED.start_date, deleted_from=EXCLUDED.deleted_from, status=EXCLUDED.status, updated_at=EXCLUDED.updated_at`,
            [
              payload.id,
              user.id,
              payload.title,
              payload.description || null,
              Boolean(payload.isRecurring),
              payload.recurrenceRule || null,
              payload.startDate,
              payload.createdAt,
              payload.deletedFrom || null,
              payload.status || "active",
              new Date().toISOString(),
            ],
          );
        if (item.action === "DELETE_TASK")
          await client.query(
            "UPDATE task_definitions SET status='deleted', deleted_from=$1, updated_at=$2 WHERE id=$3 AND user_id=$4",
            [
              payload.deletedFrom || new Date().toISOString().slice(0, 10),
              new Date().toISOString(),
              payload.id,
              user.id,
            ],
          );
        if (item.action === "UPSERT_OCCURRENCE")
          await client.query(
            `INSERT INTO task_occurrences (id,user_id,task_definition_id,date,status,completed_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id,user_id) DO UPDATE SET status=EXCLUDED.status, completed_at=EXCLUDED.completed_at, updated_at=EXCLUDED.updated_at`,
            [
              payload.id,
              user.id,
              payload.taskDefinitionId,
              payload.date,
              payload.status,
              payload.completedAt || null,
              payload.updatedAt || new Date().toISOString(),
            ],
          );
        if (item.action === "REMOVE_ALL")
          await client.query(
            "UPDATE task_definitions SET status='deleted', deleted_from=$1, updated_at=$2 WHERE user_id=$3 AND status='active'",
            [
              payload.deletedFrom || new Date().toISOString().slice(0, 10),
              new Date().toISOString(),
              user.id,
            ],
          );
      }
    });
    return NextResponse.json({
      success: true,
      processed: items.length,
      serverTimestamp: Date.now(),
    });
  } catch (error) {
    console.error("[Sync POST error]:", error);
    return NextResponse.json(
      { success: false, error: "Sync failed" },
      { status: 500 },
    );
  }
}
