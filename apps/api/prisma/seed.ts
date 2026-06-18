import {
  PrismaClient,
  UserRole,
  JobStatus,
  EmploymentType,
  LocationType,
  PipelineStage,
  ApplicationStatus,
  CandidateSource,
  InterviewStatus,
  OfferStatus,
  HiringRecommendation,
  NotificationType,
  TalentPoolStatus,
  TimelineEventType,
  TaskType,
  TaskStatus,
  EmailTemplateType,
  CampaignStatus,
  OutreachRecipientStatus,
  WorkflowStatus,
  WorkflowTriggerType,
  WorkflowNodeType,
  WorkflowConditionField,
  WorkflowConditionOperator,
  WorkflowActionType,
  WorkflowExecutionStatus,
  NotificationCategory,
  NotificationPriority,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const FIRST_NAMES = [
  'James', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'Robert', 'Ashley',
  'William', 'Amanda', 'Daniel', 'Jennifer', 'Matthew', 'Elizabeth', 'Christopher',
  'Maria', 'Andrew', 'Nicole', 'Joshua', 'Stephanie', 'Ryan', 'Lauren', 'Brandon',
  'Rachel', 'Kevin', 'Megan', 'Justin', 'Hannah', 'Tyler', 'Samantha',
  'Alex', 'Olivia', 'Ethan', 'Sophia', 'Noah', 'Isabella', 'Liam', 'Mia',
  'Emma', 'Lucas', 'Ava', 'Mason', 'Charlotte', 'Logan', 'Amelia', 'Jacob',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen',
  'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera',
];

const SKILLS = [
  'React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes',
  'PostgreSQL', 'GraphQL', 'Redis', 'Go', 'Java', 'Figma', 'Product Strategy',
  'Data Analysis', 'Machine Learning', 'CI/CD', 'Agile', 'Leadership', 'SQL',
  'Vue.js', 'Angular', 'Rust', 'Terraform', 'Kafka', 'Elasticsearch',
];

const COMPANIES = [
  'Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Stripe', 'Airbnb',
  'Uber', 'Netflix', 'Spotify', 'Shopify', 'Slack', 'Notion', 'Figma', 'Linear',
  'Databricks', 'Snowflake', 'Coinbase', 'Robinhood', 'Plaid',
];

const EDUCATIONS = [
  'B.S. Computer Science, MIT',
  'B.S. Software Engineering, Georgia Tech',
  'M.S. Computer Science, Stanford',
  'B.A. Information Systems, UC Berkeley',
  'B.S. Electrical Engineering, Carnegie Mellon',
  'M.B.A., Harvard Business School',
  'B.S. Mathematics, University of Michigan',
  'B.S. Computer Science, University of Washington',
  'Ph.D. Machine Learning, CMU',
  'B.S. Design, Rhode Island School of Design',
  'Associate Degree, Community College',
  'Bootcamp Graduate, App Academy',
];

const LOCATIONS = [
  'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA',
  'London, UK', 'Chicago, IL', 'Denver, CO', 'Boston, MA', 'Remote',
];

const JOB_DEFINITIONS: Array<{
  title: string;
  dept: string;
  type: EmploymentType;
  locationType: LocationType;
  status: JobStatus;
}> = [
  { title: 'Senior Full Stack Engineer', dept: 'Engineering', type: EmploymentType.FULL_TIME, locationType: LocationType.HYBRID, status: JobStatus.OPEN },
  { title: 'Product Manager', dept: 'Product', type: EmploymentType.FULL_TIME, locationType: LocationType.REMOTE, status: JobStatus.OPEN },
  { title: 'UX Designer', dept: 'Design', type: EmploymentType.FULL_TIME, locationType: LocationType.HYBRID, status: JobStatus.OPEN },
  { title: 'DevOps Engineer', dept: 'Engineering', type: EmploymentType.FULL_TIME, locationType: LocationType.REMOTE, status: JobStatus.OPEN },
  { title: 'Marketing Manager', dept: 'Marketing', type: EmploymentType.FULL_TIME, locationType: LocationType.ONSITE, status: JobStatus.OPEN },
  { title: 'Sales Development Rep', dept: 'Sales', type: EmploymentType.FULL_TIME, locationType: LocationType.ONSITE, status: JobStatus.PAUSED },
  { title: 'Data Scientist', dept: 'Engineering', type: EmploymentType.FULL_TIME, locationType: LocationType.HYBRID, status: JobStatus.PAUSED },
  { title: 'Frontend Engineer', dept: 'Engineering', type: EmploymentType.CONTRACT, locationType: LocationType.REMOTE, status: JobStatus.PAUSED },
  { title: 'Customer Success Manager', dept: 'Operations', type: EmploymentType.FULL_TIME, locationType: LocationType.ONSITE, status: JobStatus.ARCHIVED },
  { title: 'Technical Writer', dept: 'Product', type: EmploymentType.PART_TIME, locationType: LocationType.REMOTE, status: JobStatus.ARCHIVED },
];

const STAGE_WEIGHTS: PipelineStage[] = [
  ...Array(30).fill(PipelineStage.APPLIED),
  ...Array(20).fill(PipelineStage.SCREENING),
  ...Array(15).fill(PipelineStage.INTERVIEW),
  ...Array(8).fill(PipelineStage.FINAL_INTERVIEW),
  ...Array(5).fill(PipelineStage.OFFER),
  ...Array(3).fill(PipelineStage.HIRED),
  ...Array(10).fill(PipelineStage.REJECTED),
] as PipelineStage[];

const INSIGHT_STRENGTHS = [
  'Strong React and TypeScript experience',
  'Led cross-functional teams at scale',
  'Excellent system design fundamentals',
  'Proven track record shipping products',
  'Deep domain expertise in fintech',
  'Strong communication and stakeholder management',
  'Experience with cloud-native architecture',
  'Fast learner with diverse tech stack',
];

const INSIGHT_WEAKNESSES = [
  'Limited experience with our specific stack',
  'May be overqualified for the role level',
  'Gap in recent backend experience',
  'Limited leadership experience at scale',
  'Salary expectations above band',
  'Needs stronger portfolio examples',
  'Limited experience in regulated industries',
];

const INTERVIEW_QUESTIONS = [
  'Describe a complex system you designed from scratch.',
  'How do you prioritize competing product requirements?',
  'Tell me about a time you resolved a production incident.',
  'How would you improve our onboarding funnel?',
  'Walk me through your approach to code reviews.',
  'Describe a conflict with a stakeholder and how you handled it.',
  'What metrics would you track for this role in the first 90 days?',
  'How do you stay current with industry trends?',
];

const SOURCES = Object.values(CandidateSource);

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomItems<T>(arr: readonly T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function meetingUrl(applicationId: string, index: number): string {
  return `https://meet.recruitflow.ai/interview/${applicationId.slice(-8)}-${index}`;
}

function buildSkillsSummary(skills: string[]): string {
  return `Candidate demonstrates proficiency in ${skills.slice(0, 3).join(', ')} with complementary experience in ${skills.slice(3, 5).join(' and ') || 'adjacent technologies'}. Overall profile aligns well with role requirements.`;
}

function recommendationForScores(matchScore: number): HiringRecommendation {
  if (matchScore >= 85) return HiringRecommendation.STRONG_HIRE;
  if (matchScore >= 70) return HiringRecommendation.HIRE;
  if (matchScore >= 55) return HiringRecommendation.CONSIDER;
  return HiringRecommendation.REJECT;
}

async function clearDatabase(): Promise<void> {
  await prisma.workflowExecution.deleteMany();
  await prisma.workflowAction.deleteMany();
  await prisma.workflowCondition.deleteMany();
  await prisma.workflowEdge.deleteMany();
  await prisma.workflowNode.deleteMany();
  await prisma.workflow.deleteMany();
  await prisma.workflowTemplate.deleteMany();
  await prisma.outreachRecipient.deleteMany();
  await prisma.outreachCampaign.deleteMany();
  await prisma.emailTemplate.deleteMany();
  await prisma.recruiterTask.deleteMany();
  await prisma.timelineEvent.deleteMany();
  await prisma.candidateTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.interviewFeedback.deleteMany();
  await prisma.interview.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.candidateInsight.deleteMany();
  await prisma.aiAnalysis.deleteMany();
  await prisma.applicationStageHistory.deleteMany();
  await prisma.application.deleteMany();
  await prisma.candidateNote.deleteMany();
  await prisma.candidateSkill.deleteMany();
  await prisma.candidateExperience.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.job.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();
}

async function main(): Promise<void> {
  console.log('Clearing existing data...');
  await clearDatabase();

  console.log('Seeding RecruitFlow AI...');
  const passwordHash = await bcrypt.hash('demo1234', 10);

  const org = await prisma.organization.create({
    data: { name: 'Acme Corp', slug: 'acme-corp' },
  });

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@recruitflow.ai',
      passwordHash,
      firstName: 'Alex',
      lastName: 'Rivera',
    },
  });

  await prisma.organizationMember.create({
    data: { organizationId: org.id, userId: demoUser.id, role: UserRole.OWNER },
  });

  const jobs = await Promise.all(
    JOB_DEFINITIONS.map((j, i) =>
      prisma.job.create({
        data: {
          organizationId: org.id,
          title: j.title,
          department: j.dept,
          location: randomItem(LOCATIONS),
          locationType: j.locationType,
          employmentType: j.type,
          status: j.status,
          hiringManagerId: demoUser.id,
          description: `We are looking for a talented ${j.title} to join our ${j.dept} team at Acme Corp. You will work on challenging problems, collaborate with world-class colleagues, and help shape the future of our product.`,
          requirements: `- 3+ years of experience in a relevant field\n- Strong communication and collaboration skills\n- Experience with modern tools and frameworks\n- Bachelor's degree or equivalent experience\n- Passion for building great products`,
          salaryMin: 75000 + i * 8000,
          salaryMax: 110000 + i * 12000,
          openedAt: j.status !== JobStatus.ARCHIVED ? daysAgo(30 + i * 4) : daysAgo(180 + i * 10),
          closedAt: j.status === JobStatus.ARCHIVED ? daysAgo(30) : null,
        },
      }),
    ),
  );

  const activeJobs = jobs.filter((j) => j.status === JobStatus.OPEN || j.status === JobStatus.PAUSED);

  let candidateCount = 0;
  let applicationCount = 0;
  let insightCount = 0;
  let interviewCount = 0;
  let offerCount = 0;
  let feedbackCount = 0;

  const applicationsForOffers: Array<{
    applicationId: string;
    jobId: string;
    stage: PipelineStage;
    salaryMin: number;
  }> = [];

  const candidateRecords: Array<{ id: string; skills: string[]; appliedJobIds: Set<string> }> = [];
  const interviewEligibleApplications: Array<{ applicationId: string; jobId: string }> = [];

  for (let i = 0; i < 100; i++) {
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName = LAST_NAMES[i % LAST_NAMES.length];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`;
    const yearsExperience = randomInt(1, 15);
    const candidateSkills = randomItems(SKILLS, 4 + Math.floor(Math.random() * 5));

    const candidate = await prisma.candidate.create({
      data: {
        organizationId: org.id,
        firstName,
        lastName,
        email,
        phone: `+1 (555) ${String(randomInt(100, 999))}-${String(randomInt(1000, 9999))}`,
        location: randomItem(LOCATIONS),
        source: randomItem(SOURCES),
        education: randomItem(EDUCATIONS),
        yearsExperience,
        skills: {
          create: candidateSkills.map((name) => ({
            name,
            level: randomInt(1, 5),
          })),
        },
        experiences: {
          create: Array.from({ length: 1 + Math.floor(Math.random() * 3) }, (_, j) => ({
            company: randomItem(COMPANIES),
            title: j === 0 ? 'Senior Engineer' : j === 1 ? 'Software Engineer' : 'Junior Developer',
            startDate: daysAgo(365 * (yearsExperience - j)),
            endDate: j === 0 ? null : daysAgo(365 * Math.max(1, yearsExperience - j - 1)),
            isCurrent: j === 0,
            description: 'Contributed to core product features, collaborated across teams, and mentored peers.',
          })),
        },
      },
    });

    candidateCount++;
    candidateRecords.push({ id: candidate.id, skills: candidateSkills, appliedJobIds: new Set() });

    const numApplications = 1 + Math.floor(Math.random() * 2);
    const appliedJobs = randomItems(activeJobs.length > 0 ? activeJobs : jobs, numApplications);

    for (const job of appliedJobs) {
      candidateRecords[candidateRecords.length - 1].appliedJobIds.add(job.id);
      const stage = randomItem(STAGE_WEIGHTS);
      const appliedAt = daysAgo(randomInt(1, 75));
      const isHired = stage === PipelineStage.HIRED;
      const isRejected = stage === PipelineStage.REJECTED;
      const matchScore = randomInt(45, 98);

      const application = await prisma.application.create({
        data: {
          jobId: job.id,
          candidateId: candidate.id,
          stage,
          status: isHired
            ? ApplicationStatus.HIRED
            : isRejected
              ? ApplicationStatus.REJECTED
              : ApplicationStatus.ACTIVE,
          matchScore,
          appliedAt,
          stageChangedAt: daysAgo(randomInt(0, 14)),
          hiredAt: isHired ? daysAgo(randomInt(1, 10)) : null,
          rejectedAt: isRejected ? daysAgo(randomInt(1, 10)) : null,
          rejectionReason: isRejected ? randomItem(['Position filled', 'Not a culture fit', 'Insufficient experience', 'Salary mismatch']) : null,
        },
      });

      applicationCount++;

      const stagePath: PipelineStage[] = [
        PipelineStage.APPLIED,
        PipelineStage.SCREENING,
        PipelineStage.INTERVIEW,
        PipelineStage.FINAL_INTERVIEW,
        PipelineStage.OFFER,
        PipelineStage.HIRED,
      ];
      const stageIndex = stage === PipelineStage.REJECTED
        ? randomInt(1, 4)
        : stagePath.indexOf(stage);

      await prisma.applicationStageHistory.create({
        data: {
          applicationId: application.id,
          toStage: PipelineStage.APPLIED,
          changedById: demoUser.id,
          changedAt: appliedAt,
        },
      });

      for (let s = 1; s <= stageIndex; s++) {
        await prisma.applicationStageHistory.create({
          data: {
            applicationId: application.id,
            fromStage: stagePath[s - 1],
            toStage: stage === PipelineStage.REJECTED && s === stageIndex
              ? PipelineStage.REJECTED
              : stagePath[s],
            changedById: demoUser.id,
            changedAt: daysAgo(randomInt(0, 20 - s * 2)),
            durationMs: randomInt(1, 10) * 24 * 60 * 60 * 1000,
          },
        });
      }

      if (Math.random() < 0.6) {
        const skillOverlapScore = randomInt(50, 98);
        const experienceScore = randomInt(40, 95);
        const educationScore = randomInt(45, 90);
        const seniorityScore = randomInt(40, 95);
        const insightMatchScore = Math.round(
          (skillOverlapScore + experienceScore + educationScore + seniorityScore) / 4,
        );

        await prisma.candidateInsight.create({
          data: {
            applicationId: application.id,
            matchScore: insightMatchScore,
            skillOverlapScore,
            experienceScore,
            educationScore,
            seniorityScore,
            skillsSummary: buildSkillsSummary(candidateSkills),
            strengths: randomItems(INSIGHT_STRENGTHS, randomInt(2, 4)),
            weaknesses: randomItems(INSIGHT_WEAKNESSES, randomInt(1, 3)),
            recommendation: recommendationForScores(insightMatchScore),
            interviewQuestions: randomItems(INTERVIEW_QUESTIONS, randomInt(3, 5)),
          },
        });
        insightCount++;
      }

      const interviewStages: PipelineStage[] = [
        PipelineStage.INTERVIEW,
        PipelineStage.FINAL_INTERVIEW,
        PipelineStage.OFFER,
        PipelineStage.HIRED,
      ];

      if (interviewStages.includes(stage)) {
        const numInterviews = stage === PipelineStage.HIRED || stage === PipelineStage.OFFER ? 2 : 1;

        for (let iv = 0; iv < numInterviews; iv++) {
          const interviewStage = iv === 0
            ? PipelineStage.INTERVIEW
            : stage === PipelineStage.FINAL_INTERVIEW
              ? PipelineStage.FINAL_INTERVIEW
              : iv === 1
                ? PipelineStage.FINAL_INTERVIEW
                : PipelineStage.INTERVIEW;

          const isCompleted = stage === PipelineStage.HIRED
            || (stage === PipelineStage.OFFER && iv === 0)
            || (stage === PipelineStage.FINAL_INTERVIEW && Math.random() > 0.4)
            || (stage === PipelineStage.INTERVIEW && Math.random() > 0.6);

          const interview = await prisma.interview.create({
            data: {
              applicationId: application.id,
              jobId: job.id,
              interviewerId: demoUser.id,
              title: interviewStage === PipelineStage.FINAL_INTERVIEW ? 'Final Round Interview' : 'Technical Interview',
              stage: interviewStage,
              scheduledAt: isCompleted ? daysAgo(randomInt(1, 21)) : daysFromNow(randomInt(1, 14)),
              durationMin: randomItem([45, 60, 90]),
              status: isCompleted ? InterviewStatus.COMPLETED : InterviewStatus.SCHEDULED,
              meetingUrl: meetingUrl(application.id, interviewCount),
              location: job.locationType === LocationType.ONSITE ? job.location : null,
              notes: isCompleted
                ? randomItem([
                    'Candidate performed well on system design portion.',
                    'Strong cultural alignment observed during behavioral section.',
                    'Needs follow-up on backend depth; frontend skills are excellent.',
                    'Exceeded expectations on live coding exercise.',
                  ])
                : 'Review resume and prepared questions before the session.',
            },
          });

          interviewCount++;

          if (isCompleted && Math.random() < 0.65) {
            await prisma.interviewFeedback.create({
              data: {
                interviewId: interview.id,
                communication: randomInt(2, 5),
                technicalSkills: randomInt(2, 5),
                cultureFit: randomInt(2, 5),
                recommendation: randomInt(2, 5),
                notes: randomItem([
                  'Would recommend advancing to next stage.',
                  'Solid candidate with room to grow in leadership.',
                  'Excellent technical depth; great team fit.',
                  'Borderline — consider panel debrief before decision.',
                ]),
              },
            });
            feedbackCount++;
          }
        }

        interviewEligibleApplications.push({ applicationId: application.id, jobId: job.id });
      }

      if (stage === PipelineStage.OFFER || stage === PipelineStage.HIRED) {
        applicationsForOffers.push({
          applicationId: application.id,
          jobId: job.id,
          stage,
          salaryMin: job.salaryMin ?? 90000,
        });
      }

      if (Math.random() > 0.7) {
        await prisma.candidateNote.create({
          data: {
            candidateId: candidate.id,
            authorId: demoUser.id,
            content: randomItem([
              'Strong technical background — recommend moving to interview.',
              'Great culture fit based on initial screen.',
              'Needs follow-up on salary expectations.',
              'Referred by current employee — priority candidate.',
              'Impressive portfolio; schedule technical round.',
            ]),
            isPinned: Math.random() > 0.85,
          },
        });
      }
    }
  }

  async function createExtraApplication(
    candidateId: string,
    job: (typeof jobs)[number],
    stage: PipelineStage,
    skills: string[],
  ): Promise<string> {
    const appliedAt = daysAgo(randomInt(10, 40));
    const isHired = stage === PipelineStage.HIRED;
    const isRejected = stage === PipelineStage.REJECTED;

    const application = await prisma.application.create({
      data: {
        jobId: job.id,
        candidateId,
        stage,
        status: isHired
          ? ApplicationStatus.HIRED
          : isRejected
            ? ApplicationStatus.REJECTED
            : ApplicationStatus.ACTIVE,
        matchScore: randomInt(65, 95),
        appliedAt,
        stageChangedAt: daysAgo(randomInt(1, 10)),
      },
    });
    applicationCount++;

    await prisma.applicationStageHistory.createMany({
      data: [
        {
          applicationId: application.id,
          toStage: PipelineStage.APPLIED,
          changedById: demoUser.id,
          changedAt: appliedAt,
        },
        {
          applicationId: application.id,
          fromStage: PipelineStage.APPLIED,
          toStage: PipelineStage.SCREENING,
          changedById: demoUser.id,
          changedAt: daysAgo(randomInt(5, 15)),
        },
        {
          applicationId: application.id,
          fromStage: PipelineStage.SCREENING,
          toStage: stage,
          changedById: demoUser.id,
          changedAt: daysAgo(randomInt(1, 7)),
        },
      ],
    });

    if (Math.random() < 0.6) {
      const skillOverlapScore = randomInt(55, 95);
      const experienceScore = randomInt(50, 90);
      const educationScore = randomInt(50, 88);
      const seniorityScore = randomInt(50, 90);
      const insightMatchScore = Math.round(
        (skillOverlapScore + experienceScore + educationScore + seniorityScore) / 4,
      );

      await prisma.candidateInsight.create({
        data: {
          applicationId: application.id,
          matchScore: insightMatchScore,
          skillOverlapScore,
          experienceScore,
          educationScore,
          seniorityScore,
          skillsSummary: buildSkillsSummary(skills),
          strengths: randomItems(INSIGHT_STRENGTHS, randomInt(2, 3)),
          weaknesses: randomItems(INSIGHT_WEAKNESSES, randomInt(1, 2)),
          recommendation: recommendationForScores(insightMatchScore),
          interviewQuestions: randomItems(INTERVIEW_QUESTIONS, randomInt(3, 4)),
        },
      });
      insightCount++;
    }

    return application.id;
  }

  let extraAppCursor = 0;
  while (applicationsForOffers.length < 22 && extraAppCursor < candidateRecords.length * jobs.length) {
    const record = candidateRecords[extraAppCursor % candidateRecords.length];
    const job = jobs[Math.floor(extraAppCursor / candidateRecords.length) % jobs.length];
    extraAppCursor++;

    if (record.appliedJobIds.has(job.id)) continue;

    record.appliedJobIds.add(job.id);
    const applicationId = await createExtraApplication(
      record.id,
      job,
      PipelineStage.OFFER,
      record.skills,
    );

    applicationsForOffers.push({
      applicationId,
      jobId: job.id,
      stage: PipelineStage.OFFER,
      salaryMin: job.salaryMin ?? 90000,
    });
  }

  const offerStatusTargets: OfferStatus[] = [
    ...Array(8).fill(OfferStatus.ACCEPTED),
    ...Array(8).fill(OfferStatus.PENDING),
    ...Array(6).fill(OfferStatus.DECLINED),
  ] as OfferStatus[];

  for (let i = 0; i < applicationsForOffers.length; i++) {
    const entry = applicationsForOffers[i];
    const status = i < offerStatusTargets.length
      ? offerStatusTargets[i]
      : randomItem([OfferStatus.PENDING, OfferStatus.DECLINED]);

    await prisma.offer.create({
      data: {
        applicationId: entry.applicationId,
        salary: entry.salaryMin + randomInt(5000, 25000),
        currency: 'USD',
        status,
        sentAt: daysAgo(randomInt(5, 30)),
        expiresAt: status === OfferStatus.PENDING ? daysFromNow(randomInt(7, 21)) : null,
        acceptedAt: status === OfferStatus.ACCEPTED ? daysAgo(randomInt(1, 7)) : null,
        declinedAt: status === OfferStatus.DECLINED ? daysAgo(randomInt(1, 5)) : null,
        startDate: status === OfferStatus.ACCEPTED ? daysFromNow(randomInt(14, 45)) : null,
      },
    });
    offerCount++;
  }

  let extraInterviewCursor = 0;
  while (interviewCount < 50) {
    if (extraInterviewCursor < interviewEligibleApplications.length) {
      const target = interviewEligibleApplications[extraInterviewCursor % interviewEligibleApplications.length];
      extraInterviewCursor++;

      const isCompleted = Math.random() > 0.45;
      const interview = await prisma.interview.create({
        data: {
          applicationId: target.applicationId,
          jobId: target.jobId,
          interviewerId: demoUser.id,
          title: randomItem(['Technical Interview', 'Culture Fit Interview', 'Panel Interview']),
          stage: randomItem([PipelineStage.INTERVIEW, PipelineStage.FINAL_INTERVIEW]),
          scheduledAt: isCompleted ? daysAgo(randomInt(1, 14)) : daysFromNow(randomInt(1, 10)),
          durationMin: randomItem([45, 60, 90]),
          status: isCompleted ? InterviewStatus.COMPLETED : InterviewStatus.SCHEDULED,
          meetingUrl: meetingUrl(target.applicationId, interviewCount),
          notes: 'Follow-up interview round for pipeline depth.',
        },
      });
      interviewCount++;

      if (isCompleted && Math.random() < 0.5) {
        await prisma.interviewFeedback.create({
          data: {
            interviewId: interview.id,
            communication: randomInt(3, 5),
            technicalSkills: randomInt(3, 5),
            cultureFit: randomInt(3, 5),
            recommendation: randomInt(3, 5),
            notes: 'Seeded feedback for demo purposes.',
          },
        });
        feedbackCount++;
      }
      continue;
    }

    const record = candidateRecords[extraInterviewCursor % candidateRecords.length];
    const job = jobs[Math.floor(extraInterviewCursor / candidateRecords.length) % jobs.length];
    extraInterviewCursor++;

    if (record.appliedJobIds.has(job.id)) continue;

    record.appliedJobIds.add(job.id);
    const applicationId = await createExtraApplication(
      record.id,
      job,
      PipelineStage.INTERVIEW,
      record.skills,
    );

    interviewEligibleApplications.push({ applicationId, jobId: job.id });

    const isCompleted = Math.random() > 0.5;
    const interview = await prisma.interview.create({
      data: {
        applicationId,
        jobId: job.id,
        interviewerId: demoUser.id,
        title: 'Technical Interview',
        stage: PipelineStage.INTERVIEW,
        scheduledAt: isCompleted ? daysAgo(randomInt(1, 10)) : daysFromNow(randomInt(1, 7)),
        durationMin: 60,
        status: isCompleted ? InterviewStatus.COMPLETED : InterviewStatus.SCHEDULED,
        meetingUrl: meetingUrl(applicationId, interviewCount),
        notes: 'Additional seeded interview to populate calendar views.',
      },
    });
    interviewCount++;

    if (isCompleted) {
      await prisma.interviewFeedback.create({
        data: {
          interviewId: interview.id,
          communication: randomInt(3, 5),
          technicalSkills: randomInt(3, 5),
          cultureFit: randomInt(3, 5),
          recommendation: randomInt(3, 5),
          notes: 'Seeded feedback for demo purposes.',
        },
      });
      feedbackCount++;
    }
  }

  const notificationTemplates: Array<{
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
  }> = [
    { type: NotificationType.NEW_APPLICATION, title: 'New application received', message: 'Sarah Chen applied for Senior Full Stack Engineer.', read: false },
    { type: NotificationType.NEW_APPLICATION, title: 'New application received', message: 'Michael Torres applied for Product Manager.', read: false },
    { type: NotificationType.INTERVIEW_SCHEDULED, title: 'Interview scheduled', message: 'Technical interview with James Wilson on Thursday at 2:00 PM.', read: false },
    { type: NotificationType.INTERVIEW_SCHEDULED, title: 'Interview scheduled', message: 'Final round with Emily Davis scheduled for next Monday.', read: true },
    { type: NotificationType.STAGE_CHANGED, title: 'Candidate moved to Interview', message: 'Daniel Martinez advanced to Interview stage for DevOps Engineer.', read: false },
    { type: NotificationType.STAGE_CHANGED, title: 'Candidate moved to Offer', message: 'Jessica Brown advanced to Offer stage for UX Designer.', read: true },
    { type: NotificationType.STAGE_CHANGED, title: 'Candidate rejected', message: 'Robert Garcia was moved to Rejected for Marketing Manager.', read: true },
    { type: NotificationType.OFFER_ACCEPTED, title: 'Offer accepted', message: 'Amanda Lee accepted the offer for Data Scientist ($145,000).', read: false },
    { type: NotificationType.OFFER_ACCEPTED, title: 'Offer accepted', message: 'William Harris accepted the offer for Frontend Engineer.', read: true },
    { type: NotificationType.OFFER_DECLINED, title: 'Offer declined', message: 'Ashley Clark declined the offer for Product Manager.', read: false },
    { type: NotificationType.OFFER_DECLINED, title: 'Offer declined', message: 'Christopher Moore declined the offer citing competing offer.', read: true },
    { type: NotificationType.NEW_APPLICATION, title: 'New application received', message: 'Maria Gonzalez applied for DevOps Engineer via referral.', read: true },
    { type: NotificationType.INTERVIEW_SCHEDULED, title: 'Interview reminder', message: 'Reminder: Interview with Nicole Thompson starts in 1 hour.', read: false },
    { type: NotificationType.STAGE_CHANGED, title: 'Pipeline update', message: '3 candidates moved to Screening stage today.', read: true },
    { type: NotificationType.OFFER_ACCEPTED, title: 'Offer accepted', message: 'Kevin Robinson accepted the Senior Full Stack Engineer offer.', read: false },
  ];

  await prisma.notification.createMany({
    data: notificationTemplates.map((n) => ({
      organizationId: org.id,
      userId: demoUser.id,
      type: n.type,
      title: n.title,
      message: n.message,
      read: n.read,
    })),
  });

  // Phase 12: CRM seed data
  const TAG_DEFINITIONS = [
    { name: 'Frontend', color: '#5B8DEF' },
    { name: 'Backend', color: '#3DAA8D' },
    { name: 'AI', color: '#9B7ED9' },
    { name: 'Senior', color: '#E8653A' },
    { name: 'Referral', color: '#C4A35A' },
    { name: 'Urgent', color: '#C45C5C' },
    { name: 'High Potential', color: '#2D8A6E' },
  ];

  const tags = await Promise.all(
    TAG_DEFINITIONS.map((t) =>
      prisma.tag.create({ data: { organizationId: org.id, name: t.name, color: t.color } }),
    ),
  );

  let talentPoolCount = 0;
  for (let i = 0; i < 15; i++) {
    const firstName = FIRST_NAMES[(i + 50) % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i + 50) % LAST_NAMES.length];
    const email = `pool.${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`;
    const candidateSkills = randomItems(SKILLS, 3 + Math.floor(Math.random() * 4));

    const poolCandidate = await prisma.candidate.create({
      data: {
        organizationId: org.id,
        firstName,
        lastName,
        email,
        phone: `+1 (555) ${String(randomInt(200, 899))}-${String(randomInt(1000, 9999))}`,
        location: randomItem(LOCATIONS),
        source: randomItem(SOURCES),
        education: randomItem(EDUCATIONS),
        yearsExperience: randomInt(2, 12),
        poolStatus: TalentPoolStatus.ACTIVE,
        lastContactedAt: Math.random() > 0.5 ? daysAgo(randomInt(1, 30)) : null,
        skills: {
          create: candidateSkills.map((name) => ({ name, level: randomInt(1, 5) })),
        },
      },
    });
    talentPoolCount++;

    const assignedTags = randomItems(tags, randomInt(1, 3));
    for (const tag of assignedTags) {
      await prisma.candidateTag.create({
        data: { candidateId: poolCandidate.id, tagId: tag.id },
      });
    }

    await prisma.timelineEvent.createMany({
      data: [
        {
          organizationId: org.id,
          candidateId: poolCandidate.id,
          type: TimelineEventType.CANDIDATE_ADDED,
          title: 'Added to Talent Pool',
          actorId: demoUser.id,
          createdAt: daysAgo(randomInt(5, 30)),
        },
        {
          organizationId: org.id,
          candidateId: poolCandidate.id,
          type: TimelineEventType.RESUME_RECEIVED,
          title: 'Resume Received',
          createdAt: daysAgo(randomInt(3, 25)),
        },
      ],
    });
  }

  // Tag some existing candidates
  for (const record of randomItems(candidateRecords, 25)) {
    for (const tag of randomItems(tags, randomInt(1, 2))) {
      await prisma.candidateTag.create({
        data: { candidateId: record.id, tagId: tag.id },
      }).catch(() => {});
    }
  }

  const emailTemplates = await Promise.all([
    prisma.emailTemplate.create({
      data: {
        organizationId: org.id,
        name: 'Initial Outreach',
        type: EmailTemplateType.INITIAL_OUTREACH,
        subject: 'Exciting opportunity at {{company_name}}',
        body: 'Hi {{candidate_name}},\n\nI came across your profile and think you would be a great fit for our {{job_title}} role at {{company_name}}.\n\nWould you be open to a brief chat?\n\nBest regards,\nRecruiting Team',
      },
    }),
    prisma.emailTemplate.create({
      data: {
        organizationId: org.id,
        name: 'Interview Invite',
        type: EmailTemplateType.INTERVIEW_INVITE,
        subject: 'Interview invitation — {{job_title}}',
        body: 'Hi {{candidate_name}},\n\nWe would like to invite you to interview for the {{job_title}} position.\n\nDate: {{interview_date}}\n\nPlease confirm your availability.\n\nBest,\nRecruiting Team',
      },
    }),
    prisma.emailTemplate.create({
      data: {
        organizationId: org.id,
        name: 'Follow Up',
        type: EmailTemplateType.FOLLOW_UP,
        subject: 'Following up — {{job_title}} at {{company_name}}',
        body: 'Hi {{candidate_name}},\n\nJust following up on my previous message about the {{job_title}} role.\n\nLet me know if you have any questions.\n\nBest,\nRecruiting Team',
      },
    }),
    prisma.emailTemplate.create({
      data: {
        organizationId: org.id,
        name: 'Offer Letter',
        type: EmailTemplateType.OFFER_LETTER,
        subject: 'Offer — {{job_title}} at {{company_name}}',
        body: 'Dear {{candidate_name}},\n\nWe are pleased to extend an offer for the {{job_title}} position at {{company_name}}.\n\nPlease review the attached details and let us know your decision.\n\nCongratulations!\nRecruiting Team',
      },
    }),
    prisma.emailTemplate.create({
      data: {
        organizationId: org.id,
        name: 'Rejection',
        type: EmailTemplateType.REJECTION,
        subject: 'Update on your application — {{job_title}}',
        body: 'Hi {{candidate_name}},\n\nThank you for your interest in the {{job_title}} role at {{company_name}}.\n\nAfter careful consideration, we have decided to move forward with other candidates.\n\nWe wish you the best in your job search.\n\nBest,\nRecruiting Team',
      },
    }),
  ]);

  const poolCandidates = await prisma.candidate.findMany({
    where: { organizationId: org.id, poolStatus: TalentPoolStatus.ACTIVE },
    take: 5,
  });

  const sentCampaign = await prisma.outreachCampaign.create({
    data: {
      organizationId: org.id,
      name: 'Q2 Engineering Outreach',
      templateId: emailTemplates[0].id,
      status: CampaignStatus.SENT,
      sendDate: daysAgo(7),
      sentAt: daysAgo(7),
      createdById: demoUser.id,
      recipients: {
        create: poolCandidates.slice(0, 3).map((c) => ({
          candidateId: c.id,
          status: OutreachRecipientStatus.SENT,
          sentAt: daysAgo(7),
        })),
      },
    },
  });

  await prisma.outreachCampaign.create({
    data: {
      organizationId: org.id,
      name: 'Senior Frontend Follow-up',
      templateId: emailTemplates[2].id,
      status: CampaignStatus.SCHEDULED,
      sendDate: daysFromNow(3),
      createdById: demoUser.id,
      recipients: {
        create: poolCandidates.slice(3, 5).map((c) => ({
          candidateId: c.id,
          status: OutreachRecipientStatus.PENDING,
        })),
      },
    },
  });

  const taskDefinitions = [
    { title: 'Call candidate about availability', type: TaskType.CALL_CANDIDATE, status: TaskStatus.TODO },
    { title: 'Review resume for Senior Engineer role', type: TaskType.REVIEW_RESUME, status: TaskStatus.IN_PROGRESS },
    { title: 'Schedule technical interview', type: TaskType.SCHEDULE_INTERVIEW, status: TaskStatus.TODO },
    { title: 'Send offer letter', type: TaskType.SEND_OFFER, status: TaskStatus.DONE },
    { title: 'Follow up on referral candidate', type: TaskType.CALL_CANDIDATE, status: TaskStatus.TODO },
    { title: 'Review portfolio submission', type: TaskType.REVIEW_RESUME, status: TaskStatus.IN_PROGRESS },
    { title: 'Schedule final round interview', type: TaskType.SCHEDULE_INTERVIEW, status: TaskStatus.TODO },
    { title: 'Prepare offer package', type: TaskType.SEND_OFFER, status: TaskStatus.TODO },
  ];

  for (const task of taskDefinitions) {
    const candidate = randomItem(candidateRecords);
    await prisma.recruiterTask.create({
      data: {
        organizationId: org.id,
        assigneeId: demoUser.id,
        candidateId: candidate.id,
        title: task.title,
        type: task.type,
        status: task.status,
        dueDate: task.status === TaskStatus.DONE ? daysAgo(2) : daysFromNow(randomInt(1, 7)),
        completedAt: task.status === TaskStatus.DONE ? daysAgo(1) : null,
      },
    });
  }

  // Timeline events for sample candidates
  const sampleCandidates = candidateRecords.slice(0, 10);
  for (const record of sampleCandidates) {
    await prisma.timelineEvent.createMany({
      data: [
        {
          organizationId: org.id,
          candidateId: record.id,
          type: TimelineEventType.RESUME_RECEIVED,
          title: 'Resume Received',
          createdAt: daysAgo(randomInt(10, 20)),
        },
        {
          organizationId: org.id,
          candidateId: record.id,
          type: TimelineEventType.NOTE_ADDED,
          title: 'Recruiter Note Added',
          description: 'Strong technical background, good culture fit potential.',
          actorId: demoUser.id,
          createdAt: daysAgo(randomInt(5, 12)),
        },
        {
          organizationId: org.id,
          candidateId: record.id,
          type: TimelineEventType.AI_ANALYSIS,
          title: 'AI Analysis Generated',
          description: 'Match score computed by intelligence engine',
          createdAt: daysAgo(randomInt(3, 8)),
        },
      ],
    });
  }

  // Phase 13: Workflow templates & sample workflows
  const templateDefs = [
    {
      slug: 'high-match-candidate',
      name: 'High Match Candidate',
      description: 'Notify recruiter and move to screening when match score exceeds 85',
      triggerType: WorkflowTriggerType.CANDIDATE_APPLIED,
      category: 'screening',
      nodes: [
        { id: 'trigger-1', type: WorkflowNodeType.TRIGGER, label: 'Candidate Applied', x: 250, y: 0 },
        { id: 'condition-1', type: WorkflowNodeType.CONDITION, label: 'Match Score > 85', x: 250, y: 120, condition: { field: WorkflowConditionField.MATCH_SCORE, operator: WorkflowConditionOperator.GT, value: '85' } },
        { id: 'action-1', type: WorkflowNodeType.ACTION, label: 'Notify Recruiter', x: 250, y: 240, action: { actionType: WorkflowActionType.NOTIFY_RECRUITER, params: { message: 'High match candidate applied' } } },
        { id: 'action-2', type: WorkflowNodeType.ACTION, label: 'Move To Screening', x: 250, y: 360, action: { actionType: WorkflowActionType.MOVE_CANDIDATE, params: { stage: 'SCREENING' } } },
      ],
      edges: [
        { id: 'e1', source: 'trigger-1', target: 'condition-1' },
        { id: 'e2', source: 'condition-1', target: 'action-1' },
        { id: 'e3', source: 'action-1', target: 'action-2' },
      ],
    },
    {
      slug: 'interview-reminder',
      name: 'Interview Reminder',
      description: 'Create a task when an interview is scheduled',
      triggerType: WorkflowTriggerType.INTERVIEW_SCHEDULED,
      category: 'interviews',
      nodes: [
        { id: 'trigger-1', type: WorkflowNodeType.TRIGGER, label: 'Interview Scheduled', x: 250, y: 0 },
        { id: 'action-1', type: WorkflowNodeType.ACTION, label: 'Create Task', x: 250, y: 140, action: { actionType: WorkflowActionType.CREATE_TASK, params: { title: 'Prepare interview materials' } } },
      ],
      edges: [{ id: 'e1', source: 'trigger-1', target: 'action-1' }],
    },
    {
      slug: 'offer-follow-up',
      name: 'Offer Follow Up',
      description: 'Send email and notify when offer is sent',
      triggerType: WorkflowTriggerType.OFFER_SENT,
      category: 'offers',
      nodes: [
        { id: 'trigger-1', type: WorkflowNodeType.TRIGGER, label: 'Offer Sent', x: 250, y: 0 },
        { id: 'action-1', type: WorkflowNodeType.ACTION, label: 'Send Email', x: 250, y: 140, action: { actionType: WorkflowActionType.SEND_EMAIL, params: { subject: 'Your offer from Acme Corp' } } },
        { id: 'action-2', type: WorkflowNodeType.ACTION, label: 'Notify Recruiter', x: 250, y: 260, action: { actionType: WorkflowActionType.NOTIFY_RECRUITER, params: {} } },
      ],
      edges: [
        { id: 'e1', source: 'trigger-1', target: 'action-1' },
        { id: 'e2', source: 'action-1', target: 'action-2' },
      ],
    },
    {
      slug: 'rejected-follow-up',
      name: 'Rejected Candidate Follow Up',
      description: 'Send rejection email when candidate is rejected',
      triggerType: WorkflowTriggerType.CANDIDATE_MOVED_STAGE,
      category: 'communication',
      nodes: [
        { id: 'trigger-1', type: WorkflowNodeType.TRIGGER, label: 'Stage Changed', x: 250, y: 0 },
        { id: 'action-1', type: WorkflowNodeType.ACTION, label: 'Send Email', x: 250, y: 140, action: { actionType: WorkflowActionType.SEND_EMAIL, params: { subject: 'Application update' } } },
      ],
      edges: [{ id: 'e1', source: 'trigger-1', target: 'action-1' }],
    },
    {
      slug: 'referral-priority',
      name: 'Referral Priority Workflow',
      description: 'Tag and notify for referral candidates',
      triggerType: WorkflowTriggerType.CANDIDATE_APPLIED,
      category: 'referrals',
      nodes: [
        { id: 'trigger-1', type: WorkflowNodeType.TRIGGER, label: 'Candidate Applied', x: 250, y: 0 },
        { id: 'condition-1', type: WorkflowNodeType.CONDITION, label: 'Source = Referral', x: 250, y: 120, condition: { field: WorkflowConditionField.SOURCE, operator: WorkflowConditionOperator.EQ, value: 'REFERRAL' } },
        { id: 'action-1', type: WorkflowNodeType.ACTION, label: 'Add Tag', x: 250, y: 240, action: { actionType: WorkflowActionType.ADD_TAG, params: { tagName: 'Referral' } } },
        { id: 'action-2', type: WorkflowNodeType.ACTION, label: 'Notify Recruiter', x: 250, y: 360, action: { actionType: WorkflowActionType.NOTIFY_RECRUITER, params: { message: 'Referral candidate applied' } } },
      ],
      edges: [
        { id: 'e1', source: 'trigger-1', target: 'condition-1' },
        { id: 'e2', source: 'condition-1', target: 'action-1' },
        { id: 'e3', source: 'action-1', target: 'action-2' },
      ],
    },
  ];

  for (const t of templateDefs) {
    const { nodes, edges, ...meta } = t;
    await prisma.workflowTemplate.create({
      data: {
        slug: meta.slug,
        name: meta.name,
        description: meta.description,
        triggerType: meta.triggerType,
        category: meta.category,
        definition: { nodes, edges },
      },
    });
  }

  async function seedWorkflowFromDef(
    name: string,
    def: typeof templateDefs[0],
    enabled: boolean,
  ) {
    const wf = await prisma.workflow.create({
      data: {
        organizationId: org.id,
        name,
        description: def.description,
        triggerType: def.triggerType,
        createdById: demoUser.id,
        status: enabled ? WorkflowStatus.ACTIVE : WorkflowStatus.DRAFT,
        enabled,
      },
    });

    for (const n of def.nodes) {
      const node = await prisma.workflowNode.create({
        data: {
          workflowId: wf.id,
          nodeKey: n.id,
          type: n.type,
          label: n.label,
          positionX: n.x,
          positionY: n.y,
          config: {},
        },
      });
      if ('condition' in n && n.condition) {
        await prisma.workflowCondition.create({ data: { nodeId: node.id, ...n.condition } });
      }
      if ('action' in n && n.action) {
        await prisma.workflowAction.create({
          data: { nodeId: node.id, actionType: n.action.actionType, params: n.action.params ?? {} },
        });
      }
    }

    await prisma.workflowEdge.createMany({
      data: def.edges.map((e) => ({
        workflowId: wf.id,
        edgeKey: e.id,
        sourceKey: e.source,
        targetKey: e.target,
      })),
    });

    return wf;
  }

  const highMatchWf = await seedWorkflowFromDef('High Match Auto-Screen', templateDefs[0], true);
  await seedWorkflowFromDef('Referral Priority', templateDefs[4], true);
  await seedWorkflowFromDef('Interview Reminder (Draft)', templateDefs[1], false);

  const sampleCandidate = candidateRecords[0];
  await prisma.workflowExecution.createMany({
    data: [
      {
        organizationId: org.id,
        workflowId: highMatchWf.id,
        candidateId: sampleCandidate?.id,
        status: WorkflowExecutionStatus.SUCCESS,
        startedAt: daysAgo(2),
        completedAt: daysAgo(2),
        durationMs: 245,
        result: [{ type: 'action', result: { notified: true } }],
      },
      {
        organizationId: org.id,
        workflowId: highMatchWf.id,
        candidateId: candidateRecords[1]?.id,
        status: WorkflowExecutionStatus.SUCCESS,
        startedAt: daysAgo(1),
        completedAt: daysAgo(1),
        durationMs: 312,
      },
      {
        organizationId: org.id,
        workflowId: highMatchWf.id,
        status: WorkflowExecutionStatus.FAILED,
        startedAt: daysAgo(1),
        completedAt: daysAgo(1),
        durationMs: 89,
        errorMessage: 'Condition not met — skipped remaining actions',
      },
    ],
  });

  await prisma.notification.create({
    data: {
      organizationId: org.id,
      userId: demoUser.id,
      type: NotificationType.STAGE_CHANGED,
      category: NotificationCategory.WORKFLOW,
      priority: NotificationPriority.HIGH,
      title: 'Workflow executed',
      message: 'High Match Auto-Screen completed for a candidate with 92% match score.',
      read: false,
    },
  });

  console.log('Seed complete:');
  console.log(`  Organization: 1 (${org.name})`);
  console.log(`  Users: 1 (demo@recruitflow.ai / demo1234)`);
  console.log(`  Jobs: ${jobs.length}`);
  console.log(`  Candidates: ${candidateCount}`);
  console.log(`  Applications: ${applicationCount}`);
  console.log(`  CandidateInsights: ${insightCount} (~${Math.round((insightCount / applicationCount) * 100)}%)`);
  console.log(`  Interviews: ${interviewCount}`);
  console.log(`  InterviewFeedback: ${feedbackCount}`);
  console.log(`  Offers: ${offerCount}`);
  console.log(`  Notifications: ${notificationTemplates.length}`);
  console.log(`  Tags: ${tags.length}`);
  console.log(`  Talent Pool Candidates: ${talentPoolCount}`);
  console.log(`  Email Templates: ${emailTemplates.length}`);
  console.log(`  Outreach Campaigns: 2 (1 sent: ${sentCampaign.name})`);
  console.log(`  Recruiter Tasks: ${taskDefinitions.length}`);
  console.log(`  Workflow Templates: ${templateDefs.length}`);
  console.log(`  Workflows: 3 (2 enabled)`);
  console.log(`  Workflow Executions: 3`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
