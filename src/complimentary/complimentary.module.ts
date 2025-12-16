import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplimentaryService } from './complimentary.service';
import { Complimentary } from './entities/complimentary.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Complimentary])],
  controllers: [],
  providers: [ComplimentaryService],
  exports: [ComplimentaryService],
})
export class ComplimentaryModule {}
