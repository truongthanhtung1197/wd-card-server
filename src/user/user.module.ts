import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Customer } from 'src/customer/entities/customer.entity';
import { CustomerModule } from 'src/customer/customer.module';
import { Sales } from 'src/sales/entities/sales.entity';
import { SalesModule } from 'src/sales/sales.module';
import { UserRole } from 'src/user-role/entities/user-role.entity';
import { UserRoleModule } from 'src/user-role/user-role.module';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRole, Sales, Customer]),
    UserRoleModule,
    SalesModule,
    CustomerModule,
  ],
  controllers: [UserController],
  providers: [UserService, RolesGuard],
  exports: [UserService],
})
export class UserModule {}
