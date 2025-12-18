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
import { CreateRsvpDto } from './dto/create-rsvp.dto';
import { QueryRsvpDto } from './dto/query-rsvp.dto';
import { UpdateRsvpDto } from './dto/update-rsvp.dto';
import { RsvpService } from './rsvp.service';

@ApiTags('RSVPs')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('rsvps')
export class RsvpController {
  constructor(private readonly rsvpService: RsvpService) {}

  @Post()
  @Roles(USER_ROLE.SUPER_ADMIN, USER_ROLE.MANAGER)
  @ApiOperation({ summary: 'Create RSVP' })
  @ApiResponse({ status: 201, description: 'RSVP created successfully' })
  async create(@Body() dto: CreateRsvpDto) {
    const data = await this.rsvpService.create(dto);
    return { data };
  }

  @Get()
  @Roles(USER_ROLE.SUPER_ADMIN, USER_ROLE.MANAGER)
  @ApiOperation({ summary: 'List RSVPs' })
  @ApiResponse({ status: 200, description: 'List of RSVPs' })
  async findAll(@Query() query: QueryRsvpDto) {
    return this.rsvpService.findAll(query);
  }

  @Get(':id')
  @Roles(USER_ROLE.SUPER_ADMIN, USER_ROLE.MANAGER)
  @ApiOperation({ summary: 'Get RSVP detail' })
  @ApiResponse({ status: 200, description: 'RSVP detail' })
  @ApiResponse({ status: 404, description: 'RSVP not found' })
  async findOne(@Param('id') id: string) {
    const data = await this.rsvpService.findOne(+id);
    return { data };
  }

  @Patch(':id')
  @Roles(USER_ROLE.SUPER_ADMIN, USER_ROLE.MANAGER)
  @ApiOperation({ summary: 'Update RSVP' })
  async update(@Param('id') id: string, @Body() dto: UpdateRsvpDto) {
    const data = await this.rsvpService.update(+id, dto);
    return { data };
  }

  @Delete(':id')
  @Roles(USER_ROLE.SUPER_ADMIN, USER_ROLE.MANAGER)
  @ApiOperation({ summary: 'Delete RSVP (soft delete)' })
  async remove(@Param('id') id: string) {
    return this.rsvpService.remove(+id);
  }
}
