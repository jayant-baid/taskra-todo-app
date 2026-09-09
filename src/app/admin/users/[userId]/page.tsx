"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { TaskRail } from "@/components/task-rail/TaskRail";
import { CalendarDock } from "@/components/calendar-dock/CalendarDock";
import { addDays, getLocalDateString, getWeekDays } from "@/lib/engine/dateUtils";
import { computeAnalytics, computeDaySummary, computeMonthlyData } from "@/lib/engine/taskEngine";
import { TaskDefinition, TaskOccurrence } from "@/lib/engine/types";

type UserDetails = {
  user: {
    id: string;
    username: string;
    email: string | null;
    provider: string;
    role: string;
    created_at: string;
  };
  tasks: Array<{
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
  occurrences: Array<{
    id: string;
    task_definition_id: string;
    date: string;
    status: string;
    completed_at: string | null;
    updated_at: string;
  }>;
};

export default function AdminUserDetailsPage({ params }: { params: Promise<{ userId: string }> }) {
  const [details, setDetails] = useState<UserDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [weekCenter, setWeekCenter] = useState(getLocalDateString());
  const [month, setMonth] = useState(getLocalDateString().slice(0, 7));
  const today = getLocalDateString();
  const tomorrow = addDays(today, 1);

  useEffect(() => {
    void params.then(({ userId }) =>
      fetch(`/api/admin/users/${userId}`, { credentials: "include", cache: "no-store" })
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "Unable to load user details");
          return data as UserDetails;
        })
        .then(setDetails)
        .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load user details")),
    );
  }, [params]);

  const taskDefinitions = useMemo<TaskDefinition[]>(() => (details?.tasks || []).map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description || undefined,
    isRecurring: Boolean(task.is_recurring),
    recurrenceRule: task.recurrence_rule || undefined,
    startDate: task.start_date,
    createdAt: task.created_at,
    deletedFrom: task.deleted_from || undefined,
    status: task.status as TaskDefinition["status"],
  })), [details]);

  const taskOccurrences = useMemo<TaskOccurrence[]>(() => (details?.occurrences || []).map((occurrence) => ({
    id: occurrence.id,
    taskDefinitionId: occurrence.task_definition_id,
    date: occurrence.date,
    status: occurrence.status as TaskOccurrence["status"],
    completedAt: occurrence.completed_at || undefined,
    updatedAt: occurrence.updated_at,
  })), [details]);

  const analytics = useMemo(() => computeAnalytics(taskDefinitions, taskOccurrences, today), [taskDefinitions, taskOccurrences, today]);
  const todayTasks = useMemo(() => {
    return requireOccurrences(today, taskDefinitions, taskOccurrences);
  }, [today, taskDefinitions, taskOccurrences]);
  const tomorrowTasks = useMemo(() => {
    return requireOccurrences(tomorrow, taskDefinitions, taskOccurrences);
  }, [tomorrow, taskDefinitions, taskOccurrences]);
  const weekSummaries = useMemo(() => getWeekDays(weekCenter, true).map((date) => computeDaySummary(date, taskDefinitions, taskOccurrences, today)), [weekCenter, taskDefinitions, taskOccurrences, today]);
  const monthlyData = useMemo(() => computeMonthlyData(month, taskDefinitions, taskOccurrences, today), [month, taskDefinitions, taskOccurrences, today]);

  if (error) {
    return <main className="min-h-screen bg-[var(--bg-app)] p-6 text-[var(--text-primary)]"><div className="mx-auto max-w-xl rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 text-center"><ShieldCheck className="mx-auto mb-3 text-[var(--status-danger)]" size={30} /><h1 className="text-lg font-semibold">Unable to open user details</h1><p className="mt-2 text-sm text-[var(--text-secondary)]">{error}</p><Link href="/admin" className="mt-6 inline-flex items-center gap-2 text-sm text-[var(--accent-primary)] hover:underline"><ArrowLeft size={15} /> Back to admin</Link></div></main>;
  }

  if (!details) {
    return <main className="flex min-h-screen items-center justify-center bg-[var(--bg-app)] text-sm text-[var(--text-secondary)]">Loading user workspace...</main>;
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[var(--bg-app)] text-[var(--text-primary)]">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4">
        <div className="flex items-center gap-3"><Link href="/admin" className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><ArrowLeft size={14} /> All users</Link><span className="text-[var(--border-strong)]">|</span><div><span className="text-sm font-semibold">{details.user.username}</span><span className="ml-2 text-xs text-[var(--text-secondary)]">Read-only workspace</span></div></div>
        <div className="flex items-center gap-2 text-xs text-[var(--accent-primary)]"><ShieldCheck size={14} /> Admin preview</div>
      </header>
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        <section className="flex min-h-0 w-full shrink-0 flex-1 flex-col border-b border-[var(--border-subtle)] p-4 md:w-[460px] md:border-b-0 md:border-r lg:w-[500px]">
          <TaskRail todayStr={today} tomorrowStr={tomorrow} todayOccurrences={todayTasks} tomorrowOccurrences={tomorrowTasks} onToggle={() => undefined} onDelete={() => undefined} onEdit={() => undefined} onOpenAddModal={() => undefined} carryOverCount={analytics.carryOverCount} isReadOnly />
        </section>
        <section className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          <CalendarDock weekSummaries={weekSummaries} analytics={analytics} activeMonthStr={month} monthlyData={monthlyData} onPrevWeek={() => setWeekCenter((value) => addDays(value, -7))} onNextWeek={() => setWeekCenter((value) => addDays(value, 7))} onCurrentWeek={() => setWeekCenter(today)} onPrevMonth={() => setMonth((value) => shiftMonth(value, -1))} onNextMonth={() => setMonth((value) => shiftMonth(value, 1))} onCurrentMonth={() => setMonth(today.slice(0, 7))} />
        </section>
      </main>
    </div>
  );
}

function requireOccurrences(date: string, definitions: TaskDefinition[], occurrences: TaskOccurrence[]) {
  return computeDaySummary(date, definitions, occurrences, getLocalDateString()).occurrences;
}

function shiftMonth(value: string, offset: number) {
  const [year, month] = value.split("-").map(Number);
  const date = new Date(year, month - 1 + offset, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
