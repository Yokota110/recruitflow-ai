import { Injectable } from '@nestjs/common';
import { HiringRecommendation, CandidateInsightResult, ScoreBreakdown } from '@recruitflow/shared';

interface AnalyzeInput {
  jobTitle: string;
  jobRequirements: string;
  jobDescription: string;
  candidateName: string;
  skills: { name: string; level: number | null }[];
  experiences: { company: string; title: string; isCurrent: boolean }[];
  education: string | null;
  yearsExperience: number | null;
  source: string;
}

const REQUIREMENT_KEYWORDS = [
  'react', 'typescript', 'node', 'python', 'java', 'aws', 'docker', 'kubernetes',
  'postgresql', 'graphql', 'leadership', 'agile', 'sql', 'go', 'rust', 'figma',
  'product', 'marketing', 'sales', 'machine learning', 'data', 'communication',
];

const STRENGTH_POOL = [
  'Strong technical foundation with modern stack expertise',
  'Demonstrated leadership in cross-functional teams',
  'Excellent communication and stakeholder management',
  'Track record of shipping products on aggressive timelines',
  'Deep domain expertise relevant to the role',
  'Proven mentoring and team development experience',
  'Experience scaling systems in high-growth environments',
  'Strong problem-solving and analytical capabilities',
  'Startup agility combined with process discipline',
  'AWS/cloud infrastructure certification and hands-on experience',
];

const WEAKNESS_POOL = [
  'Limited backend or full-stack depth for this role',
  'No prior enterprise SaaS or B2B experience',
  'Gap in employment history requiring clarification',
  'Missing formal certifications mentioned in requirements',
  'Primarily agency/contract work — limited long-term ownership',
  'Limited experience with the specific tech stack required',
  'Seniority level may be below what the role demands',
  'No demonstrated experience in a remote-first environment',
];

const QUESTION_POOL = [
  'Walk me through the most complex project you led from conception to delivery.',
  'How do you prioritize competing demands from multiple stakeholders?',
  'Describe a technical disagreement you had with a teammate and how you resolved it.',
  'What metrics do you use to measure success in your current role?',
  'Tell me about a time you had to learn a new technology under a tight deadline.',
  'How would you approach your first 30 days in this position?',
  'Describe a situation where you failed and what you learned from it.',
  'How do you mentor junior team members while maintaining delivery velocity?',
  'What interests you most about this role and our company specifically?',
  'How do you handle ambiguous requirements with incomplete information?',
];

@Injectable()
export class IntelligenceEngine {
  async analyze(input: AnalyzeInput): Promise<CandidateInsightResult> {
    await new Promise((r) => setTimeout(r, 600));

    const reqText = `${input.jobRequirements} ${input.jobDescription}`.toLowerCase();
    const candidateSkills = input.skills.map((s) => s.name.toLowerCase());

    const requiredSkills = REQUIREMENT_KEYWORDS.filter((kw) => reqText.includes(kw));
    const matchedSkills = requiredSkills.filter((kw) =>
      candidateSkills.some((cs) => cs.includes(kw) || kw.includes(cs)),
    );
    const skillOverlapScore = requiredSkills.length > 0
      ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
      : Math.min(85, 50 + candidateSkills.length * 5);

    const years = input.yearsExperience ?? this.estimateYears(input.experiences);
    const requiredYears = this.extractRequiredYears(reqText);
    const experienceScore = requiredYears > 0
      ? Math.min(100, Math.round((years / requiredYears) * 100))
      : Math.min(100, years * 12);

    const educationScore = input.education
      ? (input.education.toLowerCase().includes('master') ? 95
        : input.education.toLowerCase().includes('bachelor') ? 80 : 65)
      : 55;

    const avgSkillLevel = input.skills.length > 0
      ? input.skills.reduce((s, sk) => s + (sk.level ?? 3), 0) / input.skills.length
      : 2.5;
    const seniorityScore = Math.min(100, Math.round((years * 8) + (avgSkillLevel * 10)));

    const matchScore = Math.round(
      skillOverlapScore * 0.35 +
      experienceScore * 0.25 +
      educationScore * 0.15 +
      seniorityScore * 0.25,
    );

    const recommendation = this.getRecommendation(matchScore);
    const hash = input.candidateName.split('').reduce((a, c) => a + c.charCodeAt(0), 0);

    const strengths = this.pick(STRENGTH_POOL, 3 + (hash % 2), hash);
    if (matchedSkills.length > 0) {
      strengths.unshift(`Strong ${matchedSkills.slice(0, 2).map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' & ')} expertise`);
    }

    const weaknesses = this.pick(WEAKNESS_POOL, 2 + (hash % 2), hash + 1);
    const interviewQuestions = this.pick(QUESTION_POOL, 5, hash + 2);

    const scoreBreakdown: ScoreBreakdown = {
      skillOverlap: skillOverlapScore,
      experience: experienceScore,
      education: educationScore,
      seniority: seniorityScore,
    };

    const skillsSummary = this.buildSummary(input.candidateName, input.jobTitle, matchScore, scoreBreakdown, matchedSkills);

    return {
      matchScore,
      scoreBreakdown,
      skillsSummary,
      strengths: strengths.slice(0, 4),
      weaknesses: weaknesses.slice(0, 3),
      recommendation,
      interviewQuestions,
      provider: 'intelligence-engine',
    };
  }

  private getRecommendation(score: number): HiringRecommendation {
    if (score >= 85) return HiringRecommendation.STRONG_HIRE;
    if (score >= 70) return HiringRecommendation.HIRE;
    if (score >= 55) return HiringRecommendation.CONSIDER;
    return HiringRecommendation.REJECT;
  }

  private estimateYears(experiences: { startDate?: Date; isCurrent: boolean }[]): number {
    return Math.max(1, experiences.length * 2);
  }

  private extractRequiredYears(text: string): number {
    const match = text.match(/(\d+)\+?\s*years?/i);
    return match ? parseInt(match[1], 10) : 3;
  }

  private pick<T>(arr: T[], count: number, seed: number): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = (seed + i) % (i + 1);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, count);
  }

  private buildSummary(
    name: string,
    jobTitle: string,
    score: number,
    breakdown: ScoreBreakdown,
    matched: string[],
  ): string {
    const tier = score >= 80 ? 'strong' : score >= 65 ? 'solid' : score >= 50 ? 'moderate' : 'limited';
    const skills = matched.length > 0 ? matched.slice(0, 3).join(', ') : 'general competencies';
    return `${name} presents a ${tier} fit for the ${jobTitle} role with an overall match score of ${score}/100. Skill overlap is ${breakdown.skillOverlap}%, experience alignment ${breakdown.experience}%, and seniority score ${breakdown.seniority}%. Key matching competencies include ${skills}. ${score >= 70 ? 'Recommended to advance to interview stage.' : score >= 55 ? 'Worth considering with targeted screening.' : 'Significant gaps suggest careful evaluation before proceeding.'}`;
  }
}
