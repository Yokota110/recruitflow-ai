import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchQueryDto } from '../dto/crm.dto';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(orgId: string, query: SearchQueryDto) {
    const q = query.q.trim();
    const limit = query.limit ?? 10;

    if (!q) {
      return { candidates: [], jobs: [] };
    }

    const [candidates, jobs] = await Promise.all([
      this.prisma.candidate.findMany({
        where: {
          organizationId: orgId,
          OR: [
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { location: { contains: q, mode: 'insensitive' } },
            { skills: { some: { name: { contains: q, mode: 'insensitive' } } } },
            { experiences: { some: { company: { contains: q, mode: 'insensitive' } } } },
          ],
        },
        take: limit,
        include: {
          skills: { take: 5 },
          experiences: { where: { isCurrent: true }, take: 1 },
        },
      }),
      this.prisma.job.findMany({
        where: {
          organizationId: orgId,
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { department: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: limit,
        select: { id: true, title: true, department: true },
      }),
    ]);

    return {
      candidates: candidates.map((c) => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        email: c.email,
        location: c.location,
        skills: c.skills.map((s) => s.name),
        company: c.experiences[0]?.company ?? null,
      })),
      jobs,
    };
  }
}
