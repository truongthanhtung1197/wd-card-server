import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ROLE } from 'src/role/role.constant';
import { User } from 'src/user/entities/user.entity';
import { CreateUserReviewDto } from './dto/create-user-review.dto';
import { GetUserReviewsDto } from './dto/get-user-review.dto';
import { UpdateUserReviewDto } from './dto/update-user-review.dto';
import { UserReviewService } from './user-review.service';

@ApiTags('User Reviews')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('user-reviews')
export class UserReviewController {
  constructor(private readonly userReviewService: UserReviewService) {}

  @Post()
  @Roles(
    ROLE.SEOER,
    ROLE.MANAGER,
    ROLE.ASSISTANT,
    ROLE.TEAM_LEADER,
    ROLE.VICE_TEAM_LEADER,
    ROLE.DOMAIN_BUYER,
  )
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create a new user review' })
  @ApiResponse({
    status: 201,
    description: 'User review created successfully',
  })
  async create(
    @Body() createUserReviewDto: CreateUserReviewDto,
    @CurrentUser() user: User,
  ) {
    return await this.userReviewService.create(createUserReviewDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user reviews with pagination' })
  @ApiResponse({ status: 200, description: 'List of user reviews' })
  async findAll(@Query() query: GetUserReviewsDto) {
    return await this.userReviewService.findAll(query);
  }

  @Get('stats/:userId')
  @ApiOperation({ summary: 'Get user review statistics' })
  @ApiResponse({ status: 200, description: 'User review statistics' })
  async getStats(@Param('userId') userId: string) {
    return await this.userReviewService.getUserReviewStats(+userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single user review by ID' })
  @ApiResponse({ status: 200, description: 'User review details' })
  async findOne(@Param('id') id: string) {
    return await this.userReviewService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user review' })
  @ApiResponse({ status: 200, description: 'User review updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateUserReviewDto: UpdateUserReviewDto,
    @CurrentUser() user: User,
  ) {
    return await this.userReviewService.update(+id, updateUserReviewDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user review' })
  @ApiResponse({ status: 200, description: 'User review deleted successfully' })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.userReviewService.remove(+id, user);
  }
}
