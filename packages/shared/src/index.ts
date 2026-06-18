export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  RECRUITER = 'RECRUITER',
  HIRING_MANAGER = 'HIRING_MANAGER',
  VIEWER = 'VIEWER',
}

export enum JobStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  PAUSED = 'PAUSED',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
}

export enum LocationType {
  REMOTE = 'REMOTE',
  HYBRID = 'HYBRID',
  ONSITE = 'ONSITE',
}

export enum PipelineStage {
  APPLIED = 'APPLIED',
  SCREENING = 'SCREENING',
  INTERVIEW = 'INTERVIEW',
  FINAL_INTERVIEW = 'FINAL_INTERVIEW',
  OFFER = 'OFFER',
  HIRED = 'HIRED',
  REJECTED = 'REJECTED',
}

export enum ApplicationStatus {
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
  HIRED = 'HIRED',
}

export enum InterviewStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum CandidateSource {
  LINKEDIN = 'LINKEDIN',
  INDEED = 'INDEED',
  REFERRAL = 'REFERRAL',
  CAREERS_PAGE = 'CAREERS_PAGE',
  AGENCY = 'AGENCY',
  OTHER = 'OTHER',
}

export enum OfferStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED',
}

export enum HiringRecommendation {
  STRONG_HIRE = 'STRONG_HIRE',
  HIRE = 'HIRE',
  CONSIDER = 'CONSIDER',
  HOLD = 'HOLD',
  REJECT = 'REJECT',
}

export enum NotificationType {
  NEW_APPLICATION = 'NEW_APPLICATION',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  STAGE_CHANGED = 'STAGE_CHANGED',
  OFFER_ACCEPTED = 'OFFER_ACCEPTED',
  OFFER_DECLINED = 'OFFER_DECLINED',
}

export enum TalentPoolStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export enum TimelineEventType {
  RESUME_RECEIVED = 'RESUME_RECEIVED',
  NOTE_ADDED = 'NOTE_ADDED',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  AI_ANALYSIS = 'AI_ANALYSIS',
  STAGE_CHANGED = 'STAGE_CHANGED',
  EMAIL_SENT = 'EMAIL_SENT',
  TAG_ADDED = 'TAG_ADDED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  OUTREACH = 'OUTREACH',
  OFFER_SENT = 'OFFER_SENT',
  CANDIDATE_ADDED = 'CANDIDATE_ADDED',
}

export enum TaskType {
  CALL_CANDIDATE = 'CALL_CANDIDATE',
  REVIEW_RESUME = 'REVIEW_RESUME',
  SCHEDULE_INTERVIEW = 'SCHEDULE_INTERVIEW',
  SEND_OFFER = 'SEND_OFFER',
  OTHER = 'OTHER',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum EmailTemplateType {
  INITIAL_OUTREACH = 'INITIAL_OUTREACH',
  INTERVIEW_INVITE = 'INTERVIEW_INVITE',
  FOLLOW_UP = 'FOLLOW_UP',
  OFFER_LETTER = 'OFFER_LETTER',
  REJECTION = 'REJECTION',
}

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  SENT = 'SENT',
  CANCELLED = 'CANCELLED',
}

export enum OutreachRecipientStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  BOUNCED = 'BOUNCED',
}

export const PIPELINE_STAGES: PipelineStage[] = [
  PipelineStage.APPLIED,
  PipelineStage.SCREENING,
  PipelineStage.INTERVIEW,
  PipelineStage.FINAL_INTERVIEW,
  PipelineStage.OFFER,
  PipelineStage.HIRED,
  PipelineStage.REJECTED,
];

export const PIPELINE_STAGE_LABELS: Record<PipelineStage, string> = {
  [PipelineStage.APPLIED]: 'Applied',
  [PipelineStage.SCREENING]: 'Screening',
  [PipelineStage.INTERVIEW]: 'Interview',
  [PipelineStage.FINAL_INTERVIEW]: 'Final Interview',
  [PipelineStage.OFFER]: 'Offer',
  [PipelineStage.HIRED]: 'Hired',
  [PipelineStage.REJECTED]: 'Rejected',
};

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  [JobStatus.DRAFT]: 'Draft',
  [JobStatus.OPEN]: 'Open',
  [JobStatus.PAUSED]: 'Paused',
  [JobStatus.CLOSED]: 'Closed',
  [JobStatus.ARCHIVED]: 'Archived',
};

export const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
  [LocationType.REMOTE]: 'Remote',
  [LocationType.HYBRID]: 'Hybrid',
  [LocationType.ONSITE]: 'Onsite',
};

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  [EmploymentType.FULL_TIME]: 'Full Time',
  [EmploymentType.PART_TIME]: 'Part Time',
  [EmploymentType.CONTRACT]: 'Contract',
  [EmploymentType.INTERNSHIP]: 'Internship',
};

export const SOURCE_LABELS: Record<CandidateSource, string> = {
  [CandidateSource.LINKEDIN]: 'LinkedIn',
  [CandidateSource.INDEED]: 'Indeed',
  [CandidateSource.REFERRAL]: 'Referral',
  [CandidateSource.CAREERS_PAGE]: 'Careers Page',
  [CandidateSource.AGENCY]: 'Agency',
  [CandidateSource.OTHER]: 'Other',
};

export const RECOMMENDATION_LABELS: Record<HiringRecommendation, string> = {
  [HiringRecommendation.STRONG_HIRE]: 'Strong Hire',
  [HiringRecommendation.HIRE]: 'Hire',
  [HiringRecommendation.CONSIDER]: 'Consider',
  [HiringRecommendation.HOLD]: 'Hold',
  [HiringRecommendation.REJECT]: 'Reject',
};

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  [NotificationType.NEW_APPLICATION]: 'New Application',
  [NotificationType.INTERVIEW_SCHEDULED]: 'Interview Scheduled',
  [NotificationType.STAGE_CHANGED]: 'Stage Changed',
  [NotificationType.OFFER_ACCEPTED]: 'Offer Accepted',
  [NotificationType.OFFER_DECLINED]: 'Offer Declined',
};

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  [TaskType.CALL_CANDIDATE]: 'Call Candidate',
  [TaskType.REVIEW_RESUME]: 'Review Resume',
  [TaskType.SCHEDULE_INTERVIEW]: 'Schedule Interview',
  [TaskType.SEND_OFFER]: 'Send Offer',
  [TaskType.OTHER]: 'Other',
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'To Do',
  [TaskStatus.IN_PROGRESS]: 'In Progress',
  [TaskStatus.DONE]: 'Done',
};

export const EMAIL_TEMPLATE_TYPE_LABELS: Record<EmailTemplateType, string> = {
  [EmailTemplateType.INITIAL_OUTREACH]: 'Initial Outreach',
  [EmailTemplateType.INTERVIEW_INVITE]: 'Interview Invite',
  [EmailTemplateType.FOLLOW_UP]: 'Follow Up',
  [EmailTemplateType.OFFER_LETTER]: 'Offer Letter',
  [EmailTemplateType.REJECTION]: 'Rejection',
};

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  [CampaignStatus.DRAFT]: 'Draft',
  [CampaignStatus.SCHEDULED]: 'Scheduled',
  [CampaignStatus.SENT]: 'Sent',
  [CampaignStatus.CANCELLED]: 'Cancelled',
};

export const TIMELINE_EVENT_LABELS: Record<TimelineEventType, string> = {
  [TimelineEventType.RESUME_RECEIVED]: 'Resume Received',
  [TimelineEventType.NOTE_ADDED]: 'Recruiter Note Added',
  [TimelineEventType.INTERVIEW_SCHEDULED]: 'Interview Scheduled',
  [TimelineEventType.AI_ANALYSIS]: 'AI Analysis Generated',
  [TimelineEventType.STAGE_CHANGED]: 'Stage Changed',
  [TimelineEventType.EMAIL_SENT]: 'Email Sent',
  [TimelineEventType.TAG_ADDED]: 'Tag Added',
  [TimelineEventType.TASK_COMPLETED]: 'Task Completed',
  [TimelineEventType.OUTREACH]: 'Outreach Sent',
  [TimelineEventType.OFFER_SENT]: 'Offer Sent',
  [TimelineEventType.CANDIDATE_ADDED]: 'Candidate Added',
};

export const DEFAULT_STAGE_SLA_DAYS: Record<PipelineStage, number> = {
  [PipelineStage.APPLIED]: 3,
  [PipelineStage.SCREENING]: 5,
  [PipelineStage.INTERVIEW]: 7,
  [PipelineStage.FINAL_INTERVIEW]: 5,
  [PipelineStage.OFFER]: 3,
  [PipelineStage.HIRED]: 0,
  [PipelineStage.REJECTED]: 0,
};

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  organizationId: string;
  organizationName: string;
  role: UserRole;
}

export interface ScoreBreakdown {
  skillOverlap: number;
  experience: number;
  education: number;
  seniority: number;
}

export interface CandidateInsightResult {
  matchScore: number;
  scoreBreakdown: ScoreBreakdown;
  skillsSummary: string;
  strengths: string[];
  weaknesses: string[];
  recommendation: HiringRecommendation;
  interviewQuestions: string[];
  provider: string;
}

export interface JobMetrics {
  totalApplicants: number;
  activeCandidates: number;
  offersSent: number;
  hiredCount: number;
  conversionRate: number;
}

export interface DashboardV2 {
  kpis: {
    openJobs: number;
    activeCandidates: number;
    interviewsThisWeek: number;
    timeToHire: number;
    offerAcceptanceRate: number;
    hiringVelocity: number;
  };
  hiringFunnel: FunnelStage[];
  recentApplications: RecentApplication[];
  upcomingInterviews: UpcomingInterview[];
  topRecruiters: RecruiterPerformance[];
  topSources: SourcePerformance[];
  hiringVelocityTrend: { week: string; hires: number }[];
}

export interface FunnelStage {
  stage: PipelineStage;
  count: number;
  label: string;
}

export interface RecentApplication {
  id: string;
  candidateName: string;
  jobTitle: string;
  stage: PipelineStage;
  matchScore: number | null;
  appliedAt: string;
}

export interface UpcomingInterview {
  id: string;
  candidateName: string;
  jobTitle: string;
  title: string;
  scheduledAt: string;
  meetingUrl: string | null;
}

export interface RecruiterPerformance {
  id: string;
  name: string;
  candidatesHandled: number;
  interviewsCompleted: number;
  hiresClosed: number;
}

export interface SourcePerformance {
  source: CandidateSource;
  label: string;
  applicants: number;
  interviews: number;
  hires: number;
  conversionRate: number;
}

export interface PipelineHistoryEntry {
  id: string;
  fromStage: PipelineStage | null;
  toStage: PipelineStage;
  changedAt: string;
  durationMs: number | null;
  changedBy: { id: string; firstName: string; lastName: string } | null;
}

export interface InterviewFeedbackInput {
  communication: number;
  technicalSkills: number;
  cultureFit: number;
  recommendation: number;
  notes?: string;
}

export interface CandidateSummary {
  headline: string;
  professionalSummary: string;
  strongExpertise: string[];
  fitAssessment: string;
  potentialStrengths: string[];
  potentialConcerns: string[];
  provider: string;
}

export interface CareerGap {
  from: string;
  to: string;
  months: number;
  label: string;
}

export interface CareerAnalysis {
  hasGaps: boolean;
  gaps: CareerGap[];
  message: string;
}

export interface InterviewQuestionSet {
  roleTitle: string;
  questions: string[];
  provider: string;
}

export interface CandidateComparisonRow {
  id: string;
  name: string;
  matchScore: number | null;
  yearsExperience: number;
  skills: string[];
  email: string;
}

export interface CandidateComparisonResult {
  candidates: CandidateComparisonRow[];
  recommended: {
    id: string;
    name: string;
    reasons: string[];
  } | null;
}

export interface CopilotHiringRecommendation {
  status: HiringRecommendation;
  reasons: string[];
  nextStep: string;
  matchScore: number | null;
  provider: string;
}

export interface ParsedResume {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  location: string | null;
  linkedinUrl: string | null;
  education: string | null;
  yearsExperience: number;
  skills: { name: string; level: number }[];
  experiences: {
    company: string;
    title: string;
    startDate: string;
    endDate: string | null;
    isCurrent: boolean;
    description: string | null;
  }[];
  summary: string;
  provider: string;
}

export interface RecruitingInsight {
  id: string;
  type: 'ready_for_final' | 'likely_offer' | 'rejection_risk' | 'action_needed';
  message: string;
  count: number;
  severity: 'info' | 'success' | 'warning' | 'danger';
}

export interface RecruitingInsightsResult {
  insights: RecruitingInsight[];
  provider: string;
}

export interface TagDto {
  id: string;
  name: string;
  color: string;
}

export interface TalentPoolCandidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  source: CandidateSource;
  location: string | null;
  yearsExperience: number | null;
  lastContactedAt: string | null;
  poolStatus: TalentPoolStatus | null;
  skills: { name: string }[];
  tags: TagDto[];
  status: 'active' | 'archived';
}

export interface TimelineEventDto {
  id: string;
  type: TimelineEventType;
  title: string;
  description: string | null;
  createdAt: string;
  actor: { firstName: string; lastName: string } | null;
}

export interface EmailTemplateDto {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: EmailTemplateType;
  createdAt: string;
  updatedAt: string;
}

export interface OutreachCampaignDto {
  id: string;
  name: string;
  status: CampaignStatus;
  sendDate: string | null;
  sentAt: string | null;
  template: { id: string; name: string; type: EmailTemplateType };
  recipientCount: number;
  createdAt: string;
}

export interface RecruiterTaskDto {
  id: string;
  title: string;
  type: TaskType;
  status: TaskStatus;
  description: string | null;
  dueDate: string | null;
  completedAt: string | null;
  candidate: { id: string; firstName: string; lastName: string } | null;
  assignee: { id: string; firstName: string; lastName: string };
}

export interface GlobalSearchResult {
  candidates: {
    id: string;
    name: string;
    email: string;
    location: string | null;
    skills: string[];
    company: string | null;
  }[];
  jobs: { id: string; title: string; department: string }[];
}

export interface CrmProductivityMetrics {
  candidatesContacted: number;
  tasksCompleted: number;
  interviewsScheduled: number;
  offersSent: number;
  weeklyActivity: { week: string; contacted: number; tasks: number; interviews: number }[];
  recruiterPerformance: {
    id: string;
    name: string;
    contacted: number;
    tasksCompleted: number;
    interviews: number;
  }[];
}

export interface PipelineSlaMetrics {
  stages: {
    stage: PipelineStage;
    label: string;
    averageDays: number;
    thresholdDays: number;
    overdueCount: number;
  }[];
  overdueCandidates: {
    applicationId: string;
    candidateName: string;
    jobTitle: string;
    stage: PipelineStage;
    daysInStage: number;
    thresholdDays: number;
  }[];
}

export interface TemplatePreviewResult {
  subject: string;
  body: string;
}

export interface DashboardV2Extended extends DashboardV2 {
  crmProductivity?: CrmProductivityMetrics;
  myTasks?: RecruiterTaskDto[];
  smartAlerts?: SmartAlert[];
}

export enum WorkflowStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
  ARCHIVED = 'ARCHIVED',
}

export enum WorkflowTriggerType {
  CANDIDATE_CREATED = 'CANDIDATE_CREATED',
  CANDIDATE_APPLIED = 'CANDIDATE_APPLIED',
  CANDIDATE_MOVED_STAGE = 'CANDIDATE_MOVED_STAGE',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  INTERVIEW_COMPLETED = 'INTERVIEW_COMPLETED',
  OFFER_SENT = 'OFFER_SENT',
  OFFER_ACCEPTED = 'OFFER_ACCEPTED',
  OFFER_REJECTED = 'OFFER_REJECTED',
  TASK_COMPLETED = 'TASK_COMPLETED',
}

export enum WorkflowNodeType {
  TRIGGER = 'TRIGGER',
  CONDITION = 'CONDITION',
  ACTION = 'ACTION',
}

export enum WorkflowConditionField {
  MATCH_SCORE = 'MATCH_SCORE',
  LOCATION = 'LOCATION',
  EXPERIENCE = 'EXPERIENCE',
  SKILL = 'SKILL',
  JOB_TITLE = 'JOB_TITLE',
  SOURCE = 'SOURCE',
  STAGE = 'STAGE',
}

export enum WorkflowConditionOperator {
  GT = 'GT',
  GTE = 'GTE',
  LT = 'LT',
  LTE = 'LTE',
  EQ = 'EQ',
  NEQ = 'NEQ',
  CONTAINS = 'CONTAINS',
}

export enum WorkflowActionType {
  SEND_EMAIL = 'SEND_EMAIL',
  CREATE_TASK = 'CREATE_TASK',
  MOVE_CANDIDATE = 'MOVE_CANDIDATE',
  NOTIFY_RECRUITER = 'NOTIFY_RECRUITER',
  SCHEDULE_INTERVIEW = 'SCHEDULE_INTERVIEW',
  GENERATE_AI_ANALYSIS = 'GENERATE_AI_ANALYSIS',
  ADD_TAG = 'ADD_TAG',
  ARCHIVE_CANDIDATE = 'ARCHIVE_CANDIDATE',
}

export enum WorkflowExecutionStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
}

export enum NotificationCategory {
  WORKFLOW = 'WORKFLOW',
  INTERVIEW = 'INTERVIEW',
  CANDIDATE = 'CANDIDATE',
  OFFER = 'OFFER',
  TASK = 'TASK',
  SYSTEM = 'SYSTEM',
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export const WORKFLOW_TRIGGER_LABELS: Record<WorkflowTriggerType, string> = {
  [WorkflowTriggerType.CANDIDATE_CREATED]: 'Candidate Created',
  [WorkflowTriggerType.CANDIDATE_APPLIED]: 'Candidate Applied',
  [WorkflowTriggerType.CANDIDATE_MOVED_STAGE]: 'Candidate Moved Stage',
  [WorkflowTriggerType.INTERVIEW_SCHEDULED]: 'Interview Scheduled',
  [WorkflowTriggerType.INTERVIEW_COMPLETED]: 'Interview Completed',
  [WorkflowTriggerType.OFFER_SENT]: 'Offer Sent',
  [WorkflowTriggerType.OFFER_ACCEPTED]: 'Offer Accepted',
  [WorkflowTriggerType.OFFER_REJECTED]: 'Offer Rejected',
  [WorkflowTriggerType.TASK_COMPLETED]: 'Task Completed',
};

export const WORKFLOW_ACTION_LABELS: Record<WorkflowActionType, string> = {
  [WorkflowActionType.SEND_EMAIL]: 'Send Email',
  [WorkflowActionType.CREATE_TASK]: 'Create Task',
  [WorkflowActionType.MOVE_CANDIDATE]: 'Move Candidate',
  [WorkflowActionType.NOTIFY_RECRUITER]: 'Notify Recruiter',
  [WorkflowActionType.SCHEDULE_INTERVIEW]: 'Schedule Interview',
  [WorkflowActionType.GENERATE_AI_ANALYSIS]: 'Generate AI Analysis',
  [WorkflowActionType.ADD_TAG]: 'Add Tag',
  [WorkflowActionType.ARCHIVE_CANDIDATE]: 'Archive Candidate',
};

export const NOTIFICATION_CATEGORY_LABELS: Record<NotificationCategory, string> = {
  [NotificationCategory.WORKFLOW]: 'Workflow',
  [NotificationCategory.INTERVIEW]: 'Interview',
  [NotificationCategory.CANDIDATE]: 'Candidate',
  [NotificationCategory.OFFER]: 'Offer',
  [NotificationCategory.TASK]: 'Task',
  [NotificationCategory.SYSTEM]: 'System',
};

export interface WorkflowListItem {
  id: string;
  name: string;
  triggerType: WorkflowTriggerType;
  triggerLabel: string;
  actionCount: number;
  status: WorkflowStatus;
  enabled: boolean;
  createdBy: { id: string; firstName: string; lastName: string };
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowDetail extends WorkflowListItem {
  description: string | null;
  viewport: { x: number; y: number; zoom: number } | null;
  nodes: WorkflowCanvasNode[];
  edges: WorkflowCanvasEdge[];
}

export interface WorkflowCanvasNode {
  id: string;
  type: WorkflowNodeType;
  label: string;
  position: { x: number; y: number };
  data: {
    triggerType?: WorkflowTriggerType;
    condition?: { field: WorkflowConditionField; operator: WorkflowConditionOperator; value: string };
    action?: { actionType: WorkflowActionType; params: Record<string, unknown> };
  };
}

export interface WorkflowCanvasEdge {
  id: string;
  source: string;
  target: string;
}

export interface WorkflowExecutionDto {
  id: string;
  workflowId: string;
  workflowName: string;
  candidateId: string | null;
  candidateName: string | null;
  status: WorkflowExecutionStatus;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
  result: Record<string, unknown> | null;
  errorMessage: string | null;
}

export interface WorkflowTemplateDto {
  id: string;
  slug: string;
  name: string;
  description: string;
  triggerType: WorkflowTriggerType;
  category: string;
}

export interface WorkflowAnalytics {
  totalExecutions: number;
  successRate: number;
  failureCount: number;
  averageRuntimeMs: number;
  topWorkflows: { id: string; name: string; executions: number; successRate: number }[];
  dailyExecutions: { date: string; success: number; failed: number }[];
  workflowPerformance: { name: string; avgMs: number; count: number }[];
}

export interface SmartAlert {
  id: string;
  type: 'waiting_candidates' | 'missing_feedback' | 'expiring_offers' | 'review_candidates';
  message: string;
  count: number;
  severity: 'info' | 'warning' | 'danger';
  href?: string;
}

export interface GeneratedWorkflowResult {
  name: string;
  description: string;
  triggerType: WorkflowTriggerType;
  nodes: WorkflowCanvasNode[];
  edges: WorkflowCanvasEdge[];
  provider: string;
}

export interface NotificationDto {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string;
  read: boolean;
  archived: boolean;
  createdAt: string;
}
