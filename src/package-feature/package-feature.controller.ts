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
import { CreatePackageFeatureDto } from './dto/create-package-feature.dto';
import { QueryPackageFeatureDto } from './dto/query-package-feature.dto';
import { UpdatePackageFeatureDto } from './dto/update-package-feature.dto';
import { PackageFeatureService } from './package-feature.service';

@ApiTags('Package Features')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('package-features')
export class PackageFeatureController {
  constructor(private readonly featureService: PackageFeatureService) {}

  @Post()
  @Roles(USER_ROLE.SUPER_ADMIN, USER_ROLE.MANAGER)
  @ApiOperation({ summary: 'Create package feature' })
  @ApiResponse({
    status: 201,
    description: 'Package feature created successfully',
  })
  async create(@Body() dto: CreatePackageFeatureDto) {
    const data = await this.featureService.create(dto);
    return { data };
  }

  @Get()
  @Roles(USER_ROLE.SUPER_ADMIN, USER_ROLE.MANAGER)
  @ApiOperation({ summary: 'List package features' })
  @ApiResponse({ status: 200, description: 'List of package features' })
  async findAll(@Query() query: QueryPackageFeatureDto) {
    return this.featureService.findAll(query);
  }

  @Get(':id')
  @Roles(USER_ROLE.SUPER_ADMIN, USER_ROLE.MANAGER)
  @ApiOperation({ summary: 'Get package feature detail' })
  @ApiResponse({ status: 200, description: 'Package feature detail' })
  @ApiResponse({ status: 404, description: 'Package feature not found' })
  async findOne(@Param('id') id: string) {
    const data = await this.featureService.findOne(+id);
    return { data };
  }

  @Patch(':id')
  @Roles(USER_ROLE.SUPER_ADMIN, USER_ROLE.MANAGER)
  @ApiOperation({ summary: 'Update package feature' })
  async update(@Param('id') id: string, @Body() dto: UpdatePackageFeatureDto) {
    const data = await this.featureService.update(+id, dto);
    return { data };
  }

  @Delete(':id')
  @Roles(USER_ROLE.SUPER_ADMIN, USER_ROLE.MANAGER)
  @ApiOperation({ summary: 'Delete package feature (soft delete)' })
  async remove(@Param('id') id: string) {
    return this.featureService.remove(+id);
  }
}
