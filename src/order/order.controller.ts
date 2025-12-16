import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ROLE } from 'src/role/role.constant';
import { User } from 'src/user/entities/user.entity';
import { CreateOrderListDto } from './dto/create-order.dto';
import { GetMyOrdersDto, GetOrdersDto } from './dto/get-order.dto';
import {
  UpdateBillPaymentLinkDto,
  UpdateLinkDriveDto,
  UpdateOrderStatusDto,
  UpdatePriceAdjustmentDto,
  UpdatePriceDto,
} from './dto/update-order.dto';
import { OrderService } from './order.service';
@ApiTags('Orders')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post() // checked
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async create(
    @Body() createOrderDto: CreateOrderListDto,
    @CurrentUser() user: User,
  ) {
    return await this.orderService.create(createOrderDto, user);
  }

  @Get() // checked
  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({ status: 200, description: 'List of orders' })
  async findAll(@Query() query: GetOrdersDto, @CurrentUser() user: User) {
    return await this.orderService.findWithPagination({
      ...query,
      teamMemberRoleById: user.id,
    });
  }

  @Get('domain/:domainId')
  @Roles(
    ROLE.TEAM_LEADER,
    ROLE.VICE_TEAM_LEADER,
    ROLE.MANAGER,
    ROLE.ASSISTANT,
    ROLE.SUPER_ADMIN,
  )
  @ApiOperation({ summary: 'Get all orders of a domain' })
  @ApiResponse({ status: 200, description: 'List of orders by domain' })
  async findAllByDomain(
    @Param('domainId') domainId: string,
    @Query() query: GetOrdersDto,
    @CurrentUser() user: User,
  ) {
    return await this.orderService.findOrdersByDomainWithRoleScope({
      ...query,
      domainId,
      teamMemberRoleById: user.id,
    });
  }

  // @Get('export')
  // @ApiOperation({ summary: 'Export orders to CSV' })
  // @ApiResponse({ status: 200, description: 'CSV file' })
  // async export(
  //   @Query() query: GetOrdersDto,
  //   @CurrentUser() user: User,
  //   @Res() res: Response,
  // ) {
  //   const { filename, csv } = await this.orderService.exportOrdersCsv({
  //     ...query,
  //     teamMemberRoleById: user.id,
  //   });
  //   res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  //   res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  //   return res.send('\uFEFF' + csv);
  // }

  @Get('export')
  @ApiOperation({ summary: 'Export orders to Excel (.xlsx)' })
  @ApiResponse({ status: 200, description: 'Excel file' })
  async exportExcel(
    @Query() query: GetOrdersDto,
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    const { filename, buffer } = await this.orderService.exportOrdersExcel({
      ...query,
      teamMemberRoleById: user.id,
    });
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(Buffer.from(buffer));
  }

  @Get('my-orders') // checked
  @ApiOperation({ summary: 'Get my orders' })
  @ApiResponse({ status: 200, description: 'List of orders' })
  async findMyOrders(
    @Query() query: GetMyOrdersDto,
    @CurrentUser() user: User,
  ) {
    return await this.orderService.findWithPagination({
      ...query,
      userId: user.id,
    });
  }

  @Get('partner-manage-orders') // checked
  @ApiOperation({ summary: 'Get partner manage orders' })
  @ApiResponse({ status: 200, description: 'List of orders' })
  async findPartnerOrders(
    @Query() query: GetMyOrdersDto,
    @CurrentUser() user: User,
  ) {
    return await this.orderService.findWithPagination({
      ...query,
      userId: user.id,
      isPartnerManage: true,
    });
  }

  @Get('/order-of-my-team')
  @ApiOperation({ summary: 'Get orders of team' })
  @ApiResponse({ status: 200, description: 'List orders of team' })
  async findTeamOrders(
    @Query() query: GetMyOrdersDto,
    @CurrentUser() user: User,
  ) {
    return await this.orderService.findOrdersOfMyTeam({
      ...query,
      userId: user.id,
    });
  }

  @Get(':id') // checked
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order detail' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(@Param('id') id: string) {
    return await this.orderService.findOne(+id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status by ID' })
  @ApiResponse({
    status: 200,
    description: 'Order status updated',
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @CurrentUser() user: User,
  ) {
    return await this.orderService.updateStatus(
      +id,
      updateOrderStatusDto.status,
      updateOrderStatusDto.fileId,
      user,
    );
  }

  @Patch(':id/price-adjustment')
  @ApiOperation({ summary: 'Update order price adjustment by ID' })
  @ApiResponse({
    status: 200,
    description: 'Order price adjustment updated',
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updatePriceAdjustment(
    @Param('id') id: string,
    @Body() updatePriceAdjustmentDtoDto: UpdatePriceAdjustmentDto,
    @CurrentUser() user: User,
  ) {
    return await this.orderService.updatePriceAdjustment(
      +id,
      updatePriceAdjustmentDtoDto,
      user,
    );
  }

  @Patch(':id/price')
  @UseGuards(JwtAuthGuard)
  @Roles(ROLE.PARTNER, ROLE.SUPER_ADMIN, ROLE.MANAGER, ROLE.ASSISTANT)
  @ApiOperation({ summary: 'Update order price by ID' })
  @ApiResponse({
    status: 200,
    description: 'Order price updated',
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updatePrice(
    @Param('id') id: string,
    @Body() updatePriceDto: UpdatePriceDto,
    @CurrentUser() user: User,
  ) {
    return await this.orderService.updatePrice(+id, updatePriceDto, user);
  }

  @Patch('/order-detail/:id/add-link-drive')
  @ApiOperation({ summary: 'Add link drive to order detail by ID' })
  async updateLinkDrive(
    @Param('id') id: string,
    @Body() updateLinkDriveDto: UpdateLinkDriveDto,
    @CurrentUser() user: User,
  ) {
    return await this.orderService.updateLinkDrive(
      +id,
      updateLinkDriveDto,
      user,
    );
  }

  @Delete('/order-detail/:id')
  @ApiOperation({ summary: 'Delete order detail by ID' })
  async deleteOrderDetail(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.orderService.deleteOrderDetail(+id, user);
  }

  @Patch(':id/bill-payment-link')
  @ApiOperation({ summary: 'Update order by ID' })
  async updateBillPaymentLink(
    @Param('id') id: string,
    @Body() updateBillPaymentLinkDto: UpdateBillPaymentLinkDto,
    @CurrentUser() user: User,
  ) {
    return await this.orderService.updateBillPaymentLink(
      +id,
      updateBillPaymentLinkDto,
      user,
    );
  }

  // @Delete(':id')
  // @ApiOperation({ summary: 'Delete order by ID' })
  // async delete(@Param('id') id: string, @CurrentUser() user: User) {
  //   return await this.orderService.remove(+id, user.id);
  // }
}
