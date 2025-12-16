import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileRelationService } from 'src/file-relation/file-relation.service';
import { FileRelation } from './entities/file-relation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FileRelation])],
  providers: [FileRelationService],
})
export class FileRelationModule {}
