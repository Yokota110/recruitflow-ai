import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateTemplateDto, UpdateTemplateDto, PreviewTemplateDto,
} from '../dto/crm.dto';

const TEMPLATE_VARIABLES = [
  '{{candidate_name}}',
  '{{job_title}}',
  '{{company_name}}',
  '{{interview_date}}',
] as const;

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  getVariables() {
    return TEMPLATE_VARIABLES;
  }

  async findAll(orgId: string) {
    return this.prisma.emailTemplate.findMany({
      where: { organizationId: orgId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(orgId: string, id: string) {
    const template = await this.prisma.emailTemplate.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async create(orgId: string, dto: CreateTemplateDto) {
    return this.prisma.emailTemplate.create({
      data: { organizationId: orgId, ...dto },
    });
  }

  async update(orgId: string, id: string, dto: UpdateTemplateDto) {
    await this.findOne(orgId, id);
    return this.prisma.emailTemplate.update({ where: { id }, data: dto });
  }

  preview(dto: PreviewTemplateDto) {
    const vars: Record<string, string> = {
      '{{candidate_name}}': dto.candidateName ?? 'Jane Smith',
      '{{job_title}}': dto.jobTitle ?? 'Senior Engineer',
      '{{company_name}}': dto.companyName ?? 'Acme Corp',
      '{{interview_date}}': dto.interviewDate ?? 'Monday, June 20 at 2:00 PM',
    };

    let subject = dto.subject;
    let body = dto.body;
    for (const [key, value] of Object.entries(vars)) {
      subject = subject.split(key).join(value);
      body = body.split(key).join(value);
    }

    return { subject, body };
  }

  renderTemplate(
    subject: string,
    body: string,
    vars: { candidateName?: string; jobTitle?: string; companyName?: string; interviewDate?: string },
  ) {
    return this.preview({
      subject,
      body,
      candidateName: vars.candidateName,
      jobTitle: vars.jobTitle,
      companyName: vars.companyName,
      interviewDate: vars.interviewDate,
    });
  }
}
