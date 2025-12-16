import {
  Body,
  Controller,
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
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ROLE } from 'src/role/role.constant';
import { User } from 'src/user/entities/user.entity';
import { DomainOrderService } from './domain-order.service';
import { CreateDomainOrderListDto } from './dto/create-domain-order.dto';
import { GetDomainOrdersDto } from './dto/get-domain-order.dto';
import {
  UpdateDomainDetailStatusDto,
  UpdateDomainOrderDetailDto,
  UpdateDomainOrderDto,
  UpdateDomainOrderPriceDto,
  UpdateDomainOrderStatusDto,
  UpdateDomainPriceByTldDto,
  UpdateDomainStatusByTldDto,
} from './dto/update-domain-order.dto';
@ApiTags('Domain Orders')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('domain-orders')
export class DomainOrderController {
  constructor(private readonly orderService: DomainOrderService) {}

  @Post()
  @Roles(
    ROLE.MANAGER,
    ROLE.ASSISTANT,
    ROLE.TEAM_LEADER,
    ROLE.VICE_TEAM_LEADER,
    ROLE.DOMAIN_BUYER,
  )
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create a new domain order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async create(
    @Body() createOrderDto: CreateDomainOrderListDto,
    @CurrentUser() user: User,
  ) {
    return await this.orderService.create(createOrderDto, user);
  }

  @Get()
  @Roles(
    ROLE.MANAGER,
    ROLE.ASSISTANT,
    ROLE.TEAM_LEADER,
    ROLE.VICE_TEAM_LEADER,
    ROLE.DOMAIN_BUYER,
  )
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get all domain orders' })
  @ApiResponse({ status: 200, description: 'List of domain orders' })
  async findAll(@Query() query: GetDomainOrdersDto, @CurrentUser() user: User) {
    return await this.orderService.findWithPagination({
      ...query,
      userId: user.id,
    });
  }

  @Get(':id')
  @Roles(
    ROLE.MANAGER,
    ROLE.ASSISTANT,
    ROLE.TEAM_LEADER,
    ROLE.VICE_TEAM_LEADER,
    ROLE.DOMAIN_BUYER,
  )
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get domain order by ID' })
  @ApiResponse({ status: 200, description: 'Domain order detail' })
  @ApiResponse({ status: 404, description: 'Domain order not found' })
  async findOne(@Param('id') id: string) {
    return await this.orderService.findOne(+id);
  }

  @Get(':id/domains')
  @Roles(
    ROLE.MANAGER,
    ROLE.ASSISTANT,
    ROLE.TEAM_LEADER,
    ROLE.VICE_TEAM_LEADER,
    ROLE.DOMAIN_BUYER,
  )
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get domains of domain order by ID' })
  @ApiResponse({ status: 200, description: 'Domains of domain order detail' })
  @ApiResponse({ status: 404, description: 'Domain order not found' })
  async getDomainsOfDomainOrder(@Param('id') id: string) {
    return await this.orderService.getDomainsOfDomainOrder(+id);
  }

  @Patch('/update-domain-price-by-tld/:id')
  @Roles(ROLE.DOMAIN_BUYER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update domain order status by ID' })
  @ApiResponse({
    status: 200,
    description: 'Domain order status updated',
  })
  @ApiResponse({ status: 404, description: 'Domain order not found' })
  async updateDomainPriceByTld(
    @Param('id') id: string,
    @Body() dto: UpdateDomainPriceByTldDto,
  ) {
    return await this.orderService.updateDomainPriceByTld(id, dto);
  }

  @Patch('/update-domain-status-by-tld/:id')
  @Roles(ROLE.DOMAIN_BUYER)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Update domain detail status by TLD within an order',
  })
  @ApiResponse({
    status: 200,
    description: 'Domain detail status updated by TLD',
  })
  @ApiResponse({ status: 404, description: 'Domain order not found' })
  async updateDomainStatusByTld(
    @Param('id') id: string,
    @Body() dto: UpdateDomainStatusByTldDto,
  ) {
    return await this.orderService.updateDomainStatusByTld(id, dto);
  }

  @Patch('domain-detail/:id')
  @Roles(ROLE.DOMAIN_BUYER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update domain order status by ID' })
  @ApiResponse({
    status: 200,
    description: 'Domain order status updated',
  })
  @ApiResponse({ status: 404, description: 'Domain order not found' })
  async updateDomainDetail(
    @Param('id') id: string,
    @Body() dto: UpdateDomainOrderDetailDto,
  ) {
    return await this.orderService.updateDomainDetail(+id, dto);
  }

  @Patch(':id')
  @Roles(ROLE.DOMAIN_BUYER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update domain order status by ID' })
  @ApiResponse({
    status: 200,
    description: 'Domain order status updated',
  })
  @ApiResponse({ status: 404, description: 'Domain order not found' })
  async update(
    @Param('id') id: string,
    @Body() updateOrderDomainDto: UpdateDomainOrderDto,
  ) {
    return await this.orderService.update(+id, updateOrderDomainDto);
  }

  @Patch(':id/status')
  @Roles(ROLE.DOMAIN_BUYER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update domain order status by ID' })
  @ApiResponse({
    status: 200,
    description: 'Domain order status updated',
  })
  @ApiResponse({ status: 404, description: 'Domain order not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateDomainOrderStatusDto,
  ) {
    return await this.orderService.updateStatus(+id, updateOrderStatusDto);
  }

  @Patch(':id/price')
  @Roles(ROLE.DOMAIN_BUYER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update domain order price by ID' })
  async updatePrice(
    @Param('id') id: string,
    @Body() dto: UpdateDomainOrderPriceDto,
  ) {
    return await this.orderService.updatePrice(+id, dto);
  }

  @Patch(':orderId/domains/:domainId/status')
  @Roles(ROLE.DOMAIN_BUYER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update domain detail status by ID' })
  async updateDomainDetailStatus(
    @Param('orderId') orderId: string,
    @Param('domainId') domainId: string,
    @Body() dto: UpdateDomainDetailStatusDto,
  ) {
    return await this.orderService.updateDomainDetailStatus(
      +orderId,
      +domainId,
      dto,
    );
  }

  // @Delete(':orderId/domains/:domainId')
  // @ApiOperation({ summary: 'Delete a domain from order by ID' })
  // async deleteDomainDetail(
  //   @Param('orderId') orderId: string,
  //   @Param('domainId') domainId: string,
  // ) {
  //   return await this.orderService.deleteDomainDetail(+orderId, +domainId);
  // }
}
