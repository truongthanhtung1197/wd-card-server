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
import { CreateMediaDto } from './dto/create-media.dto';
import { QueryMediaDto } from './dto/query-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { MediaService } from './media.service';

@ApiTags('Media')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @Roles(USER_ROLE.SUPER_ADMIN, USER_ROLE.MANAGER)
  @ApiOperation({ summary: 'Create media' })
  @ApiResponse({ status: 201, description: 'Media created successfully' })
  async create(@Body() dto: CreateMediaDto) {
    const data = await this.mediaService.create(dto);
    return { data };
  }

  @Get()
  @Roles(USER_ROLE.SUPER_ADMIN, USER_ROLE.MANAGER)
  @ApiOperation({ summary: 'List media' })
  @ApiResponse({ status: 200, description: 'List of media' })
  async findAll(@Query() query: QueryMediaDto) {
    return this.mediaService.findAll(query);
  }

  @Get(':id')
  @Roles(USER_ROLE.SUPER_ADMIN, USER_ROLE.MANAGER)
  @ApiOperation({ summary: 'Get media detail' })
  @ApiResponse({ status: 200, description: 'Media detail' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  async findOne(@Param('id') id: string) {
    const data = await this.mediaService.findOne(+id);
    return { data };
  }

  @Patch(':id')
  @Roles(USER_ROLE.SUPER_ADMIN, USER_ROLE.MANAGER)
  @ApiOperation({ summary: 'Update media' })
  async update(@Param('id') id: string, @Body() dto: UpdateMediaDto) {
    const data = await this.mediaService.update(+id, dto);
    return { data };
  }

  @Delete(':id')
  @Roles(USER_ROLE.SUPER_ADMIN, USER_ROLE.MANAGER)
  @ApiOperation({ summary: 'Delete media (soft delete)' })
  async remove(@Param('id') id: string) {
    return this.mediaService.remove(+id);
  }
}
