import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileRelation } from 'src/file-relation/entities/file-relation.entity';
import { File } from 'src/file/entities/file.entity';
import { Order } from 'src/order/entities/order.entity';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { Comment } from './entities/comment.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Comment, File, Order, FileRelation])],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}
