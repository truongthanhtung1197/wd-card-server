import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { User } from 'src/user/entities/user.entity';
import { Sales } from './entities/sales.entity';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';

@Module({
  imports: [TypeOrmModule.forFeature([Sales, User])],
  controllers: [SalesController],
  providers: [SalesService, RolesGuard],
  exports: [SalesService],
})
export class SalesModule {}
