import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TimelineService } from '../timeline/timeline.service';
import { TemplatesService } from './templates.service';
import { CreateCampaignDto } from '../dto/crm.dto';
import {
  CampaignStatus, OutreachRecipientStatus, TimelineEventType,
} from '@prisma/client';

@Injectable()
export class OutreachService {
  constructor(
    private prisma: PrismaService,
    private timeline: TimelineService,
    private templates: TemplatesService,
  ) {}

  async findAll(orgId: string) {
    const campaigns = await this.prisma.outreachCampaign.findMany({
      where: { organizationId: orgId },
      include: {
        template: { select: { id: true, name: true, type: true } },
        _count: { select: { recipients: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return campaigns.map((c) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      sendDate: c.sendDate?.toISOString() ?? null,
      sentAt: c.sentAt?.toISOString() ?? null,
      template: c.template,
      recipientCount: c._count.recipients,
      createdAt: c.createdAt.toISOString(),
    }));
  }

  async findOne(orgId: string, id: string) {
    const campaign = await this.prisma.outreachCampaign.findFirst({
      where: { id, organizationId: orgId },
      include: {
        template: true,
        recipients: {
          include: {
            candidate: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
      },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async create(orgId: string, userId: string, dto: CreateCampaignDto) {
    const template = await this.prisma.emailTemplate.findFirst({
      where: { id: dto.templateId, organizationId: orgId },
    });
    if (!template) throw new NotFoundException('Template not found');

    const candidates = await this.prisma.candidate.findMany({
      where: { id: { in: dto.candidateIds }, organizationId: orgId },
    });
    if (candidates.length === 0) throw new BadRequestException('No valid candidates selected');

    const status = dto.sendDate ? CampaignStatus.SCHEDULED : CampaignStatus.DRAFT;

    return this.prisma.outreachCampaign.create({
      data: {
        organizationId: orgId,
        name: dto.name,
        templateId: dto.templateId,
        status,
        sendDate: dto.sendDate ? new Date(dto.sendDate) : undefined,
        createdById: userId,
        recipients: {
          create: candidates.map((c) => ({ candidateId: c.id })),
        },
      },
      include: {
        template: { select: { id: true, name: true, type: true } },
        _count: { select: { recipients: true } },
      },
    });
  }

  async send(orgId: string, userId: string, campaignId: string) {
    const campaign = await this.findOne(orgId, campaignId);
    if (campaign.status === CampaignStatus.SENT) {
      throw new BadRequestException('Campaign already sent');
    }

    const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      await tx.outreachRecipient.updateMany({
        where: { campaignId, status: OutreachRecipientStatus.PENDING },
        data: { status: OutreachRecipientStatus.SENT, sentAt: now },
      });

      await tx.outreachCampaign.update({
        where: { id: campaignId },
        data: { status: CampaignStatus.SENT, sentAt: now },
      });

      for (const recipient of campaign.recipients) {
        await tx.candidate.update({
          where: { id: recipient.candidateId },
          data: { lastContactedAt: now },
        });
      }
    });

    for (const recipient of campaign.recipients) {
      const candidate = recipient.candidate;
      this.templates.renderTemplate(campaign.template.subject, campaign.template.body, {
        candidateName: `${candidate.firstName} ${candidate.lastName}`,
        companyName: org?.name,
      });

      await this.timeline.record(orgId, recipient.candidateId, TimelineEventType.OUTREACH, `Outreach sent: ${campaign.name}`, {
        actorId: userId,
        description: `Campaign "${campaign.name}" — mock email delivered`,
        metadata: { campaignId, templateId: campaign.templateId },
      });

      await this.timeline.record(orgId, recipient.candidateId, TimelineEventType.EMAIL_SENT, 'Email Sent', {
        actorId: userId,
        description: campaign.template.subject,
      });
    }

    return { success: true, sentCount: campaign.recipients.length };
  }
}
