"use client";

import { useEffect, useRef, useState } from "react";
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
  const [cellSize, setCellSize] = useState(44);
  const viewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const updateCellSize = () => {
      const { width, height } = view.getBoundingClientRect();
      const horizontalPadding = 24;
      const verticalChrome = 184;
      const columnGap = 6;
      const rowGap = 6;
      const widthBasedSize = (width - horizontalPadding - columnGap * 6) / 7;
      const heightBasedSize = (height - verticalChrome - rowGap * 5) / 6;
      const nextSize = Math.max(
        30,
        Math.min(52, widthBasedSize, heightBasedSize),
      );

      setCellSize((previous) =>
        Math.abs(previous - nextSize) > 0.5 ? nextSize : previous,
      );
    };

    updateCellSize();
    const observer = new ResizeObserver(updateCellSize);
    observer.observe(view);
    return () => observer.disconnect();
  }, []);
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
    <div ref={viewRef} className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <CalendarDays
            size={16}
            className="text-[var(--accent-primary)] shrink-0"
          />
          <h3 className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">
            Monthly Progress
          </h3>
          <span className="text-xs text-[var(--text-secondary)] truncate">
            {formatMonth(monthStr)}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={onCurrentMonth}
            className="text-[11px] bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-strong)]"
          >
            This Month
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevMonth}
            title="Previous month"
            className="h-7 w-7 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <ChevronLeft size={15} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextMonth}
            title="Next month"
            className="h-7 w-7 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
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

      <div className="rounded-[4px] border border-[#2A2E37] bg-[#1C1F26] p-3 lg:p-2">
        <div className="mb-2 grid grid-cols-7 text-center text-[10px] font-semibold uppercase tracking-wider text-[#5C6272] lg:mb-1 lg:text-[9px]">
          {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
            <span key={`${day}-${index}`}>{day}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5 lg:gap-1">
          {monthCells.map((summary, index) => {
            if (!summary) {
              return (
                <div
                  key={`empty-${index}`}
                  className="aspect-square"
                  style={{ height: `${cellSize}px` }}
                />
              );
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
                className={`relative flex aspect-square flex-col items-center justify-center rounded-[6px] border text-[11px] transition-all duration-150 lg:aspect-auto lg:text-[10px] ${
                  isPerfect
                    ? "border-[var(--status-completed)]/40 bg-[var(--status-completed-bg)] text-[var(--text-primary)]"
                    : ratio > 0
                      ? "border-[var(--status-pending)]/40 bg-[var(--status-pending-bg)] text-[var(--text-primary)]"
                      : "border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-secondary)]"
                } cursor-pointer hover:border-[var(--accent-primary)] hover:bg-[var(--accent-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/25 ${isToday ? "ring-2 ring-[var(--accent-primary)]/50 ring-offset-1 ring-offset-[var(--bg-surface)]" : ""}`}
                style={{ height: `${cellSize}px` }}
                title={`${summary.date}: ${summary.completedCount}/${summary.totalCount} completed`}
              >
                <span className="font-semibold">{summary.dayNumber}</span>
                {summary.totalCount > 0 && (
                  <span className="mt-0.5 text-[8px] tabular-nums opacity-80 lg:text-[7px]">
                    {summary.completedCount}/{summary.totalCount}
                  </span>
                )}
                {isPerfect && (
                  <CircleCheck
                    size={8}
                    className="absolute right-0.5 top-0.5 text-[var(--text-green)]"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3 text-[10px] text-[var(--text-secondary)]">
        <span className="flex items-center gap-1">
          <i className="h-2 w-2 rounded-[2px] bg-[var(--status-completed)]" />{" "}
          Complete
        </span>
        <span className="flex items-center gap-1">
          <i className="h-2 w-2 rounded-[2px] bg-[var(--status-pending)]" /> In
          progress
        </span>
        <span className="flex items-center gap-1">
          <i className="h-2 w-2 rounded-[2px] bg-[var(--bg-app)] border border-[var(--border-strong)]" />{" "}
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
