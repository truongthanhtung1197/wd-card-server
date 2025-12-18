import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Customer } from 'src/customer/entities/customer.entity';
import { Order } from 'src/order/entities/order.entity';
import { Template } from 'src/template/entities/template.entity';
import { User } from 'src/user/entities/user.entity';
import { UserRole } from 'src/user-role/entities/user-role.entity';
import { Wedding } from './entities/wedding.entity';
import { WeddingController } from './wedding.controller';
import { WeddingService } from './wedding.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Wedding,
      User,
      Customer,
      Template,
      Order,
      UserRole,
    ]),
  ],
  controllers: [WeddingController],
  providers: [WeddingService, RolesGuard],
  exports: [WeddingService],
})
export class WeddingModule {}
