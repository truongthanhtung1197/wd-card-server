import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/order/entities/order.entity';
import { User } from 'src/user/entities/user.entity';
import { OrderHistory } from './entities/order-history.entity';
import { OrderHistoryController } from './order-history.controller';
import { OrderHistoryService } from './order-history.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrderHistory, Order, User])],
  controllers: [OrderHistoryController],
  providers: [OrderHistoryService],
  exports: [OrderHistoryService],
})
export class OrderHistoryModule {}
