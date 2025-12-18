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
import { CreateWeddingDto } from './dto/create-wedding.dto';
import { QueryWeddingDto } from './dto/query-wedding.dto';
import { UpdateWeddingDto } from './dto/update-wedding.dto';
import { WeddingService } from './wedding.service';

@ApiTags('Weddings')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('weddings')
export class WeddingController {
  constructor(private readonly weddingService: WeddingService) {}

  @Post()
  @Roles(USER_ROLE.SUPER_ADMIN, USER_ROLE.MANAGER)
  @ApiOperation({ summary: 'Create wedding' })
  @ApiResponse({ status: 201, description: 'Wedding created successfully' })
  async create(@Body() dto: CreateWeddingDto) {
    const data = await this.weddingService.create(dto);
    return { data };
  }

  @Get()
  @Roles(USER_ROLE.SUPER_ADMIN, USER_ROLE.MANAGER)
  @ApiOperation({ summary: 'List weddings' })
  @ApiResponse({ status: 200, description: 'List of weddings' })
  async findAll(@Query() query: QueryWeddingDto) {
    return this.weddingService.findAll(query);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get wedding by slug' })
  @ApiResponse({ status: 200, description: 'Wedding detail' })
  @ApiResponse({ status: 404, description: 'Wedding not found' })
  async findBySlug(@Param('slug') slug: string) {
    const data = await this.weddingService.findBySlug(slug);
    return { data };
  }

  @Get(':id')
  @Roles(USER_ROLE.SUPER_ADMIN, USER_ROLE.MANAGER)
  @ApiOperation({ summary: 'Get wedding detail' })
  @ApiResponse({ status: 200, description: 'Wedding detail' })
  @ApiResponse({ status: 404, description: 'Wedding not found' })
  async findOne(@Param('id') id: string) {
    const data = await this.weddingService.findOne(+id);
    return { data };
  }

  @Patch(':id')
  @Roles(USER_ROLE.SUPER_ADMIN, USER_ROLE.MANAGER)
  @ApiOperation({ summary: 'Update wedding' })
  async update(@Param('id') id: string, @Body() dto: UpdateWeddingDto) {
    const data = await this.weddingService.update(+id, dto);
    return { data };
  }

  @Delete(':id')
  @Roles(USER_ROLE.SUPER_ADMIN, USER_ROLE.MANAGER)
  @ApiOperation({ summary: 'Delete wedding (soft delete)' })
  async remove(@Param('id') id: string) {
    return this.weddingService.remove(+id);
  }
}
