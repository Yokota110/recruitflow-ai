'use client';

import { TagDto } from '@recruitflow/shared';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export function TagBadge({ tag, onRemove }: { tag: TagDto; onRemove?: () => void }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border"
      style={{ background: `${tag.color}15`, color: tag.color, borderColor: `${tag.color}40` }}
    >
      {tag.name}
      {onRemove && (
        <button onClick={onRemove} className="hover:opacity-70">
          <X className="h-2.5 w-2.5" />
        </button>
      )}
    </span>
  );
}

export function TagFilterBar({
  tags,
  selected,
  onSelect,
}: {
  tags: TagDto[];
  selected: string | null;
  onSelect: (tag: string | null) => void;
}) {
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          'text-xs px-3 py-1 rounded-full border transition-colors',
          !selected ? 'bg-[#E8653A] text-white border-[#E8653A]' : 'border-[#E8E2D9] text-[#6B6560] hover:border-[#E8653A]/40',
        )}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag.id}
          onClick={() => onSelect(tag.name)}
          className={cn(
            'text-xs px-3 py-1 rounded-full border transition-colors',
            selected === tag.name ? 'text-white border-transparent' : 'border-[#E8E2D9] text-[#6B6560] hover:border-[#E8653A]/40',
          )}
          style={selected === tag.name ? { background: tag.color, borderColor: tag.color } : undefined}
        >
          {tag.name}
        </button>
      ))}
    </div>
  );
}
