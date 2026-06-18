import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, ...props }, ref) => {
    const variants = {
      primary:
        'bg-[#E8653A] text-white hover:bg-[#D4562E] shadow-[0_2px_8px_rgba(232,101,58,0.35)] active:scale-[0.98]',
      secondary:
        'bg-[#0F1419] text-[#FFFCF7] hover:bg-[#1A2229] shadow-sm active:scale-[0.98]',
      ghost: 'text-[#6B6560] hover:bg-[#F0EBE3] hover:text-[#1A1814]',
      danger: 'bg-[#C45C5C] text-white hover:bg-[#B04E4E] active:scale-[0.98]',
      outline:
        'border border-[#D9D3C7] bg-[#FFFCF7] text-[#1A1814] hover:bg-[#F5F1EA] hover:border-[#C4BDB3]',
    };
    const sizes = {
      sm: 'h-8 px-3 text-xs rounded-lg',
      md: 'h-9 px-4 text-sm rounded-xl',
      lg: 'h-11 px-6 text-sm rounded-xl font-semibold',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8653A] focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';
