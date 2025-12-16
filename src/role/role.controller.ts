import { Controller, Get, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Roles')
@ApiBearerAuth('jwt')
@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'List of roles' })
  async findAll() {
    const roles = await this.roleService.findAll();
    return { data: roles };
  }
}
