import React from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  completed: number;
  total: number;
  showPercentage?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export function ProgressBar({
  completed,
  total,
  showPercentage = true,
  className,
  size = "md",
}: ProgressBarProps) {
  const percentage =
    total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

  // Determine functional status color
  let barColor = "bg-[#2A2E37]";
  if (total > 0) {
    if (percentage === 100) {
      barColor = "bg-[var(--text-green)]";
    } else if (percentage > 0) {
      barColor = "bg-[var(--status-pending)]";
    }
  }

  const heightClass = size === "sm" ? "h-1" : "h-1.5";

  return (
    <div className={cn("flex flex-col gap-1 w-full", className)}>
      <div
        className={cn(
          "w-full bg-[#14161A] rounded-[2px] overflow-hidden border border-[#2A2E37]/60",
          heightClass,
        )}
      >
        <div
          className={cn("h-full transition-all duration-300", barColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <div className="flex justify-between items-center text-[11px] text-[#8B92A3] tabular-nums font-medium">
          <span>
            {completed}/{total} completed
          </span>
          <span
            className={percentage === 100 ? "text-[var(--text-green)]" : ""}
          >
            {percentage}%
          </span>
        </div>
      )}
    </div>
  );
}
