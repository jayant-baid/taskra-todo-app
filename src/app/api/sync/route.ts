import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/server/db';
import { getAuthUser } from '@/lib/server/auth';
import { TaskDefinition, TaskOccurrence } from '@/lib/engine/types';

export async function GET(request: Request) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Sign in to sync across devices.' },
        { status: 401 }
      );
    }

    const db = getDatabase();

    // Fetch task definitions
    const taskStmt = db.prepare(`
      SELECT id, title, description, is_recurring, recurrence_rule, start_date, created_at, deleted_from, status
      FROM task_definitions
      WHERE user_id = ?
    `);
    const rawTasks = taskStmt.all(user.id) as Array<{
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

    const tasks: TaskDefinition[] = rawTasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description || undefined,
      isRecurring: Boolean(t.is_recurring),
      recurrenceRule: t.recurrence_rule || undefined,
      startDate: t.start_date,
      createdAt: t.created_at,
      deletedFrom: t.deleted_from || undefined,
      status: t.status as TaskDefinition['status'],
    }));

    // Fetch occurrences
    const occStmt = db.prepare(`
      SELECT id, task_definition_id, date, status, completed_at, updated_at
      FROM task_occurrences
      WHERE user_id = ?
    `);
    const rawOccs = occStmt.all(user.id) as Array<{
      id: string;
      task_definition_id: string;
      date: string;
      status: string;
      completed_at: string | null;
      updated_at: string;
    }>;

    const occurrences: TaskOccurrence[] = rawOccs.map((o) => ({
      id: o.id,
      taskDefinitionId: o.task_definition_id,
      date: o.date,
      status: o.status as TaskOccurrence['status'],
      completedAt: o.completed_at || undefined,
      updatedAt: o.updated_at,
    }));

    return NextResponse.json({
      success: true,
      tasks,
      occurrences,
      lastSyncedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    console.error('[Sync GET error]:', err);
    const msg = err instanceof Error ? err.message : 'Sync failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Sign in to sync across devices.' },
        { status: 401 }
      );
    }

    let body: { items?: Array<{ id: string; action: string; payload: Record<string, unknown>; timestamp: number }> };
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      const text = await request.text();
      body = text ? JSON.parse(text) : {};
    }

    const items = body.items as Array<{ id: string; action: string; payload: Record<string, unknown>; timestamp: number }> || [];
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: true, processed: 0 });
    }

    const db = getDatabase();

    const upsertTaskStmt = db.prepare(`
      INSERT INTO task_definitions (
        id, user_id, title, description, is_recurring, recurrence_rule,
        start_date, created_at, deleted_from, status, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id, user_id) DO UPDATE SET
        title = excluded.title,
        description = excluded.description,
        is_recurring = excluded.is_recurring,
        recurrence_rule = excluded.recurrence_rule,
        start_date = excluded.start_date,
        deleted_from = excluded.deleted_from,
        status = excluded.status,
        updated_at = excluded.updated_at
    `);

    const upsertOccStmt = db.prepare(`
      INSERT INTO task_occurrences (
        id, user_id, task_definition_id, date, status, completed_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id, user_id) DO UPDATE SET
        status = excluded.status,
        completed_at = excluded.completed_at,
        updated_at = excluded.updated_at
    `);

    const softDeleteTaskStmt = db.prepare(`
      UPDATE task_definitions
      SET status = 'deleted', deleted_from = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `);

    const removeAllActiveStmt = db.prepare(`
      UPDATE task_definitions
      SET status = 'deleted', deleted_from = ?, updated_at = ?
      WHERE user_id = ? AND status = 'active'
    `);

    db.exec('BEGIN TRANSACTION;');
    try {
      const nowIso = new Date().toISOString();

      for (const item of items) {
        const { action, payload } = item;

        if (action === 'UPSERT_TASK' && payload) {
          upsertTaskStmt.run(
            payload.id,
            user.id,
            payload.title,
            payload.description || null,
            payload.isRecurring ? 1 : 0,
            payload.recurrenceRule || null,
            payload.startDate,
            payload.createdAt,
            payload.deletedFrom || null,
            payload.status || 'active',
            nowIso
          );
        } else if (action === 'DELETE_TASK' && payload) {
          softDeleteTaskStmt.run(
            payload.deletedFrom || nowIso.split('T')[0],
            nowIso,
            payload.id,
            user.id
          );
        } else if (action === 'UPSERT_OCCURRENCE' && payload) {
          upsertOccStmt.run(
            payload.id,
            user.id,
            payload.taskDefinitionId,
            payload.date,
            payload.status,
            payload.completedAt || null,
            payload.updatedAt || nowIso
          );
        } else if (action === 'REMOVE_ALL' && payload) {
          removeAllActiveStmt.run(
            payload.deletedFrom || nowIso.split('T')[0],
            nowIso,
            user.id
          );
        }
      }

      db.exec('COMMIT;');
    } catch (txErr) {
      db.exec('ROLLBACK;');
      throw txErr;
    }

    return NextResponse.json({
      success: true,
      processed: items.length,
      serverTimestamp: Date.now(),
    });
  } catch (error: unknown) {
    console.error('[Sync POST error]:', error);
    const errorMessage = error instanceof Error ? error.message : 'Sync failed';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
