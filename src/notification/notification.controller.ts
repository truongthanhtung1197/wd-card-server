import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/user/entities/user.entity';
import { GetNotificationsDto } from './dto/get-notification.dto';
import { NotificationService } from './notification.service';

@ApiTags('Notifications')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications (paginated)' })
  @ApiResponse({ status: 200, description: 'List of notifications' })
  async findAll(
    @Query() query: GetNotificationsDto,
    @CurrentUser() user: User,
  ) {
    return await this.notificationService.findWithPagination({
      ...query,
      receiverId: user.id,
    });
  }

  @Patch('/read-all')
  @ApiOperation({ summary: 'Read all notifications' })
  @ApiResponse({ status: 200, description: 'List of notifications' })
  async readAll(@CurrentUser() user: User) {
    return await this.notificationService.readAll({
      receiverId: user.id,
    });
  }

  @Patch('/read/:id')
  @ApiOperation({ summary: 'Read notification by id' })
  @ApiResponse({ status: 200, description: 'Notification' })
  async readById(@CurrentUser() user: User, @Param('id') id: number) {
    return await this.notificationService.readById({
      receiverId: user.id,
      id,
    });
  }
}
