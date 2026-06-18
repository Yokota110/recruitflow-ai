import { cn } from '@/lib/utils';

export function Card({
  className,
  children,
  style,
}: {
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={style}
      className={cn(
        'rounded-2xl border border-[#E8E2D9] bg-[#FFFCF7]',
        'shadow-[0_1px_3px_rgba(15,20,25,0.05),0_4px_16px_rgba(15,20,25,0.03)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('px-6 py-4 border-b border-[#F0EBE3]', className)}>
      {children}
    </div>
  );
}

export function CardContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn('px-6 py-5', className)}>{children}</div>;
}

export function CardTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <h3 className={cn('font-display text-sm font-semibold text-[#1A1814] tracking-tight', className)}>
      {children}
    </h3>
  );
}
