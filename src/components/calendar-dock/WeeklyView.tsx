"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { DaySummary } from "@/lib/engine/types";
import { DayCard } from "./DayCard";
import { PastDayModal } from "./PastDayModal";
import { Button } from "@/components/ui/Button";
import { ProgressSummaryCards } from "./ProgressSummaryCards";

export interface WeeklyViewProps {
  weekSummaries: DaySummary[];
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onCurrentWeek: () => void;
  onSelectToday?: () => void;
  currentStreak: number;
  bestStreak: number;
}

export function WeeklyView({
  weekSummaries,
  onPrevWeek,
  onNextWeek,
  onCurrentWeek,
  onSelectToday,
  currentStreak,
  bestStreak,
}: WeeklyViewProps) {
  const [selectedPastDay, setSelectedPastDay] = useState<DaySummary | null>(
    null,
  );
  const firstDay = weekSummaries[0];
  const lastDay = weekSummaries[weekSummaries.length - 1];
  const totalTasks = weekSummaries.reduce(
    (total, summary) => total + summary.totalCount,
    0,
  );
  const completedTasks = weekSummaries.reduce(
    (total, summary) => total + summary.completedCount,
    0,
  );
  const perfectDays = weekSummaries.filter(
    (summary) =>
      summary.totalCount > 0 && summary.completedCount === summary.totalCount,
  ).length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const handleSelectDay = (summary: DaySummary) => {
    if (summary.isPast) {
      setSelectedPastDay(summary);
    } else if (summary.isToday && onSelectToday) {
      onSelectToday();
    } else {
      // Future day view or past day view
      setSelectedPastDay(summary);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Weekly Header & Controls */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <CalendarIcon size={16} className="text-[#5B7FFF]" />
          <h3 className="text-sm font-semibold text-[#E4E6EB] tracking-tight">
            Weekly Progress
          </h3>
          {firstDay && lastDay && (
            <span className="hidden sm:inline text-xs text-[#8B92A3]">
              {firstDay.monthName} {firstDay.dayNumber} – {lastDay.monthName}{" "}
              {lastDay.dayNumber}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={onCurrentWeek}
            className="h-7 text-[11px]"
          >
            Current Week
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevWeek}
            title="Previous Week"
            className="h-7 w-7"
          >
            <ChevronLeft size={15} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextWeek}
            title="Next Week"
            className="h-7 w-7"
          >
            <ChevronRight size={15} />
          </Button>
        </div>
      </div>

      <ProgressSummaryCards
        completionRate={completionRate}
        perfectDays={perfectDays}
        completedTasks={completedTasks}
        periodLabel="weekly"
        currentStreak={currentStreak}
        bestStreak={bestStreak}
      />

      {/* 7-Day Grid */}
      <div className="grid grid-cols-2 gap-2 min-[480px]:grid-cols-4 lg:grid-cols-7 lg:gap-1.5">
        {weekSummaries.map((daySummary) => (
          <DayCard
            key={daySummary.date}
            summary={daySummary}
            onSelectDay={handleSelectDay}
          />
        ))}
      </div>

      {/* Read-Only History Modal */}
      <PastDayModal
        daySummary={selectedPastDay}
        onClose={() => setSelectedPastDay(null)}
      />
    </div>
  );
}
