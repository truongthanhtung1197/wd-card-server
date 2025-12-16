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
import { CreatePackageDto } from './dto/create-package.dto';
import { QueryPackageDto } from './dto/query-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { PackageService } from './package.service';

@ApiTags('Packages')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('packages')
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  @Post()
  @Roles(ROLE.SUPER_ADMIN, ROLE.MANAGER)
  @ApiOperation({ summary: 'Create package' })
  @ApiResponse({ status: 201, description: 'Package created successfully' })
  async create(@Body() dto: CreatePackageDto) {
    const data = await this.packageService.create(dto);
    return { data };
  }

  @Get()
  @Roles(ROLE.SUPER_ADMIN, ROLE.MANAGER)
  @ApiOperation({ summary: 'List packages' })
  @ApiResponse({ status: 200, description: 'List of packages' })
  async findAll(@Query() query: QueryPackageDto) {
    return this.packageService.findAll(query);
  }

  @Get(':id')
  @Roles(ROLE.SUPER_ADMIN, ROLE.MANAGER)
  @ApiOperation({ summary: 'Get package detail' })
  @ApiResponse({ status: 200, description: 'Package detail' })
  @ApiResponse({ status: 404, description: 'Package not found' })
  async findOne(@Param('id') id: string) {
    const data = await this.packageService.findOne(+id);
    return { data };
  }

  @Patch(':id')
  @Roles(ROLE.SUPER_ADMIN, ROLE.MANAGER)
  @ApiOperation({ summary: 'Update package' })
  async update(@Param('id') id: string, @Body() dto: UpdatePackageDto) {
    const data = await this.packageService.update(+id, dto);
    return { data };
  }

  @Delete(':id')
  @Roles(ROLE.SUPER_ADMIN, ROLE.MANAGER)
  @ApiOperation({ summary: 'Delete package (soft delete)' })
  async remove(@Param('id') id: string) {
    return this.packageService.remove(+id);
  }
}


