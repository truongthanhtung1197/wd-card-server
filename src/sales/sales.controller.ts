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
import { CreateSalesDto } from './dto/create-sales.dto';
import { QuerySalesDto } from './dto/query-sales.dto';
import { UpdateSalesDto } from './dto/update-sales.dto';
import { SalesService } from './sales.service';

@ApiTags('Sales')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @Roles(ROLE.SUPER_ADMIN, ROLE.MANAGER)
  @ApiOperation({ summary: 'Create sales record' })
  @ApiResponse({ status: 201, description: 'Sales created successfully' })
  async create(@Body() dto: CreateSalesDto) {
    const data = await this.salesService.create(dto);
    return { data };
  }

  @Get()
  @Roles(ROLE.SUPER_ADMIN, ROLE.MANAGER)
  @ApiOperation({ summary: 'List sales records' })
  @ApiResponse({ status: 200, description: 'List of sales records' })
  async findAll(@Query() query: QuerySalesDto) {
    return this.salesService.findAll(query);
  }

  @Get(':id')
  @Roles(ROLE.SUPER_ADMIN, ROLE.MANAGER)
  @ApiOperation({ summary: 'Get sales detail' })
  @ApiResponse({ status: 200, description: 'Sales detail' })
  @ApiResponse({ status: 404, description: 'Sales not found' })
  async findOne(@Param('id') id: string) {
    const data = await this.salesService.findOne(+id);
    return { data };
  }

  @Patch(':id')
  @Roles(ROLE.SUPER_ADMIN, ROLE.MANAGER)
  @ApiOperation({ summary: 'Update sales record' })
  async update(@Param('id') id: string, @Body() dto: UpdateSalesDto) {
    const data = await this.salesService.update(+id, dto);
    return { data };
  }

  @Delete(':id')
  @Roles(ROLE.SUPER_ADMIN, ROLE.MANAGER)
  @ApiOperation({ summary: 'Delete sales record (soft delete)' })
  async remove(@Param('id') id: string) {
    return this.salesService.remove(+id);
  }
}
