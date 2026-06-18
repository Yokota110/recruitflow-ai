-- Phase 13: Workflow Automation Engine

CREATE TYPE "WorkflowStatus" AS ENUM ('DRAFT', 'ACTIVE', 'DISABLED', 'ARCHIVED');
CREATE TYPE "WorkflowTriggerType" AS ENUM ('CANDIDATE_CREATED', 'CANDIDATE_APPLIED', 'CANDIDATE_MOVED_STAGE', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'OFFER_SENT', 'OFFER_ACCEPTED', 'OFFER_REJECTED', 'TASK_COMPLETED');
CREATE TYPE "WorkflowNodeType" AS ENUM ('TRIGGER', 'CONDITION', 'ACTION');
CREATE TYPE "WorkflowConditionField" AS ENUM ('MATCH_SCORE', 'LOCATION', 'EXPERIENCE', 'SKILL', 'JOB_TITLE', 'SOURCE', 'STAGE');
CREATE TYPE "WorkflowConditionOperator" AS ENUM ('GT', 'GTE', 'LT', 'LTE', 'EQ', 'NEQ', 'CONTAINS');
CREATE TYPE "WorkflowActionType" AS ENUM ('SEND_EMAIL', 'CREATE_TASK', 'MOVE_CANDIDATE', 'NOTIFY_RECRUITER', 'SCHEDULE_INTERVIEW', 'GENERATE_AI_ANALYSIS', 'ADD_TAG', 'ARCHIVE_CANDIDATE');
CREATE TYPE "WorkflowExecutionStatus" AS ENUM ('SUCCESS', 'FAILED', 'PENDING');
CREATE TYPE "NotificationCategory" AS ENUM ('WORKFLOW', 'INTERVIEW', 'CANDIDATE', 'OFFER', 'TASK', 'SYSTEM');
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

ALTER TABLE "Notification" ADD COLUMN "category" "NotificationCategory" NOT NULL DEFAULT 'SYSTEM';
ALTER TABLE "Notification" ADD COLUMN "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL';
ALTER TABLE "Notification" ADD COLUMN "archived" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "Workflow" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "WorkflowStatus" NOT NULL DEFAULT 'DRAFT',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "triggerType" "WorkflowTriggerType" NOT NULL,
    "createdById" TEXT NOT NULL,
    "viewport" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkflowNode" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "nodeKey" TEXT NOT NULL,
    "type" "WorkflowNodeType" NOT NULL,
    "label" TEXT NOT NULL,
    "positionX" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "positionY" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "config" JSONB NOT NULL DEFAULT '{}',
    CONSTRAINT "WorkflowNode_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkflowEdge" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "edgeKey" TEXT NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "targetKey" TEXT NOT NULL,
    CONSTRAINT "WorkflowEdge_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkflowCondition" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "field" "WorkflowConditionField" NOT NULL,
    "operator" "WorkflowConditionOperator" NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "WorkflowCondition_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkflowAction" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "actionType" "WorkflowActionType" NOT NULL,
    "params" JSONB NOT NULL DEFAULT '{}',
    CONSTRAINT "WorkflowAction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkflowExecution" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "candidateId" TEXT,
    "status" "WorkflowExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "result" JSONB,
    "errorMessage" TEXT,
    CONSTRAINT "WorkflowExecution_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkflowTemplate" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "triggerType" "WorkflowTriggerType" NOT NULL,
    "definition" JSONB NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "isBuiltIn" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkflowTemplate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WorkflowNode_workflowId_nodeKey_key" ON "WorkflowNode"("workflowId", "nodeKey");
CREATE UNIQUE INDEX "WorkflowEdge_workflowId_edgeKey_key" ON "WorkflowEdge"("workflowId", "edgeKey");
CREATE UNIQUE INDEX "WorkflowCondition_nodeId_key" ON "WorkflowCondition"("nodeId");
CREATE UNIQUE INDEX "WorkflowAction_nodeId_key" ON "WorkflowAction"("nodeId");
CREATE UNIQUE INDEX "WorkflowTemplate_slug_key" ON "WorkflowTemplate"("slug");
CREATE INDEX "Workflow_organizationId_status_idx" ON "Workflow"("organizationId", "status");
CREATE INDEX "Workflow_organizationId_enabled_triggerType_idx" ON "Workflow"("organizationId", "enabled", "triggerType");
CREATE INDEX "WorkflowExecution_organizationId_startedAt_idx" ON "WorkflowExecution"("organizationId", "startedAt");
CREATE INDEX "WorkflowExecution_workflowId_status_idx" ON "WorkflowExecution"("workflowId", "status");
CREATE INDEX "Notification_userId_read_archived_idx" ON "Notification"("userId", "read", "archived");
CREATE INDEX "Notification_userId_category_idx" ON "Notification"("userId", "category");

ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WorkflowNode" ADD CONSTRAINT "WorkflowNode_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkflowEdge" ADD CONSTRAINT "WorkflowEdge_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkflowCondition" ADD CONSTRAINT "WorkflowCondition_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "WorkflowNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkflowAction" ADD CONSTRAINT "WorkflowAction_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "WorkflowNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkflowExecution" ADD CONSTRAINT "WorkflowExecution_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkflowExecution" ADD CONSTRAINT "WorkflowExecution_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

DROP INDEX IF EXISTS "Notification_userId_read_idx";
