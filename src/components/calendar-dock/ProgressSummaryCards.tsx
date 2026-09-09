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
    <div className="grid grid-cols-2 gap-3 border-b border-[#2A2E37] pb-1 sm:grid-cols-4">
      <div className="rounded-[4px] border border-[#2A2E37] border-t-[#FF6B6B] bg-[#1C1F26] p-3">
        <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-[#8B92A3]">
          <span className="text-[10px]">Daily Streak</span>
          <Flame
            size={13}
            className={currentStreak > 0 ? "text-[#FF6B6B]" : "text-[#5C6272]"}
          />
        </div>
        <p className="mt-1 text-2xl font-bold tabular-nums text-[#E4E6EB]">
          {currentStreak} <span className="text-xs text-[#8B92A3]">days</span>
        </p>
        <p className="mt-0.5 text-[10px] text-[#5C6272]">
          Best streak: {bestStreak}d
        </p>
      </div>

      <div className="rounded-[4px] border border-[#2A2E37] border-t-[#E8B339] bg-[#1C1F26] p-3">
        <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-[#8B92A3]">
          <span className="text-[10px]">Completion</span>
          <CheckCircle2 size={13} className="text-[#E8B339]" />
        </div>
        <p className="mt-1 text-2xl font-bold tabular-nums text-[#E8B339]">
          {completionRate}%
        </p>
        <p className="mt-0.5 text-[10px] text-[#5C6272]">{periodLabel} tasks</p>
      </div>

      <div className="rounded-[4px] border border-[#2A2E37] border-t-[#3DD68C] bg-[#1C1F26] p-3">
        <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-[#8B92A3]">
          <span className="text-[10px]">Perfect days</span>
          <Sparkles size={13} className="text-[#3DD68C]" />
        </div>
        <p className="mt-1 text-2xl font-bold tabular-nums text-[#3DD68C]">
          {perfectDays}
        </p>
        <p className="mt-0.5 text-[10px] text-[#5C6272]">100% complete</p>
      </div>

      <div className="rounded-[4px] border border-[#2A2E37] border-t-[#5B7FFF] bg-[#1C1F26] p-3">
        <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-[#8B92A3]">
          <span className="text-[10px]">Completed</span>
          <CheckCircle2 size={13} className="text-[#5B7FFF]" />
        </div>
        <p className="mt-1 text-2xl font-bold tabular-nums text-[#E4E6EB]">
          {completedTasks}
        </p>
        <p className="mt-0.5 text-[10px] text-[#5C6272]">
          total tasks finished
        </p>
      </div>
    </div>
  );
}
