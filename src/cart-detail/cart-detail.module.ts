import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from 'src/cart/entities/cart.entity';
import { CartDetailController } from './cart-detail.controller';
import { CartDetailService } from './cart-detail.service';
import { CartDetail } from './entities/cart-detail.entity';
@Module({
  imports: [TypeOrmModule.forFeature([CartDetail, Cart])],
  controllers: [CartDetailController],
  providers: [CartDetailService],
  exports: [CartDetailService],
})
export class CartDetailModule {}
