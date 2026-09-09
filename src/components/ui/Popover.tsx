"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;

export function PopoverContent({
  className = "",
  align = "start",
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={`z-50 rounded-[6px] border border-[#383E4C] bg-[#1C1F26] p-3 text-[#E4E6EB] shadow-2xl outline-none animate-in fade-in zoom-in-95 ${className}`}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}
