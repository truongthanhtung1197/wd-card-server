import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderDetail } from 'src/order-detail/entities/order-detail.entity';
import { OrderDetailController } from 'src/order-detail/order-detail.controller';
import { OrderService } from './order-detail.service';
@Module({
  imports: [TypeOrmModule.forFeature([OrderDetail])],
  controllers: [OrderDetailController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderDetailModule {}
