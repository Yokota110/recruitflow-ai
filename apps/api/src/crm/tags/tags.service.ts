import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TimelineService } from '../timeline/timeline.service';
import { CreateTagDto, AddTagToCandidateDto } from '../dto/crm.dto';
import { TimelineEventType } from '@prisma/client';

@Injectable()
export class TagsService {
  constructor(
    private prisma: PrismaService,
    private timeline: TimelineService,
  ) {}

  async findAll(orgId: string) {
    return this.prisma.tag.findMany({
      where: { organizationId: orgId },
      orderBy: { name: 'asc' },
      include: { _count: { select: { candidates: true } } },
    });
  }

  async create(orgId: string, dto: CreateTagDto) {
    const existing = await this.prisma.tag.findUnique({
      where: { organizationId_name: { organizationId: orgId, name: dto.name } },
    });
    if (existing) throw new ConflictException('Tag already exists');

    return this.prisma.tag.create({
      data: { organizationId: orgId, name: dto.name, color: dto.color ?? '#E8653A' },
    });
  }

  async addToCandidate(orgId: string, userId: string, candidateId: string, dto: AddTagToCandidateDto) {
    const candidate = await this.prisma.candidate.findFirst({
      where: { id: candidateId, organizationId: orgId },
    });
    if (!candidate) throw new NotFoundException('Candidate not found');

    const tag = await this.prisma.tag.findFirst({
      where: { id: dto.tagId, organizationId: orgId },
    });
    if (!tag) throw new NotFoundException('Tag not found');

    const existing = await this.prisma.candidateTag.findUnique({
      where: { candidateId_tagId: { candidateId, tagId: dto.tagId } },
    });
    if (existing) return existing;

    const link = await this.prisma.candidateTag.create({
      data: { candidateId, tagId: dto.tagId },
      include: { tag: true },
    });

    await this.timeline.record(orgId, candidateId, TimelineEventType.TAG_ADDED, `Tag added: ${tag.name}`, {
      actorId: userId,
    });

    return link;
  }

  async removeFromCandidate(orgId: string, candidateId: string, tagId: string) {
    await this.prisma.candidate.findFirstOrThrow({
      where: { id: candidateId, organizationId: orgId },
    });
    await this.prisma.candidateTag.deleteMany({
      where: { candidateId, tagId },
    });
    return { success: true };
  }
}
