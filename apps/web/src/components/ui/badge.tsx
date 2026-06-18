import { cn } from '@/lib/utils';

const variants: Record<string, string> = {
  default: 'bg-[#F0EBE3] text-[#5C574F] border border-[#E8E2D9]',
  primary: 'bg-[#FDF0EB] text-[#C4522A] border border-[#F5D5C8]',
  success: 'bg-[#EBF7F3] text-[#2D8A6E] border border-[#C2E8DC]',
  warning: 'bg-[#FBF5E8] text-[#9A7B2E] border border-[#EDE0C0]',
  danger: 'bg-[#FBEEEE] text-[#C45C5C] border border-[#F0D0D0]',
  outline: 'border border-[#D9D3C7] text-[#6B6560] bg-[#FFFCF7]',
  teal: 'bg-[#EBF7F3] text-[#2D7A68] border border-[#C2E8DC]',
};

export function Badge({
  children,
  variant = 'default',
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

const AVATAR_PALETTE = [
  'bg-[#FDF0EB] text-[#C4522A] ring-1 ring-[#F5D5C8]',
  'bg-[#EBF7F3] text-[#2D7A68] ring-1 ring-[#C2E8DC]',
  'bg-[#EDF3FD] text-[#3D6BB5] ring-1 ring-[#C8D9F5]',
  'bg-[#FBF5E8] text-[#9A7B2E] ring-1 ring-[#EDE0C0]',
  'bg-[#F5EDF8] text-[#7B4FA0] ring-1 ring-[#E0CEEB]',
];

export function Avatar({
  name,
  src,
  size = 'md',
}: {
  name: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizes = { sm: 'h-7 w-7 text-[10px]', md: 'h-9 w-9 text-xs', lg: 'h-12 w-12 text-sm' };
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const colorIndex = name.charCodeAt(0) % AVATAR_PALETTE.length;

  if (src) {
    return (
      <div
        className={cn('rounded-full bg-cover bg-center ring-2 ring-[#FFFCF7]', sizes[size])}
        style={{ backgroundImage: `url(${src})` }}
        role="img"
        aria-label={name}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold',
        sizes[size],
        AVATAR_PALETTE[colorIndex],
      )}
    >
      {initials}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-gradient-to-r from-[#E8E2D9] via-[#F0EBE3] to-[#E8E2D9] bg-[length:200%_100%]',
        className,
      )}
    />
  );
}
