import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server/auth";
import { query } from "@/lib/server/db";
import { computeAnalytics, computeDaySummary } from "@/lib/engine/taskEngine";
import { addDays, getDaysDifference } from "@/lib/engine/dateUtils";
import { TaskDefinition, TaskOccurrence } from "@/lib/engine/types";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isDate(value: string | null): value is string {
  return Boolean(value && DATE_PATTERN.test(value));
}

function mapTask(task: Record<string, unknown>): TaskDefinition {
  return {
    id: task.id as string,
    title: task.title as string,
    description: (task.description as string | null) || undefined,
    isRecurring: Boolean(task.is_recurring),
    recurrenceRule:
      (task.recurrence_rule as TaskDefinition["recurrenceRule"]) || undefined,
    startDate: task.start_date as string,
    createdAt: task.created_at as string,
    deletedFrom: (task.deleted_from as string | null) || undefined,
    status: task.status as TaskDefinition["status"],
  };
}

function mapOccurrence(occurrence: Record<string, unknown>): TaskOccurrence {
  return {
    id: occurrence.id as string,
    taskDefinitionId: occurrence.task_definition_id as string,
    date: occurrence.date as string,
    status: occurrence.status as TaskOccurrence["status"],
    completedAt: (occurrence.completed_at as string | null) || undefined,
    updatedAt: occurrence.updated_at as string,
  };
}

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const url = new URL(request.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const taskDate = url.searchParams.get("taskDate");

    if (
      !isDate(startDate) ||
      !isDate(endDate) ||
      !isDate(taskDate) ||
      startDate > endDate ||
      getDaysDifference(startDate, endDate) > 62
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid report date range" },
        { status: 400 },
      );
    }

    const analyticsStartDate = addDays(taskDate, -60);
    const [rawTasks, rawOccurrences] = await Promise.all([
      query(
        "SELECT id, title, description, is_recurring, recurrence_rule, start_date, created_at, deleted_from, status FROM task_definitions WHERE user_id = ?",
        [user.id],
      ),
      query(
        "SELECT id, task_definition_id, date, status, completed_at, updated_at FROM task_occurrences WHERE user_id = ? AND date >= ? AND date <= ?",
        [user.id, analyticsStartDate, endDate],
      ),
    ]);

    const tasks = rawTasks.map((task) =>
      mapTask(task as Record<string, unknown>),
    );
    const occurrences = rawOccurrences.map((occurrence) =>
      mapOccurrence(occurrence as Record<string, unknown>),
    );
    const dates: string[] = [];
    for (let date = startDate; date <= endDate; date = addDays(date, 1)) {
      dates.push(date);
    }

    return NextResponse.json({
      success: true,
      startDate,
      endDate,
      taskDate,
      summaries: dates.map((date) =>
        computeDaySummary(date, tasks, occurrences, taskDate),
      ),
      analytics: computeAnalytics(tasks, occurrences, taskDate),
    });
  } catch (error) {
    console.error("[Reports GET error]:", error);
    return NextResponse.json(
      { success: false, error: "Report generation failed" },
      { status: 500 },
    );
  }
}
