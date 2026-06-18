import { Injectable } from '@nestjs/common';
import { ParsedResume } from '@recruitflow/shared';

const MOCK_PROFILES = [
  {
    firstName: 'Ashley',
    lastName: 'Davis',
    email: 'ashley.davis@email.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    linkedinUrl: 'https://linkedin.com/in/ashleydavis',
    education: "Bachelor's in Computer Science, Stanford University",
    yearsExperience: 6,
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'GraphQL', 'AWS'],
    experiences: [
      { company: 'TechFlow SaaS', title: 'Senior Frontend Engineer', years: 3, current: true },
      { company: 'StartupHub', title: 'Frontend Developer', years: 2, current: false },
      { company: 'Digital Agency Co', title: 'Junior Developer', years: 1, current: false },
    ],
  },
  {
    firstName: 'Marcus',
    lastName: 'Chen',
    email: 'marcus.chen@email.com',
    phone: '+1 (555) 876-5432',
    location: 'Austin, TX',
    linkedinUrl: 'https://linkedin.com/in/marcuschen',
    education: "Master's in Software Engineering, MIT",
    yearsExperience: 8,
    skills: ['Python', 'Django', 'AWS', 'Docker', 'PostgreSQL', 'Redis'],
    experiences: [
      { company: 'CloudScale Inc', title: 'Staff Backend Engineer', years: 4, current: true },
      { company: 'DataPipe', title: 'Backend Engineer', years: 3, current: false },
    ],
  },
];

/**
 * Mock resume parser — structured for future OpenAI integration.
 * Replace `parseBuffer` body with OpenAI API call when ready.
 */
@Injectable()
export class ResumeParserEngine {
  async parseResume(fileName: string, buffer?: Buffer): Promise<ParsedResume> {
    await new Promise((r) => setTimeout(r, 800));
    void buffer;

    const hash = fileName.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const profile = MOCK_PROFILES[hash % MOCK_PROFILES.length];

    const now = new Date();
    const experiences = profile.experiences.map((exp, idx) => {
      const end = exp.current ? null : new Date(now.getFullYear() - idx * 2, 5, 1);
      const start = new Date(
        (end ?? now).getFullYear() - exp.years,
        end ? 5 : now.getMonth(),
        1,
      );
      return {
        company: exp.company,
        title: exp.title,
        startDate: start.toISOString(),
        endDate: end?.toISOString() ?? null,
        isCurrent: exp.current,
        description: `Led key initiatives at ${exp.company} as ${exp.title}.`,
      };
    });

    return {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      linkedinUrl: profile.linkedinUrl,
      education: profile.education,
      yearsExperience: profile.yearsExperience,
      skills: profile.skills.map((name, i) => ({ name, level: 4 - (i % 2) })),
      experiences,
      summary: `${profile.firstName} ${profile.lastName} is an experienced ${profile.experiences[0].title} with ${profile.yearsExperience} years building production software.`,
      provider: 'copilot-resume-parser',
    };
  }
}
