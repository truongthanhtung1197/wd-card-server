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
import { CreateCustomerDto } from './dto/create-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerService } from './customer.service';

@ApiTags('Customers')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @Roles(ROLE.SUPER_ADMIN, ROLE.MANAGER, ROLE.SALES)
  @ApiOperation({ summary: 'Create customer' })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  async create(@Body() dto: CreateCustomerDto) {
    const data = await this.customerService.create(dto);
    return { data };
  }

  @Get()
  @Roles(ROLE.SUPER_ADMIN, ROLE.MANAGER, ROLE.SALES)
  @ApiOperation({ summary: 'List customers' })
  @ApiResponse({ status: 200, description: 'List of customers' })
  async findAll(@Query() query: QueryCustomerDto) {
    return this.customerService.findAll(query);
  }

  @Get(':id')
  @Roles(ROLE.SUPER_ADMIN, ROLE.MANAGER, ROLE.SALES)
  @ApiOperation({ summary: 'Get customer detail' })
  @ApiResponse({ status: 200, description: 'Customer detail' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async findOne(@Param('id') id: string) {
    const data = await this.customerService.findOne(+id);
    return { data };
  }

  @Patch(':id')
  @Roles(ROLE.SUPER_ADMIN, ROLE.MANAGER, ROLE.SALES)
  @ApiOperation({ summary: 'Update customer' })
  async update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    const data = await this.customerService.update(+id, dto);
    return { data };
  }

  @Delete(':id')
  @Roles(ROLE.SUPER_ADMIN, ROLE.MANAGER, ROLE.SALES)
  @ApiOperation({ summary: 'Delete customer (soft delete)' })
  async remove(@Param('id') id: string) {
    return this.customerService.remove(+id);
  }
}


