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
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 border-b border-[#5C6272]">
      <div className="rounded-[3px] border border-[#2A2E37] bg-[#1C1F26] p-2.5">
        <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-[#8B92A3]">
          <span>Daily Streak</span>
          <Flame
            size={13}
            className={currentStreak > 0 ? "text-[#E8B339]" : "text-[#5C6272]"}
          />
        </div>
        <p className="mt-0.5 text-lg font-bold tabular-nums text-[#E4E6EB]">
          {currentStreak} <span className="text-xs text-[#8B92A3]">days</span>
        </p>
        <p className="text-[9px] text-[#5C6272]">Best streak: {bestStreak}d</p>
      </div>

      <div className="rounded-[3px] border border-[#2A2E37] bg-[#1C1F26] p-2.5">
        <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-[#8B92A3]">
          <span>Completion</span>
          <CheckCircle2 size={13} className="text-[#E8B339]" />
        </div>
        <p className="mt-0.5 text-lg font-bold tabular-nums text-[#E8B339]">
          {completionRate}%
        </p>
        <p className="text-[9px] text-[#5C6272]">{periodLabel} tasks</p>
      </div>

      <div className="rounded-[3px] border border-[#2A2E37] bg-[#1C1F26] p-2.5">
        <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-[#8B92A3]">
          <span>Perfect days</span>
          <Sparkles size={13} className="text-[#3DD68C]" />
        </div>
        <p className="mt-0.5 text-lg font-bold tabular-nums text-[#3DD68C]">
          {perfectDays}
        </p>
        <p className="text-[9px] text-[#5C6272]">100% complete</p>
      </div>

      <div className="rounded-[3px] border border-[#2A2E37] bg-[#1C1F26] p-2.5">
        <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-[#8B92A3]">
          <span>Completed</span>
          <CheckCircle2 size={13} className="text-[#5B7FFF]" />
        </div>
        <p className="mt-0.5 text-lg font-bold tabular-nums text-[#E4E6EB]">
          {completedTasks}
        </p>
        <p className="text-[9px] text-[#5C6272]">total tasks finished</p>
      </div>
    </div>
  );
}
