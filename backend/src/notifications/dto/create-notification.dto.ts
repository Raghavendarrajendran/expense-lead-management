import { IsString, IsNotEmpty, IsEnum, IsArray, IsOptional, IsObject } from 'class-validator';
import { NotificationType } from '../enums/notification-type.enum';
import { NotificationChannel } from '../enums/notification-channel.enum';
import { NotificationPriority } from '../enums/notification-priority.enum';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  channel: NotificationChannel[];

  @IsEnum(NotificationPriority)
  priority: NotificationPriority;

  @IsString()
  @IsOptional()
  senderId?: string;

  @IsArray()
  @IsString({ each: true })
  receiverIds: string[];

  @IsString()
  @IsNotEmpty()
  module: string;

  @IsString()
  @IsOptional()
  referenceId?: string;

  @IsString()
  @IsOptional()
  actionUrl?: string;

  @IsString()
  @IsOptional()
  scheduledAt?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
