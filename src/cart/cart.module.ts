import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import { Cart } from './entities/cart.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Cart])],
  controllers: [],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
