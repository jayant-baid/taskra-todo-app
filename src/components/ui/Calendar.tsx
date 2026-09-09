"use client";

import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Calendar({
  className,
  classNames,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays
      className={cn("p-1", className)}
      classNames={{
        months: "flex flex-col",
        month: "space-y-3",
        month_caption: "flex items-center justify-between px-1",
        caption_label: "text-sm font-semibold text-[var(--text-primary)]",
        nav: "flex items-center gap-1",
        button_previous:
          "inline-flex h-7 w-7 items-center justify-center rounded-[3px] border border-transparent text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)]",
        button_next:
          "inline-flex h-7 w-7 items-center justify-center rounded-[3px] border border-transparent text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)]",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "w-9 rounded-[3px] text-center text-[10px] font-semibold uppercase text-[var(--text-secondary)]",
        week: "mt-1 flex w-full",
        day: "inline-flex h-9 w-9 items-center justify-center rounded-[3px] text-xs text-[var(--text-primary)] hover:bg-[var(--accent-subtle)] hover:text-[var(--text-primary)]",
        day_button: "h-9 w-9",
        selected:
          "!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-primary-strong)] hover:!text-white",
        today:
          "border border-[var(--accent-primary)]/60 text-[var(--accent-primary)]",
        outside: "text-[var(--text-muted)] opacity-60",
        disabled: "text-[var(--text-muted)] opacity-40",
        hidden: "invisible",
        chevron: "fill-[var(--text-secondary)]",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft size={15} />
          ) : (
            <ChevronRight size={15} />
          ),
      }}
      {...props}
    />
  );
}
