import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-20 w-full resize-none rounded-[3px] border border-[#2A2E37] bg-[#14161A] px-3 py-2 text-sm text-[#E4E6EB] outline-none placeholder:text-[#5C6272] transition-colors focus:border-[#5B7FFF] focus:ring-1 focus:ring-[#5B7FFF]/30 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";
