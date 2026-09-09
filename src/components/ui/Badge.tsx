import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "neutral" | "recurring" | "completed" | "pending" | "danger";
}

export function Badge({
  className,
  variant = "neutral",
  children,
  ...props
}: BadgeProps) {
  const baseClasses =
    "inline-flex items-center px-1.5 py-0.5 text-[11px] font-medium rounded-[2px] tracking-tight tabular-nums select-none border";

  const variantClasses = {
    neutral: "bg-[#222630] text-[#8B92A3] border-[#2A2E37]",
    recurring:
      "bg-[rgba(91,127,255,0.12)] text-[#5B7FFF] border-[rgba(91,127,255,0.25)]",
    completed:
      "bg-[rgba(61,214,140,0.12)] text-[var(--text-green)] border-[rgba(61,214,140,0.25)]",
    pending:
      "bg-[rgba(232,179,57,0.12)] text-[var(--status-pending)] border-[rgba(232,179,57,0.25)]",
    danger:
      "bg-[rgba(255,107,107,0.12)] text-[#FF6B6B] border-[rgba(255,107,107,0.25)]",
  };

  return (
    <span
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}
