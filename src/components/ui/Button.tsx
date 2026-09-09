import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "danger-ghost";
  size?: "sm" | "md" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "secondary",
      size = "md",
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-primary)]/40 disabled:opacity-50 disabled:pointer-events-none select-none text-[13px] tracking-tight cursor-pointer";

    const variantClasses = {
      primary:
        "bg-[var(--accent-primary)] !text-white hover:bg-[var(--accent-primary-strong)] active:bg-[var(--accent-primary-strong)] border border-[var(--accent-primary)] shadow-[0_6px_16px_rgba(91,127,255,0.22)]",
      secondary:
        "bg-[var(--bg-surface)] !text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] shadow-[0_1px_0_rgba(15,23,42,0.02)]",
      ghost:
        "bg-transparent !text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] border border-transparent",
      danger:
        "bg-[var(--status-danger)] !text-white hover:bg-[#e05a5a] border border-[var(--status-danger)]",
      "danger-ghost":
        "bg-transparent !text-[var(--status-danger)] hover:bg-[rgba(255,107,107,0.12)] border border-transparent hover:border-[rgba(255,107,107,0.28)]",
    };

    const sizeClasses = {
      sm: "h-7 px-2.5 rounded-[3px] text-xs gap-1.5",
      md: "h-8 px-3 rounded-[3px] gap-2",
      icon: "h-7 w-7 rounded-[3px] p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
