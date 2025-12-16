import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
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
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@ApiTags('Comments')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('order/:id')
  @ApiOperation({ summary: 'Create a new order comment' })
  @ApiResponse({
    status: 201,
    description: 'Order comment created successfully',
  })
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return await this.commentService.createOderComment(
      createCommentDto,
      user,
      +id,
    );
  }

  @Get('order/:id')
  @ApiOperation({ summary: 'Get all comments' })
  @ApiResponse({ status: 200, description: 'List of comments' })
  async findAll(@Param('id') id: string) {
    return await this.commentService.findAllOrderComments(+id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete comment by ID' })
  async delete(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.commentService.remove(+id, user);
  }
}
