import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Domain } from 'src/domain/entities/domain.entity';
import { TeamMember } from 'src/team-member/entities/team-member.entity';
import { User } from 'src/user/entities/user.entity';
import { DomainOrderController } from './domain-order.controller';
import { DomainOrderService } from './domain-order.service';
import { DomainOrder } from './entities/domain-order.entity';
@Module({
  imports: [TypeOrmModule.forFeature([DomainOrder, TeamMember, Domain, User])],
  controllers: [DomainOrderController],
  providers: [DomainOrderService, RolesGuard],
  exports: [DomainOrderService],
})
export class DomainOrderModule {}
