import {
  Controller,
  Post,
  Put,
  Get,
  Delete,
  Body,
  Param,
  HttpStatus,
  ParseIntPipe,
  BadRequestException,
  Patch,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationDto } from './dto/notification.dto';
import { NotificationUpdateDto } from './dto/notification-update.dto';
import { INotification } from './interfaces/notification.interface';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../iam/login/decorators/auth-guard.decorator';
import { AuthType } from '../iam/login/enums/auth-type.enum';

interface ApiResponseMessage {
  message: string;
  status: number;
}

@ApiTags('notifications')
@ApiBearerAuth()
@AuthGuard(AuthType.Bearer)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Find all notifications' })
  @ApiResponse({ status: 200, description: 'Get all notifications' })
  public async findAll(): Promise<INotification[]> {
    return this.notificationsService.findAll();
  }

  @Get('/:notificationId')
  @ApiOperation({ summary: 'Find a notification by id' })
  @ApiResponse({ status: 200, description: 'Get a notification by id' })
  @ApiNotFoundResponse({ description: 'Notification not found' })
  public async findOne(
    @Param('notificationId', ParseIntPipe) notificationId: number,
  ): Promise<INotification> {
    return this.notificationsService.findById(notificationId);
  }

  @Get('/user/:userId')
  @ApiOperation({ summary: 'Find all notifications by user id' })
  @ApiResponse({ status: 200, description: 'Get all notifications by user id' })
  public async findByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<INotification[]> {
    return this.notificationsService.findByUserId(userId);
  }

  @Get('/user/:userId/unread')
  @ApiOperation({ summary: 'Find all unread notifications by user id' })
  @ApiResponse({ status: 200, description: 'Get all unread notifications by user id' })
  public async findUnreadByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<INotification[]> {
    return this.notificationsService.findUnreadByUserId(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiCreatedResponse({ description: 'Notification created successfully' })
  @ApiBadRequestResponse({ description: 'Notification not created' })
  public async create(@Body() notificationDto: NotificationDto): Promise<INotification> {
    return this.notificationsService.create(notificationDto);
  }

  @Put('/:notificationId')
  @ApiOperation({ summary: 'Update a notification by id' })
  @ApiResponse({ status: 200, description: 'Update a notification by id' })
  @ApiBadRequestResponse({ description: 'Notification not updated' })
  public async update(
    @Param('notificationId', ParseIntPipe) notificationId: number,
    @Body() notificationUpdateDto: NotificationUpdateDto,
  ): Promise<ApiResponseMessage> {
    try {
      await this.notificationsService.update(notificationId, notificationUpdateDto);

      return {
        message: 'Notification updated successfully!',
        status: HttpStatus.OK,
      };
    } catch (err) {
      throw new BadRequestException(err, 'Error: Notification not updated!');
    }
  }

  @Patch('/:notificationId/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  @ApiBadRequestResponse({ description: 'Notification not updated' })
  public async markAsRead(
    @Param('notificationId', ParseIntPipe) notificationId: number,
  ): Promise<ApiResponseMessage> {
    try {
      await this.notificationsService.markAsRead(notificationId);

      return {
        message: 'Notification marked as read!',
        status: HttpStatus.OK,
      };
    } catch (err) {
      throw new BadRequestException(err, 'Error: Notification not updated!');
    }
  }

  @Patch('/user/:userId/read-all')
  @ApiOperation({ summary: 'Mark all notifications as read for a user' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  @ApiBadRequestResponse({ description: 'Notifications not updated' })
  public async markAllAsRead(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<ApiResponseMessage> {
    try {
      await this.notificationsService.markAllAsReadByUserId(userId);

      return {
        message: 'All notifications marked as read!',
        status: HttpStatus.OK,
      };
    } catch (err) {
      throw new BadRequestException(err, 'Error: Notifications not updated!');
    }
  }

  @Delete('/:notificationId')
  @ApiOperation({ summary: 'Delete a notification by id' })
  @ApiResponse({ status: 200, description: 'Delete a notification by id' })
  @ApiNotFoundResponse({ description: 'Notification not found' })
  public async delete(
    @Param('notificationId', ParseIntPipe) notificationId: number,
  ): Promise<ApiResponseMessage> {
    await this.notificationsService.delete(notificationId);

    return {
      message: 'Notification deleted successfully!',
      status: HttpStatus.OK,
    };
  }
}

