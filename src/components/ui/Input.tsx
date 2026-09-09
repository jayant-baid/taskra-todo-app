import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, type, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "flex h-9 w-full rounded-[3px] border border-[#2A2E37] bg-[#14161A] px-3 py-2 text-sm text-[#E4E6EB] outline-none placeholder:text-[#5C6272] transition-colors focus:border-[#5B7FFF] focus:ring-1 focus:ring-[#5B7FFF]/30 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));

Input.displayName = "Input";
