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
import { ROLE } from 'src/role/role.constant';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { QueryUserRoleDto } from './dto/query-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UserRoleService } from './user-role.service';

@ApiTags('User Roles')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('user-roles')
export class UserRoleController {
  constructor(private readonly userRoleService: UserRoleService) {}

  @Post()
  @Roles(ROLE.SUPER_ADMIN, ROLE.MANAGER, ROLE.ASSISTANT)
  @ApiOperation({ summary: 'Create a new user role' })
  @ApiResponse({ status: 201, description: 'User role created successfully' })
  async create(@Body() dto: CreateUserRoleDto) {
    const data = await this.userRoleService.create(dto);
    return { data };
  }

  @Get()
  @Roles(ROLE.SUPER_ADMIN, ROLE.MANAGER, ROLE.ASSISTANT)
  @ApiOperation({ summary: 'Get list of user roles' })
  @ApiResponse({ status: 200, description: 'List of user roles' })
  async findAll(@Query() query: QueryUserRoleDto) {
    return this.userRoleService.findAll(query);
  }

  @Get(':id')
  @Roles(ROLE.SUPER_ADMIN, ROLE.MANAGER, ROLE.ASSISTANT)
  @ApiOperation({ summary: 'Get user role detail' })
  @ApiResponse({ status: 200, description: 'User role detail' })
  @ApiResponse({ status: 404, description: 'User role not found' })
  async findOne(@Param('id') id: string) {
    const data = await this.userRoleService.findOne(+id);
    return { data };
  }

  @Patch(':id')
  @Roles(ROLE.SUPER_ADMIN, ROLE.MANAGER, ROLE.ASSISTANT)
  @ApiOperation({ summary: 'Update user role' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    const data = await this.userRoleService.update(+id, dto);
    return { data };
  }

  @Delete(':id')
  @Roles(ROLE.SUPER_ADMIN, ROLE.MANAGER, ROLE.ASSISTANT)
  @ApiOperation({ summary: 'Delete user role (soft delete)' })
  async remove(@Param('id') id: string) {
    return this.userRoleService.remove(+id);
  }
}


