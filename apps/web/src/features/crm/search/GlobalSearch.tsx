'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { globalSearch } from '../services/crm.service';
import { Search, User, Briefcase } from 'lucide-react';

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  const { data } = useQuery({
    queryKey: ['search', debounced],
    queryFn: () => globalSearch(debounced),
    enabled: debounced.length >= 2,
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const hasResults = data && (data.candidates.length > 0 || data.jobs.length > 0);
  const showDropdown = open && debounced.length >= 2;

  return (
    <div ref={ref} className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9C958A]" />
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Search name, skill, company, email..."
        className="w-full h-8 pl-9 pr-3 text-xs rounded-lg bg-[#F5F1EA] border border-[#E8E2D9] text-[#1A1814] placeholder:text-[#9C958A] focus:outline-none focus:ring-2 focus:ring-[#E8653A]/20 focus:border-[#E8653A]/40"
      />
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#FFFCF7] border border-[#E8E2D9] rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
          {!hasResults ? (
            <p className="text-xs text-[#9C958A] p-4 text-center">No results for &ldquo;{debounced}&rdquo;</p>
          ) : (
            <>
              {data!.candidates.length > 0 && (
                <div className="p-2">
                  <p className="text-[10px] font-semibold text-[#9C958A] uppercase tracking-wider px-2 py-1">Candidates</p>
                  {data!.candidates.map((c) => (
                    <Link
                      key={c.id}
                      href={`/candidates/${c.id}`}
                      onClick={() => { setOpen(false); setQuery(''); }}
                      className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-[#F5F1EA] transition-colors"
                    >
                      <User className="h-3.5 w-3.5 text-[#E8653A]" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#1A1814] truncate">{c.name}</p>
                        <p className="text-[10px] text-[#9C958A] truncate">
                          {[c.email, c.company, c.location].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {data!.jobs.length > 0 && (
                <div className="p-2 border-t border-[#F0EBE3]">
                  <p className="text-[10px] font-semibold text-[#9C958A] uppercase tracking-wider px-2 py-1">Jobs</p>
                  {data!.jobs.map((j) => (
                    <Link
                      key={j.id}
                      href={`/jobs/${j.id}`}
                      onClick={() => { setOpen(false); setQuery(''); }}
                      className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-[#F5F1EA] transition-colors"
                    >
                      <Briefcase className="h-3.5 w-3.5 text-[#5B8DEF]" />
                      <div>
                        <p className="text-xs font-semibold text-[#1A1814]">{j.title}</p>
                        <p className="text-[10px] text-[#9C958A]">{j.department}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
