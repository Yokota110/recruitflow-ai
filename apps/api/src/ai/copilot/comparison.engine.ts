import { Injectable } from '@nestjs/common';
import { CandidateComparisonResult, CandidateComparisonRow } from '@recruitflow/shared';

interface CompareInput {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  yearsExperience: number | null;
  skills: { name: string }[];
  applications: {
    matchScore: number | null;
    candidateInsight: { matchScore: number } | null;
  }[];
}

@Injectable()
export class ComparisonEngine {
  compareCandidates(candidates: CompareInput[]): CandidateComparisonResult {
    const rows: CandidateComparisonRow[] = candidates.map((c) => {
      const scores = c.applications
        .map((a) => a.candidateInsight?.matchScore ?? a.matchScore)
        .filter((s): s is number => s != null);
      const matchScore = scores.length > 0 ? Math.max(...scores) : null;
      const years = c.yearsExperience ?? Math.max(1, c.skills.length);

      return {
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        matchScore,
        yearsExperience: years,
        skills: c.skills.slice(0, 4).map((s) => s.name),
        email: c.email,
      };
    });

    if (rows.length === 0) {
      return { candidates: [], recommended: null };
    }

    const sorted = [...rows].sort((a, b) => {
      const scoreA = a.matchScore ?? 0;
      const scoreB = b.matchScore ?? 0;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return b.yearsExperience - a.yearsExperience;
    });

    const best = sorted[0];
    const reasons: string[] = [];

    if (best.matchScore != null) reasons.push(`${best.matchScore}% match score`);
    reasons.push(`${best.yearsExperience} years experience`);
    if (best.skills.length >= 2) reasons.push(`Strong ${best.skills.slice(0, 2).join(' + ')} background`);
    else if (best.skills.length === 1) reasons.push(`Strong ${best.skills[0]} background`);
    reasons.push('Strongest profile among compared candidates');

    return {
      candidates: rows,
      recommended: {
        id: best.id,
        name: best.name,
        reasons: reasons.slice(0, 4),
      },
    };
  }
}
