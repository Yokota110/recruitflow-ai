import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TimelineService } from '../timeline/timeline.service';
import { CreateTaskDto, UpdateTaskDto } from '../dto/crm.dto';
import { TaskStatus, TimelineEventType } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private timeline: TimelineService,
  ) {}

  async findAll(orgId: string, assigneeId?: string, status?: TaskStatus) {
    const tasks = await this.prisma.recruiterTask.findMany({
      where: {
        organizationId: orgId,
        ...(assigneeId && { assigneeId }),
        ...(status && { status }),
      },
      include: {
        candidate: { select: { id: true, firstName: true, lastName: true } },
        assignee: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
    });

    return tasks.map((t) => this.mapTask(t));
  }

  async findMyTasks(orgId: string, userId: string, limit = 5) {
    const tasks = await this.prisma.recruiterTask.findMany({
      where: {
        organizationId: orgId,
        assigneeId: userId,
        status: { not: TaskStatus.DONE },
      },
      include: {
        candidate: { select: { id: true, firstName: true, lastName: true } },
        assignee: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: limit,
    });
    return tasks.map((t) => this.mapTask(t));
  }

  async create(orgId: string, assigneeId: string, dto: CreateTaskDto) {
    const task = await this.prisma.recruiterTask.create({
      data: {
        organizationId: orgId,
        assigneeId,
        title: dto.title,
        type: dto.type,
        description: dto.description,
        candidateId: dto.candidateId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      include: {
        candidate: { select: { id: true, firstName: true, lastName: true } },
        assignee: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    return this.mapTask(task);
  }

  async update(orgId: string, userId: string, id: string, dto: UpdateTaskDto) {
    const task = await this.prisma.recruiterTask.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!task) throw new NotFoundException('Task not found');

    const isCompleting = dto.status === TaskStatus.DONE && task.status !== TaskStatus.DONE;

    const updated = await this.prisma.recruiterTask.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        completedAt: isCompleting ? new Date() : dto.status && dto.status !== TaskStatus.DONE ? null : undefined,
      },
      include: {
        candidate: { select: { id: true, firstName: true, lastName: true } },
        assignee: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (isCompleting && task.candidateId) {
      await this.timeline.record(orgId, task.candidateId, TimelineEventType.TASK_COMPLETED, `Task completed: ${task.title}`, {
        actorId: userId,
      });
    }

    return this.mapTask(updated);
  }

  private mapTask(t: {
    id: string;
    title: string;
    type: import('@prisma/client').TaskType;
    status: TaskStatus;
    description: string | null;
    dueDate: Date | null;
    completedAt: Date | null;
    candidate: { id: string; firstName: string; lastName: string } | null;
    assignee: { id: string; firstName: string; lastName: string };
  }) {
    return {
      id: t.id,
      title: t.title,
      type: t.type,
      status: t.status,
      description: t.description,
      dueDate: t.dueDate?.toISOString() ?? null,
      completedAt: t.completedAt?.toISOString() ?? null,
      candidate: t.candidate,
      assignee: t.assignee,
    };
  }
}
