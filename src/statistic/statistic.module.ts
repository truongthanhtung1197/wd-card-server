import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Domain } from 'src/domain/entities/domain.entity';
import { Order } from 'src/order/entities/order.entity';
import { Service } from 'src/service/entities/service.entity';
import { User } from 'src/user/entities/user.entity';
import { StatisticController } from './statistic.controller';
import { StatisticService } from './statistic.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Service, User, Domain])],
  controllers: [StatisticController],
  providers: [StatisticService],
})
export class StatisticModule {}
