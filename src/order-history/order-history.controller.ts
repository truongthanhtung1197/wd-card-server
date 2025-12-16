import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetOrderHistoriesDto } from './dto/get-order-history.dto';
import { OrderHistoryService } from './order-history.service';

@ApiTags('Order Histories')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('order-histories')
export class OrderHistoryController {
  constructor(private readonly orderHistoryService: OrderHistoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all order history records with pagination' })
  @ApiResponse({ status: 200, description: 'List of order history records' })
  async findAll(@Query() query: GetOrderHistoriesDto) {
    return await this.orderHistoryService.findAll(query);
  }
}
