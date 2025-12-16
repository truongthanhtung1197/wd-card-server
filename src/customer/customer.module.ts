import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Sales } from 'src/sales/entities/sales.entity';
import { User } from 'src/user/entities/user.entity';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { Customer } from './entities/customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, User, Sales])],
  controllers: [CustomerController],
  providers: [CustomerService, RolesGuard],
  exports: [CustomerService],
})
export class CustomerModule {}


