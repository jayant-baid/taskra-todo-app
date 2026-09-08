'use client';

import React from 'react';
import { DaySummary, AnalyticsMetrics } from '@/lib/engine/types';
import { WeeklyView } from './WeeklyView';
import { AnalyticsSummary } from './AnalyticsSummary';

export interface CalendarDockProps {
  weekSummaries: DaySummary[];
  analytics: AnalyticsMetrics;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onCurrentWeek: () => void;
  onSelectToday?: () => void;
}

export function CalendarDock({
  weekSummaries,
  analytics,
  onPrevWeek,
  onNextWeek,
  onCurrentWeek,
  onSelectToday,
}: CalendarDockProps) {
  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto pl-1">
      {/* 7-Day Weekly Strip */}
      <WeeklyView
        weekSummaries={weekSummaries}
        onPrevWeek={onPrevWeek}
        onNextWeek={onNextWeek}
        onCurrentWeek={onCurrentWeek}
        onSelectToday={onSelectToday}
      />

      {/* Analytics Summary */}
      <AnalyticsSummary analytics={analytics} />
    </div>
  );
}
