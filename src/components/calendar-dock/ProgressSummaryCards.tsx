import { CheckCircle2, Flame, Sparkles } from "lucide-react";

export interface ProgressSummaryCardsProps {
  completionRate: number;
  perfectDays: number;
  completedTasks: number;
  periodLabel: "weekly" | "monthly";
  currentStreak: number;
  bestStreak: number;
}

export function ProgressSummaryCards({
  completionRate,
  perfectDays,
  completedTasks,
  periodLabel,
  currentStreak,
  bestStreak,
}: ProgressSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 border-b border-[var(--border-subtle)] pb-1 sm:grid-cols-4">
      <div className="rounded-[6px] border border-[var(--border-subtle)] border-t-[var(--status-danger)] bg-[var(--bg-surface)] p-3 shadow-[0_1px_0_rgba(15,23,42,0.02)]">
        <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-[var(--text-secondary)]">
          <span className="text-[10px]">Daily Streak</span>
          <Flame
            size={13}
            className={
              currentStreak > 0
                ? "text-[var(--status-danger)]"
                : "text-[var(--text-muted)]"
            }
          />
        </div>
        <p className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">
          {currentStreak}{" "}
          <span className="text-xs text-[var(--text-secondary)]">days</span>
        </p>
        <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">
          Best streak: {bestStreak}d
        </p>
      </div>

      <div className="rounded-[6px] border border-[var(--border-subtle)] border-t-[var(--status-pending)] bg-[var(--bg-surface)] p-3 shadow-[0_1px_0_rgba(15,23,42,0.02)]">
        <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-[var(--text-secondary)]">
          <span className="text-[10px]">Completion</span>
          <CheckCircle2 size={13} className="text-[var(--status-pending)]" />
        </div>
        <p className="text-2xl font-bold tabular-nums text-[var(--status-pending)]">
          {completionRate}%
        </p>
        <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">
          {periodLabel} tasks
        </p>
      </div>

      <div className="rounded-[6px] border border-[var(--border-subtle)] border-t-[var(--status-completed)] bg-[var(--bg-surface)] p-3 shadow-[0_1px_0_rgba(15,23,42,0.02)]">
        <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-[var(--text-secondary)]">
          <span className="text-[10px]">Perfect days</span>
          <Sparkles size={13} className="text-[var(--status-completed)]" />
        </div>
        <p className="text-2xl font-bold tabular-nums text-[var(--status-completed)]">
          {perfectDays}
        </p>
        <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">
          100% complete
        </p>
      </div>

      <div className="rounded-[6px] border border-[var(--border-subtle)] border-t-[var(--accent-primary)] bg-[var(--bg-surface)] p-3 shadow-[0_1px_0_rgba(15,23,42,0.02)]">
        <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-[var(--text-secondary)]">
          <span className="text-[10px]">Completed</span>
          <CheckCircle2 size={13} className="text-[var(--accent-primary)]" />
        </div>
        <p className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">
          {completedTasks}
        </p>
        <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">
          total tasks finished
        </p>
      </div>
    </div>
  );
}
