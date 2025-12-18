import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Package } from 'src/package/entities/package.entity';
import { Sales } from 'src/sales/entities/sales.entity';
import { User } from 'src/user/entities/user.entity';
import { UserRole } from 'src/user-role/entities/user-role.entity';
import { Order } from './entities/order.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, User, Package, Sales, UserRole]),
  ],
  controllers: [OrderController],
  providers: [OrderService, RolesGuard],
  exports: [OrderService],
})
export class OrderModule {}


