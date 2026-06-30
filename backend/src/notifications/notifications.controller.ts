import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermission } from '../common/decorators/permissions.decorator';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @RequirePermission('mod_notifications', 'view')
  findAll(@Query() query: any, @Request() req) {
    return this.notificationsService.findAll(query, req.user);
  }

  @Get('unread-count')
  @RequirePermission('mod_notifications', 'view')
  getUnreadCount(@Request() req) {
    return { count: this.notificationsService.getUnreadCount(req.user.sub) };
  }

  @Patch('mark-all-read')
  @RequirePermission('mod_notifications', 'mark_as_read')
  markAllAsRead(@Request() req) {
    this.notificationsService.markAllAsRead(req.user.sub);
    return { message: 'All notifications marked as read' };
  }

  @Patch(':id/read')
  @RequirePermission('mod_notifications', 'mark_as_read')
  markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationsService.markAsRead(id, req.user.sub);
  }

  @Post()
  @RequirePermission('mod_notifications', 'create')
  create(@Body() dto: CreateNotificationDto, @Request() req) {
    return this.notificationsService.createAnnouncement(dto, req.user);
  }

  @Delete(':id')
  @RequirePermission('mod_notifications', 'delete')
  remove(@Param('id') id: string, @Request() req) {
    this.notificationsService.delete(id, req.user.sub);
    return { message: 'Notification deleted' };
  }
}
