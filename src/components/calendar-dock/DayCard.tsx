'use client';

import React from 'react';
import { DaySummary } from '@/lib/engine/types';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export interface DayCardProps {
  summary: DaySummary;
  onSelectDay: (summary: DaySummary) => void;
}

export function DayCard({ summary, onSelectDay }: DayCardProps) {
  const { dayName, dayNumber, monthName, isToday, isPast, totalCount, completedCount, completionPercentage } = summary;

  return (
    <button
      type="button"
      onClick={() => onSelectDay(summary)}
      className={cn(
        'group flex flex-col p-3 rounded-[3px] border text-left transition-all cursor-pointer relative focus:outline-none focus:ring-1 focus:ring-[#5B7FFF]',
        isToday
          ? 'bg-[#1C1F26] border-[#5B7FFF] ring-1 ring-[#5B7FFF]/20'
          : 'bg-[#1C1F26] border-[#2A2E37] hover:border-[#383E4C] hover:bg-[#222630]/60'
      )}
    >
      {/* Card Header: Day & Date */}
      <div className="flex items-center justify-between w-full mb-2">
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-[#8B92A3] uppercase tracking-wider">
            {dayName}
          </span>
          <span className="text-base font-bold text-[#E4E6EB] tabular-nums tracking-tight">
            {dayNumber} <span className="text-xs font-normal text-[#8B92A3]">{monthName}</span>
          </span>
        </div>

        {isToday && (
          <Badge variant="recurring" className="text-[10px] px-1.5 py-0 font-semibold">
            Today
          </Badge>
        )}
        {isPast && (
          <span className="text-[10px] text-[#5C6272] group-hover:text-[#8B92A3]">
            History &rarr;
          </span>
        )}
      </div>

      {/* Progress metrics */}
      <div className="mt-auto pt-2 w-full flex flex-col gap-1">
        <ProgressBar
          completed={completedCount}
          total={totalCount}
          size="sm"
          showPercentage={false}
        />
        <div className="flex items-center justify-between text-[11px] text-[#8B92A3] tabular-nums">
          <span>{totalCount > 0 ? `${completedCount}/${totalCount}` : 'No tasks'}</span>
          <span
            className={cn(
              'font-medium',
              totalCount > 0 && completionPercentage === 100 && 'text-[#3DD68C]',
              totalCount > 0 && completionPercentage > 0 && completionPercentage < 100 && 'text-[#E8B339]'
            )}
          >
            {totalCount > 0 ? `${completionPercentage}%` : '—'}
          </span>
        </div>
      </div>
    </button>
  );
}
