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
        caption_label: "text-sm font-semibold text-[#E4E6EB]",
        nav: "flex items-center gap-1",
        button_previous:
          "inline-flex h-7 w-7 items-center justify-center rounded-[3px] border border-transparent text-[#8B92A3] hover:border-[#383E4C] hover:bg-[#222630] hover:text-[#E4E6EB]",
        button_next:
          "inline-flex h-7 w-7 items-center justify-center rounded-[3px] border border-transparent text-[#8B92A3] hover:border-[#383E4C] hover:bg-[#222630] hover:text-[#E4E6EB]",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "w-9 rounded-[3px] text-center text-[10px] font-semibold uppercase text-[#5C6272]",
        week: "mt-1 flex w-full",
        day: "inline-flex h-9 w-9 items-center justify-center rounded-[3px] text-xs text-[#E4E6EB] hover:bg-[#5B7FFF]/15 hover:text-white",
        day_button: "h-9 w-9",
        selected: "bg-[#5B7FFF] text-white hover:bg-[#4A6EE0] hover:text-white",
        today: "border border-[#5B7FFF]/60 text-[#5B7FFF]",
        outside: "text-[#5C6272] opacity-50",
        disabled: "text-[#5C6272] opacity-40",
        hidden: "invisible",
        chevron: "fill-[#8B92A3]",
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
