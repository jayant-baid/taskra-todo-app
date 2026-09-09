"use client";

import { useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
} from "lucide-react";
import { DaySummary } from "@/lib/engine/types";
import { Button } from "@/components/ui/Button";
import { PastDayModal } from "./PastDayModal";
import { ProgressSummaryCards } from "./ProgressSummaryCards";

export interface MonthlyViewProps {
  monthStr: string;
  monthCells: (DaySummary | null)[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onCurrentMonth: () => void;
  currentStreak: number;
  bestStreak: number;
}

function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function MonthlyView({
  monthStr,
  monthCells,
  onPrevMonth,
  onNextMonth,
  onCurrentMonth,
  currentStreak,
  bestStreak,
}: MonthlyViewProps) {
  const [selectedDay, setSelectedDay] = useState<DaySummary | null>(null);
  const summaries = monthCells.filter((cell): cell is DaySummary =>
    Boolean(cell),
  );
  const totalCompleted = summaries.reduce(
    (total, summary) => total + summary.completedCount,
    0,
  );
  const totalTasks = summaries.reduce(
    (total, summary) => total + summary.totalCount,
    0,
  );
  const completionRate =
    totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
  const perfectDays = summaries.filter(
    (summary) =>
      summary.totalCount > 0 && summary.completedCount === summary.totalCount,
  ).length;

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-[#E8B339]" />
          <h3 className="text-sm font-semibold tracking-tight text-[#E4E6EB]">
            Monthly Progress
          </h3>
          <span className="text-xs text-[#8B92A3]">
            {formatMonth(monthStr)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={onCurrentMonth}
            className="text-[11px]"
          >
            This Month
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevMonth}
            title="Previous month"
            className="h-7 w-7"
          >
            <ChevronLeft size={15} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextMonth}
            title="Next month"
            className="h-7 w-7"
          >
            <ChevronRight size={15} />
          </Button>
        </div>
      </div>

      <ProgressSummaryCards
        completionRate={completionRate}
        perfectDays={perfectDays}
        completedTasks={totalCompleted}
        periodLabel="monthly"
        currentStreak={currentStreak}
        bestStreak={bestStreak}
      />

      <div className="rounded-[4px] border border-[#2A2E37] bg-[#1C1F26] p-3">
        <div className="mb-2 grid grid-cols-7 text-center text-[10px] font-semibold uppercase tracking-wider text-[#5C6272]">
          {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
            <span key={`${day}-${index}`}>{day}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {monthCells.map((summary, index) => {
            if (!summary) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const ratio = summary.totalCount
              ? summary.completedCount / summary.totalCount
              : 0;
            const isPerfect = summary.totalCount > 0 && ratio === 1;
            const isToday = summary.isToday;

            return (
              <div
                key={summary.date}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedDay(summary)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedDay(summary);
                  }
                }}
                className={`relative flex aspect-square flex-col items-center justify-center rounded-[3px] border text-[11px] transition-colors ${
                  isPerfect
                    ? "border-[#3DD68C]/50 bg-[#3DD68C]/20 text-[#B8F3D4]"
                    : ratio > 0
                      ? "border-[#E8B339]/40 bg-[#E8B339]/15 text-[#F4D889]"
                      : "border-[#2A2E37] bg-[#14161A] text-[#8B92A3]"
                } cursor-pointer hover:border-[#5B7FFF] hover:bg-[#5B7FFF]/10 focus:outline-none focus:ring-1 focus:ring-[#5B7FFF] ${isToday ? "ring-1 ring-[#5B7FFF] ring-offset-1 ring-offset-[#1C1F26]" : ""}`}
                title={`${summary.date}: ${summary.completedCount}/${summary.totalCount} completed`}
              >
                <span className="font-semibold">{summary.dayNumber}</span>
                {summary.totalCount > 0 && (
                  <span className="mt-0.5 text-[8px] tabular-nums opacity-80">
                    {summary.completedCount}/{summary.totalCount}
                  </span>
                )}
                {isPerfect && (
                  <CircleCheck
                    size={8}
                    className="absolute right-0.5 top-0.5 text-[#3DD68C]"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3 text-[10px] text-[#8B92A3]">
        <span className="flex items-center gap-1">
          <i className="h-2 w-2 rounded-[2px] bg-[#3DD68C]/70" /> Complete
        </span>
        <span className="flex items-center gap-1">
          <i className="h-2 w-2 rounded-[2px] bg-[#E8B339]/70" /> In progress
        </span>
        <span className="flex items-center gap-1">
          <i className="h-2 w-2 rounded-[2px] bg-[#14161A] border border-[#383E4C]" />{" "}
          No activity
        </span>
      </div>

      <PastDayModal
        daySummary={selectedDay}
        onClose={() => setSelectedDay(null)}
      />
    </div>
  );
}
