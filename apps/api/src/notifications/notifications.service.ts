import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotificationType, NotificationCategory, NotificationPriority, Prisma,
} from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, orgId: string, filters?: {
    category?: NotificationCategory;
    archived?: boolean;
  }) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        organizationId: orgId,
        archived: filters?.archived ?? false,
        ...(filters?.category && { category: filters.category }),
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      take: 50,
    });
  }

  async getUnreadCount(userId: string, orgId: string) {
    return this.prisma.notification.count({
      where: { userId, organizationId: orgId, read: false, archived: false },
    });
  }

  async markRead(userId: string, orgId: string, id: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId, organizationId: orgId },
      data: { read: true },
    });
  }

  async markAllRead(userId: string, orgId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, organizationId: orgId, read: false },
      data: { read: true },
    });
  }

  async archive(userId: string, orgId: string, id: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId, organizationId: orgId },
      data: { archived: true, read: true },
    });
  }

  async create(
    orgId: string,
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Record<string, unknown>,
    category: NotificationCategory = NotificationCategory.SYSTEM,
    priority: NotificationPriority = NotificationPriority.NORMAL,
  ) {
    const jsonMeta = metadata as Prisma.InputJsonValue | undefined;
    return this.prisma.notification.create({
      data: {
        organizationId: orgId,
        userId,
        type,
        title,
        message,
        metadata: jsonMeta,
        category,
        priority,
      },
    });
  }

  async notifyOrgRecruiters(
    orgId: string,
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Record<string, unknown>,
    category: NotificationCategory = NotificationCategory.SYSTEM,
    priority: NotificationPriority = NotificationPriority.NORMAL,
  ) {
    const jsonMeta = metadata as Prisma.InputJsonValue | undefined;
    const members = await this.prisma.organizationMember.findMany({
      where: { organizationId: orgId },
      select: { userId: true },
    });

    await this.prisma.notification.createMany({
      data: members.map((m) => ({
        organizationId: orgId,
        userId: m.userId,
        type,
        title,
        message,
        metadata: jsonMeta,
        category,
        priority,
      })),
    });
  }
}
