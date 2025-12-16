import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { UserReview } from './entities/user-review.entity';
import { UserReviewController } from './user-review.controller';
import { UserReviewService } from './user-review.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserReview, User])],
  controllers: [UserReviewController],
  providers: [UserReviewService],
  exports: [UserReviewService],
})
export class UserReviewModule {}
