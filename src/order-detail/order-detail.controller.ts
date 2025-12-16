import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
@ApiTags('OrderDetails')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('order-details')
export class OrderDetailController {
  constructor() {}
}
