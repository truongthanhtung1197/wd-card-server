import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartDetail } from 'src/cart-detail/entities/cart-detail.entity';
import { Domain } from 'src/domain/entities/domain.entity';
import { OrderDetail } from 'src/order-detail/entities/order-detail.entity';
import { Service } from 'src/service/entities/service.entity';
import { TeamMember } from 'src/team-member/entities/team-member.entity';
import { User } from 'src/user/entities/user.entity';
import { Order } from './entities/order.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      Service,
      CartDetail,
      Domain,
      User,
      TeamMember,
      OrderDetail,
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
