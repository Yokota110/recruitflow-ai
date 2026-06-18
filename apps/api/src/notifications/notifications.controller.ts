import { Controller, Get, Patch, Param, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../common/decorators/auth.decorator';
import { NotificationCategory } from '@prisma/client';

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  findAll(
    @CurrentUser('sub') userId: string,
    @CurrentUser('organizationId') orgId: string,
    @Query('category') category?: NotificationCategory,
    @Query('archived') archived?: string,
  ) {
    return this.notificationsService.findAll(userId, orgId, {
      category,
      archived: archived === 'true',
    });
  }

  @Get('unread-count')
  getUnreadCount(
    @CurrentUser('sub') userId: string,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.notificationsService.getUnreadCount(userId, orgId);
  }

  @Patch(':id/read')
  markRead(
    @CurrentUser('sub') userId: string,
    @CurrentUser('organizationId') orgId: string,
    @Param('id') id: string,
  ) {
    return this.notificationsService.markRead(userId, orgId, id);
  }

  @Patch('read-all')
  markAllRead(
    @CurrentUser('sub') userId: string,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.notificationsService.markAllRead(userId, orgId);
  }

  @Patch(':id/archive')
  archive(
    @CurrentUser('sub') userId: string,
    @CurrentUser('organizationId') orgId: string,
    @Param('id') id: string,
  ) {
    return this.notificationsService.archive(userId, orgId, id);
  }
}
