import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TimelineEventType, Prisma } from '@prisma/client';

@Injectable()
export class TimelineService {
  constructor(private prisma: PrismaService) {}

  async record(
    orgId: string,
    candidateId: string,
    type: TimelineEventType,
    title: string,
    options?: { description?: string; metadata?: Record<string, unknown>; actorId?: string },
  ) {
    return this.prisma.timelineEvent.create({
      data: {
        organizationId: orgId,
        candidateId,
        type,
        title,
        description: options?.description,
        metadata: options?.metadata as Prisma.InputJsonValue | undefined,
        actorId: options?.actorId,
      },
    });
  }

  async getTimeline(orgId: string, candidateId: string) {
    const candidate = await this.prisma.candidate.findFirst({
      where: { id: candidateId, organizationId: orgId },
    });
    if (!candidate) return [];

    const events = await this.prisma.timelineEvent.findMany({
      where: { candidateId, organizationId: orgId },
      include: {
        actor: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (events.length > 0) {
      return events.map((e) => ({
        id: e.id,
        type: e.type,
        title: e.title,
        description: e.description,
        createdAt: e.createdAt.toISOString(),
        actor: e.actor,
      }));
    }

    return this.buildLegacyTimeline(orgId, candidateId);
  }

  private async buildLegacyTimeline(orgId: string, candidateId: string) {
    const [resumes, notes, applications] = await Promise.all([
      this.prisma.resume.findMany({
        where: { candidateId },
        orderBy: { uploadedAt: 'desc' },
      }),
      this.prisma.candidateNote.findMany({
        where: { candidateId },
        include: { author: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.application.findMany({
        where: { candidateId, job: { organizationId: orgId } },
        include: {
          job: { select: { title: true } },
          interviews: { orderBy: { scheduledAt: 'desc' } },
          candidateInsight: true,
          offer: true,
          stageHistory: { orderBy: { changedAt: 'desc' }, take: 5 },
        },
      }),
    ]);

    type LegacyEvent = {
      id: string;
      type: TimelineEventType;
      title: string;
      description: string | null;
      createdAt: string;
      actor: { firstName: string; lastName: string } | null;
    };

    const legacy: LegacyEvent[] = [];

    for (const r of resumes) {
      legacy.push({
        id: `resume-${r.id}`,
        type: TimelineEventType.RESUME_RECEIVED,
        title: 'Resume Received',
        description: r.fileName,
        createdAt: r.uploadedAt.toISOString(),
        actor: null,
      });
    }

    for (const n of notes) {
      legacy.push({
        id: `note-${n.id}`,
        type: TimelineEventType.NOTE_ADDED,
        title: 'Recruiter Note Added',
        description: n.content.slice(0, 200),
        createdAt: n.createdAt.toISOString(),
        actor: n.author,
      });
    }

    for (const app of applications) {
      for (const i of app.interviews) {
        legacy.push({
          id: `interview-${i.id}`,
          type: TimelineEventType.INTERVIEW_SCHEDULED,
          title: 'Interview Scheduled',
          description: `${i.title} for ${app.job.title}`,
          createdAt: i.createdAt.toISOString(),
          actor: null,
        });
      }
      if (app.candidateInsight) {
        legacy.push({
          id: `insight-${app.candidateInsight.id}`,
          type: TimelineEventType.AI_ANALYSIS,
          title: 'AI Analysis Generated',
          description: `Match score: ${app.candidateInsight.matchScore}%`,
          createdAt: app.candidateInsight.createdAt.toISOString(),
          actor: null,
        });
      }
      if (app.offer) {
        legacy.push({
          id: `offer-${app.offer.id}`,
          type: TimelineEventType.OFFER_SENT,
          title: 'Offer Sent',
          description: `Offer for ${app.job.title}`,
          createdAt: app.offer.sentAt.toISOString(),
          actor: null,
        });
      }
      for (const h of app.stageHistory) {
        legacy.push({
          id: `stage-${h.id}`,
          type: TimelineEventType.STAGE_CHANGED,
          title: 'Stage Changed',
          description: h.fromStage ? `${h.fromStage} → ${h.toStage}` : `Moved to ${h.toStage}`,
          createdAt: h.changedAt.toISOString(),
          actor: null,
        });
      }
    }

    legacy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return legacy;
  }
}
