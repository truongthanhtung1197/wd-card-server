import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplimentaryService } from 'src/complimentary/complimentary.service';
import { Complimentary } from 'src/complimentary/entities/complimentary.entity';
import { OrderDetail } from 'src/order-detail/entities/order-detail.entity';
import { ImportServiceProcessor } from 'src/service/import.processor';
import { Service } from './entities/service.entity';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';
@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'import-queue',
    }),
    TypeOrmModule.forFeature([Service, Complimentary, OrderDetail]),
  ],
  controllers: [ServiceController],
  providers: [ServiceService, ComplimentaryService, ImportServiceProcessor],
  exports: [ServiceService],
})
export class ServiceModule {}
