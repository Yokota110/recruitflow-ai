'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { getMatchScoreColor } from '@/lib/utils';
import type { CandidateComparisonResult } from '../types';

export function CandidateComparisonTable({ data }: { data: CandidateComparisonResult }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F0EBE3] text-left">
                <th className="px-4 py-3 text-[10px] font-semibold text-[#9C958A] uppercase tracking-wider">Candidate</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-[#9C958A] uppercase tracking-wider">Match</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-[#9C958A] uppercase tracking-wider">Experience</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-[#9C958A] uppercase tracking-wider">Skills</th>
              </tr>
            </thead>
            <tbody>
              {data.candidates.map((c) => (
                <tr key={c.id} className="border-b border-[#F0EBE3] hover:bg-[#FAFAF8]">
                  <td className="px-4 py-3 font-medium text-[#1A1814]">{c.name}</td>
                  <td className="px-4 py-3">
                    {c.matchScore != null ? (
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${getMatchScoreColor(c.matchScore)}`}>
                        {c.matchScore}%
                      </span>
                    ) : (
                      <span className="text-xs text-[#9C958A]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-[#6B6560]">{c.yearsExperience}y</td>
                  <td className="px-4 py-3 text-[#6B6560] text-xs">{c.skills.join(', ') || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {data.recommended && (
        <Card className="border-[#C2E8DC] bg-[#EBF7F3]/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-[#2D8A6E]">
              <Trophy className="h-4 w-4" />
              Recommended Candidate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-xl font-bold text-[#1A1814]">{data.recommended.name}</p>
            <ul className="mt-3 space-y-1">
              {data.recommended.reasons.map((r) => (
                <li key={r} className="text-xs text-[#6B6560] flex gap-1.5">
                  <span className="text-[#2D8A6E]">•</span>{r}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
