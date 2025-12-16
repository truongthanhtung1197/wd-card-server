import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/order/entities/order.entity';
import { Team } from 'src/team/entities/team.entity';
import { User } from 'src/user/entities/user.entity';
import { DomainController } from './domain.controller';
import { DomainService } from './domain.service';
import { Domain } from './entities/domain.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Domain, User, Team, Order])],
  controllers: [DomainController],
  providers: [DomainService],
  exports: [DomainService],
})
export class DomainModule {}
