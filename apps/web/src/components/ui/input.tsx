import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-xl border border-[#D9D3C7] bg-[#FFFCF7] px-3.5 py-1 text-sm',
        'text-[#1A1814] placeholder:text-[#9C958A]',
        'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8653A]/30 focus-visible:border-[#E8653A]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[88px] w-full rounded-xl border border-[#D9D3C7] bg-[#FFFCF7] px-3.5 py-2.5 text-sm',
      'text-[#1A1814] placeholder:text-[#9C958A]',
      'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8653A]/30 focus-visible:border-[#E8653A]',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'flex h-10 w-full rounded-xl border border-[#D9D3C7] bg-[#FFFCF7] px-3.5 py-1 text-sm text-[#1A1814]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8653A]/30 focus-visible:border-[#E8653A]',
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = 'Select';

export const Label = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <label className={cn('text-xs font-semibold text-[#5C574F] uppercase tracking-wider mb-1.5 block', className)}>
    {children}
  </label>
);
