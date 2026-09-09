"use client";

import React from "react";
import { DaySummary } from "@/lib/engine/types";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export interface DayCardProps {
  summary: DaySummary;
  onSelectDay: (summary: DaySummary) => void;
}

export function DayCard({ summary, onSelectDay }: DayCardProps) {
  const {
    dayName,
    dayNumber,
    monthName,
    isToday,
    isPast,
    totalCount,
    completedCount,
    completionPercentage,
  } = summary;

  return (
    <button
      type="button"
      onClick={() => onSelectDay(summary)}
      className={cn(
        "group flex min-h-[96px] flex-col rounded-[3px] border p-2.5 text-left transition-all cursor-pointer relative focus:outline-none focus:ring-1 focus:ring-[#5B7FFF] lg:min-h-[88px] lg:p-2",
        isToday
          ? "bg-[#1C1F26] border-[#5B7FFF] ring-1 ring-[#5B7FFF]/20"
          : "bg-[#1C1F26] border-[#2A2E37] hover:border-[#383E4C] hover:bg-[#222630]/60",
      )}
    >
      {/* Card Header: Day & Date */}
      <div className="mb-1 flex w-full items-start justify-between gap-1">
        <div className="flex flex-col">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-[#8B92A3]">
            {dayName}
          </span>
          <span className="text-sm font-bold tracking-tight text-[#E4E6EB] tabular-nums">
            {dayNumber}{" "}
            <span className="text-[10px] font-normal text-[#8B92A3]">
              {monthName}
            </span>
          </span>
        </div>

        {isToday && (
          <Badge
            variant="recurring"
            className="px-1 py-0 text-[9px] font-semibold"
          >
            Today
          </Badge>
        )}
        {isPast && (
          <span className="text-[9px] text-[#5C6272] group-hover:text-[#8B92A3]">
            View
          </span>
        )}
      </div>

      {/* Progress metrics */}
      <div className="mt-auto flex w-full flex-col gap-1 pt-1">
        <ProgressBar
          completed={completedCount}
          total={totalCount}
          size="sm"
          showPercentage={false}
        />
        <div className="flex items-center justify-between text-[10px] text-[#8B92A3] tabular-nums">
          <span>
            {totalCount > 0 ? `${completedCount}/${totalCount}` : "No tasks"}
          </span>
          <span
            className={cn(
              "font-medium",
              totalCount > 0 &&
                completionPercentage === 100 &&
                "text-[#3DD68C]",
              totalCount > 0 &&
                completionPercentage > 0 &&
                completionPercentage < 100 &&
                "text-[#E8B339]",
            )}
          >
            {totalCount > 0 ? `${completionPercentage}%` : "—"}
          </span>
        </div>
      </div>
    </button>
  );
}
