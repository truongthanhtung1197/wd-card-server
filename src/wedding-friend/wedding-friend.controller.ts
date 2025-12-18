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
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { USER_ROLE } from 'src/role/role.constant';
import { CreateWeddingFriendDto } from './dto/create-wedding-friend.dto';
import { QueryWeddingFriendDto } from './dto/query-wedding-friend.dto';
import { UpdateWeddingFriendDto } from './dto/update-wedding-friend.dto';
import { WeddingFriendService } from './wedding-friend.service';

@ApiTags('Wedding Friends')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('wedding-friends')
export class WeddingFriendController {
  constructor(private readonly weddingFriendService: WeddingFriendService) {}

  @Post()
  @Roles(USER_ROLE.SUPER_ADMIN, USER_ROLE.MANAGER)
  @ApiOperation({ summary: 'Create wedding friend' })
  @ApiResponse({
    status: 201,
    description: 'Wedding friend created successfully',
  })
  async create(@Body() dto: CreateWeddingFriendDto) {
    const data = await this.weddingFriendService.create(dto);
    return { data };
  }

  @Get()
  @Roles(USER_ROLE.SUPER_ADMIN, USER_ROLE.MANAGER)
  @ApiOperation({ summary: 'List wedding friends' })
  @ApiResponse({ status: 200, description: 'List of wedding friends' })
  async findAll(@Query() query: QueryWeddingFriendDto) {
    return this.weddingFriendService.findAll(query);
  }

  @Get(':id')
  @Roles(USER_ROLE.SUPER_ADMIN, USER_ROLE.MANAGER)
  @ApiOperation({ summary: 'Get wedding friend detail' })
  @ApiResponse({ status: 200, description: 'Wedding friend detail' })
  @ApiResponse({ status: 404, description: 'Wedding friend not found' })
  async findOne(@Param('id') id: string) {
    const data = await this.weddingFriendService.findOne(+id);
    return { data };
  }

  @Patch(':id')
  @Roles(USER_ROLE.SUPER_ADMIN, USER_ROLE.MANAGER)
  @ApiOperation({ summary: 'Update wedding friend' })
  async update(@Param('id') id: string, @Body() dto: UpdateWeddingFriendDto) {
    const data = await this.weddingFriendService.update(+id, dto);
    return { data };
  }

  @Delete(':id')
  @Roles(USER_ROLE.SUPER_ADMIN, USER_ROLE.MANAGER)
  @ApiOperation({ summary: 'Delete wedding friend (soft delete)' })
  async remove(@Param('id') id: string) {
    return this.weddingFriendService.remove(+id);
  }
}
