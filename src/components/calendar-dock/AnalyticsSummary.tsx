"use client";

import React from "react";
import {
  Flame,
  TrendingUp,
  RefreshCw,
  Layers,
  CheckCircle,
} from "lucide-react";
import { AnalyticsMetrics } from "@/lib/engine/types";

export interface AnalyticsSummaryProps {
  analytics: AnalyticsMetrics;
}

export function AnalyticsSummary({ analytics }: AnalyticsSummaryProps) {
  const {
    currentStreak,
    bestStreak,
    completionRate7d,
    completionRate30d,
    totalActiveTasks,
    recurringCount,
    carryOverCount,
  } = analytics;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <TrendingUp size={16} className="text-[#3DD68C]" />
        <h3 className="text-sm font-semibold text-[#E4E6EB] tracking-tight">
          Performance Analytics
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {/* Metric 1: Current Streak */}
        <div className="p-3 bg-[#1C1F26] border border-[#2A2E37] rounded-[3px] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8B92A3] mb-1">
            <span className="text-[11px] font-medium">Daily Streak</span>
            <Flame
              size={14}
              className={
                currentStreak > 0 ? "text-[#E8B339]" : "text-[#5C6272]"
              }
            />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-[#E4E6EB] tabular-nums tracking-tight">
              {currentStreak}
            </span>
            <span className="text-xs text-[#8B92A3]">days (50%+)</span>
          </div>
          <div className="mt-1 text-[10px] text-[#5C6272] tabular-nums">
            Best streak: {bestStreak}d
          </div>
        </div>

        {/* Metric 2: 7-Day Completion Rate */}
        <div className="p-3 bg-[#1C1F26] border border-[#2A2E37] rounded-[3px] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8B92A3] mb-1">
            <span className="text-[11px] font-medium">7-Day Rate</span>
            <CheckCircle size={14} className="text-[#3DD68C]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-[#3DD68C] tabular-nums tracking-tight">
              {completionRate7d}%
            </span>
            <span className="text-xs text-[#8B92A3]">completed</span>
          </div>
          <div className="mt-1 text-[10px] text-[#5C6272] tabular-nums">
            30-day avg: {completionRate30d}%
          </div>
        </div>

        {/* Metric 3: Recurring Tasks */}
        <div className="p-3 bg-[#1C1F26] border border-[#2A2E37] rounded-[3px] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8B92A3] mb-1">
            <span className="text-[11px] font-medium">Active Recurring</span>
            <RefreshCw size={13} className="text-[#5B7FFF]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-[#5B7FFF] tabular-nums tracking-tight">
              {recurringCount}
            </span>
            <span className="text-xs text-[#8B92A3]">routines</span>
          </div>
          <div className="mt-1 text-[10px] text-[#5C6272]">
            Total definitions: {totalActiveTasks}
          </div>
        </div>

        {/* Metric 4: Carry-overs */}
        <div className="p-3 bg-[#1C1F26] border border-[#2A2E37] rounded-[3px] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8B92A3] mb-1">
            <span className="text-[11px] font-medium">Rolled Forward</span>
            <Layers
              size={14}
              className={
                carryOverCount > 0 ? "text-[#E8B339]" : "text-[#5C6272]"
              }
            />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-xl font-bold tabular-nums tracking-tight ${
                carryOverCount > 0 ? "text-[#E8B339]" : "text-[#E4E6EB]"
              }`}
            >
              {carryOverCount}
            </span>
            <span className="text-xs text-[#8B92A3]">pending</span>
          </div>
          <div className="mt-1 text-[10px] text-[#5C6272]">
            Persistent daily tasks
          </div>
        </div>
      </div>
    </div>
  );
}
