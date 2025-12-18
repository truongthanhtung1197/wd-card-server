import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/role/entities/role.entity';
import { User } from 'src/user/entities/user.entity';
import { UserRoleController } from './user-role.controller';
import { UserRoleService } from './user-role.service';
import { UserRole } from './entities/user-role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserRole, User, Role])],
  controllers: [UserRoleController],
  providers: [UserRoleService, RolesGuard],
  exports: [UserRoleService],
})
export class UserRoleModule {}


