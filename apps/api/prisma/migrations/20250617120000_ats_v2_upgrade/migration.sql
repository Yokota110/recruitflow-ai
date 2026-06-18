-- Upgrade: ATS v2 — AI intelligence, interviews, notifications, pipeline history

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('REMOTE', 'HYBRID', 'ONSITE');

-- CreateEnum
CREATE TYPE "HiringRecommendation" AS ENUM ('STRONG_HIRE', 'HIRE', 'CONSIDER', 'REJECT');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NEW_APPLICATION', 'INTERVIEW_SCHEDULED', 'STAGE_CHANGED', 'OFFER_ACCEPTED', 'OFFER_DECLINED');

-- AlterTable Job
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "locationType" "LocationType" NOT NULL DEFAULT 'HYBRID';

-- AlterTable Candidate
ALTER TABLE "Candidate" ADD COLUMN IF NOT EXISTS "education" TEXT;
ALTER TABLE "Candidate" ADD COLUMN IF NOT EXISTS "yearsExperience" INTEGER;

-- AlterTable Interview
ALTER TABLE "Interview" ADD COLUMN IF NOT EXISTS "stage" "PipelineStage" NOT NULL DEFAULT 'INTERVIEW';
ALTER TABLE "Interview" ADD COLUMN IF NOT EXISTS "meetingUrl" TEXT;
ALTER TABLE "Interview" ADD COLUMN IF NOT EXISTS "notes" TEXT;

-- CreateTable CandidateInsight
CREATE TABLE IF NOT EXISTS "CandidateInsight" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "matchScore" INTEGER NOT NULL,
    "skillOverlapScore" INTEGER NOT NULL,
    "experienceScore" INTEGER NOT NULL,
    "educationScore" INTEGER NOT NULL,
    "seniorityScore" INTEGER NOT NULL,
    "skillsSummary" TEXT NOT NULL,
    "strengths" TEXT[],
    "weaknesses" TEXT[],
    "recommendation" "HiringRecommendation" NOT NULL,
    "interviewQuestions" TEXT[],
    "provider" TEXT NOT NULL DEFAULT 'intelligence-engine',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable InterviewFeedback
CREATE TABLE IF NOT EXISTS "InterviewFeedback" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "communication" INTEGER NOT NULL,
    "technicalSkills" INTEGER NOT NULL,
    "cultureFit" INTEGER NOT NULL,
    "recommendation" INTEGER NOT NULL,
    "notes" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable Notification
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CandidateInsight_applicationId_key" ON "CandidateInsight"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "InterviewFeedback_interviewId_key" ON "InterviewFeedback"("interviewId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Notification_organizationId_createdAt_idx" ON "Notification"("organizationId", "createdAt");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "Job" ADD CONSTRAINT "Job_hiringManagerId_fkey" FOREIGN KEY ("hiringManagerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ApplicationStageHistory" ADD CONSTRAINT "ApplicationStageHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "CandidateInsight" ADD CONSTRAINT "CandidateInsight_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "InterviewFeedback" ADD CONSTRAINT "InterviewFeedback_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Notification" ADD CONSTRAINT "Notification_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
