"use client";

import React, { useState } from "react";
import { CalendarDays, CalendarRange } from "lucide-react";
import { DaySummary, AnalyticsMetrics } from "@/lib/engine/types";
import { WeeklyView } from "./WeeklyView";
import { MonthlyView } from "./MonthlyView";
import { AnalyticsSummary } from "./AnalyticsSummary";
import { Button } from "@/components/ui/Button";

export interface CalendarDockProps {
  weekSummaries: DaySummary[];
  analytics: AnalyticsMetrics;
  activeMonthStr: string;
  monthlyData: (DaySummary | null)[];
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onCurrentWeek: () => void;
  onSelectToday?: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onCurrentMonth: () => void;
}

export function CalendarDock({
  weekSummaries,
  analytics,
  activeMonthStr,
  monthlyData,
  onPrevWeek,
  onNextWeek,
  onCurrentWeek,
  onSelectToday,
  onPrevMonth,
  onNextMonth,
  onCurrentMonth,
}: CalendarDockProps) {
  const [view, setView] = useState<"week" | "month">("week");

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto pl-1">
      <div className="flex items-center justify-between border-b border-[#2A2E37] pb-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5C6272]">
            Progress cockpit
          </p>
          <h2 className="mt-1 text-base font-semibold tracking-tight text-[#E4E6EB]">
            Review your rhythm
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-1 rounded-[4px] border border-[#2A2E37] bg-[#14161A] p-1">
          <Button
            variant={view === "week" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("week")}
            className="h-7 gap-1.5 px-2 text-[11px]"
          >
            <CalendarRange size={13} />
            Week
          </Button>
          <Button
            variant={view === "month" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("month")}
            className="h-7 gap-1.5 px-2 text-[11px]"
          >
            <CalendarDays size={13} />
            Month
          </Button>
        </div>
      </div>

      {view === "week" ? (
        <WeeklyView
          weekSummaries={weekSummaries}
          onPrevWeek={onPrevWeek}
          onNextWeek={onNextWeek}
          onCurrentWeek={onCurrentWeek}
          onSelectToday={onSelectToday}
          currentStreak={analytics.currentStreak}
          bestStreak={analytics.bestStreak}
        />
      ) : (
        <MonthlyView
          monthStr={activeMonthStr}
          monthCells={monthlyData}
          onPrevMonth={onPrevMonth}
          onNextMonth={onNextMonth}
          onCurrentMonth={onCurrentMonth}
          currentStreak={analytics.currentStreak}
          bestStreak={analytics.bestStreak}
        />
      )}

      {/* <AnalyticsSummary analytics={analytics} /> */}
    </div>
  );
}
