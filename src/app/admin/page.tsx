"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, BarChart3, CheckCircle2, CircleUserRound, ListTodo, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Overview = {
  summary: {
    total_users: number;
    admin_users: number;
    active_sessions: number;
    total_tasks: number;
    active_tasks: number;
    recurring_tasks: number;
    total_occurrences: number;
    completed_occurrences: number;
    completion_rate: number;
  };
  users: Array<{
    id: string;
    username: string;
    email: string | null;
    provider: string;
    role: string;
    created_at: string;
    task_count: number;
    active_task_count: number;
    completed_count: number;
    analytics: {
      currentStreak: number;
      bestStreak: number;
      completionRate7d: number;
      completionRate30d: number;
      totalActiveTasks: number;
      recurringCount: number;
      carryOverCount: number;
    };
  }>;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

export default function AdminPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/overview", { credentials: "include", cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Admin access required");
        return data as Overview;
      })
      .then(setOverview)
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : "Unable to load admin data");
      });
  }, []);

  if (error) {
    return (
      <main className="min-h-screen bg-[var(--bg-app)] p-6 text-[var(--text-primary)]">
        <div className="mx-auto max-w-xl rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 text-center">
          <ShieldCheck className="mx-auto mb-3 text-[var(--status-danger)]" size={30} />
          <h1 className="text-lg font-semibold">Admin access required</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{error}</p>
          <Link href="/" className="mt-6 inline-flex items-center gap-2 text-sm text-[var(--accent-primary)] hover:underline">
            <ArrowLeft size={15} /> Back to Taskra
          </Link>
        </div>
      </main>
    );
  }

  if (!overview) {
    return <main className="flex min-h-screen items-center justify-center bg-[var(--bg-app)] text-sm text-[var(--text-secondary)]">Loading admin overview...</main>;
  }

  const cards = [
    ["Total users", overview.summary.total_users, CircleUserRound],
    ["Active sessions", overview.summary.active_sessions, ShieldCheck],
    ["All tasks", overview.summary.total_tasks, ListTodo],
    ["Active recurring", overview.summary.recurring_tasks, BarChart3],
    ["Completed occurrences", overview.summary.completed_occurrences, CheckCircle2],
    ["Completion rate", `${overview.summary.completion_rate}%`, BarChart3],
  ] as const;

  return (
    <main className="min-h-screen overflow-y-auto bg-[var(--bg-app)] p-4 text-[var(--text-primary)] sm:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-primary)]">
              <ShieldCheck size={15} /> Admin console
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Taskra usage overview</h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Users, task activity, and completion analysis.</p>
          </div>
          <Link href="/" className="inline-flex items-center gap-2 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <ArrowLeft size={15} /> Taskra
          </Link>
        </header>

        <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-6">
          {cards.map(([label, value, Icon]) => (
            <div key={label} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
              <Icon size={17} className="mb-4 text-[var(--accent-primary)]" />
              <div className="text-2xl font-semibold tabular-nums">{value}</div>
              <div className="mt-1 text-xs text-[var(--text-secondary)]">{label}</div>
            </div>
          ))}
        </section>

        <section className="mb-8 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <div className="border-b border-[var(--border-subtle)] px-4 py-3">
            <h2 className="text-sm font-semibold">Accounts</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs text-[var(--text-secondary)]">
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Provider</th>
                  <th className="px-4 py-3 font-medium">Tasks</th>
                  <th className="px-4 py-3 font-medium">Completed</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {overview.users.map((user) => (
                  <tr
                    key={user.id}
                    className="cursor-pointer border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-surface-subtle)]"
                    onClick={() => router.push(`/admin/users/${user.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") router.push(`/admin/users/${user.id}`);
                    }}
                    tabIndex={0}
                    role="button"
                  >
                    <td className="px-4 py-3"><div className="font-medium">{user.username}{user.role === "admin" && <span className="ml-2 text-[10px] uppercase text-[var(--accent-primary)]">admin</span>}</div><div className="text-xs text-[var(--text-secondary)]">{user.email || "No email"}</div></td>
                    <td className="px-4 py-3 capitalize text-[var(--text-secondary)]">{user.provider}</td>
                    <td className="px-4 py-3 tabular-nums">{user.active_task_count} active <span className="text-[var(--text-muted)]">/ {user.task_count} total</span></td>
                    <td className="px-4 py-3 tabular-nums">{user.completed_count}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{formatDate(user.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </main>
  );
}
