import { Injectable } from '@nestjs/common';
import { CandidateSummary } from '@recruitflow/shared';

interface SummaryInput {
  firstName: string;
  lastName: string;
  yearsExperience: number | null;
  education: string | null;
  skills: { name: string; level: number | null }[];
  experiences: { title: string; company: string; isCurrent: boolean }[];
  applications: { job: { title: string; department: string } }[];
}

@Injectable()
export class SummaryEngine {
  generateCandidateSummary(input: SummaryInput): CandidateSummary {
    const name = `${input.firstName} ${input.lastName}`;
    const years = input.yearsExperience ?? Math.max(1, input.experiences.length * 2);
    const primaryTitle = input.experiences[0]?.title ?? 'Professional';
    const topSkills = input.skills.slice(0, 6).map((s) => s.name);
    const jobTitles = [...new Set(input.applications.map((a) => a.job.title))];
    const fitRole = jobTitles[0] ?? `${primaryTitle} roles`;

    const saasExp = input.experiences.some(
      (e) => e.company.toLowerCase().includes('saas') || e.title.toLowerCase().includes('product'),
    );

    const potentialStrengths = [
      topSkills.some((s) => /react|frontend|ui/i.test(s)) ? 'Frontend architecture' : 'Technical depth',
      input.experiences.length >= 3 ? 'Product ownership' : 'Adaptability',
      'Communication',
      saasExp ? 'SaaS product experience' : 'Cross-functional collaboration',
    ].slice(0, 3);

    const potentialConcerns = [
      !input.skills.some((s) => /devops|aws|docker|kubernetes/i.test(s.name)) ? 'Limited DevOps exposure' : null,
      years < 5 ? 'Limited senior-level tenure' : null,
      !input.experiences.some((e) => e.title.toLowerCase().includes('lead') || e.title.toLowerCase().includes('manager'))
        ? 'No team leadership history'
        : null,
    ].filter(Boolean) as string[];

    const professionalSummary =
      `${name} is a ${primaryTitle} with ${years} years of experience ` +
      `${saasExp ? 'building SaaS applications' : 'across modern technology teams'}.`;

    const fitAssessment =
      `Candidate appears to be a ${years >= 5 ? 'strong' : 'moderate'} fit for ${fitRole} positions.`;

    return {
      headline: `${name} · ${years}y experience`,
      professionalSummary,
      strongExpertise: topSkills.length > 0 ? topSkills : ['General software development'],
      fitAssessment,
      potentialStrengths,
      potentialConcerns: potentialConcerns.length > 0 ? potentialConcerns : ['No major concerns identified'],
      provider: 'copilot-summary-engine',
    };
  }
}
