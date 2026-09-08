import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-ghost';
  size?: 'sm' | 'md' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', children, disabled, ...props }, ref) => {
    const baseClasses =
      'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5B7FFF] disabled:opacity-50 disabled:pointer-events-none select-none text-[13px] tracking-tight cursor-pointer';

    const variantClasses = {
      primary:
        'bg-[#5B7FFF] text-white hover:bg-[#4a6ee0] active:bg-[#3d5fc4] border border-[#5B7FFF]',
      secondary:
        'bg-[#1C1F26] text-[#E4E6EB] hover:bg-[#222630] border border-[#2A2E37] hover:border-[#383E4C]',
      ghost:
        'bg-transparent text-[#8B92A3] hover:text-[#E4E6EB] hover:bg-[#222630] border border-transparent',
      danger:
        'bg-[#FF6B6B] text-white hover:bg-[#e05a5a] border border-[#FF6B6B]',
      'danger-ghost':
        'bg-transparent text-[#FF6B6B] hover:bg-[rgba(255,107,107,0.12)] border border-transparent hover:border-[rgba(255,107,107,0.3)]',
    };

    const sizeClasses = {
      sm: 'h-7 px-2.5 rounded-[3px] text-xs gap-1.5',
      md: 'h-8 px-3 rounded-[3px] gap-2',
      icon: 'h-7 w-7 rounded-[3px] p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
