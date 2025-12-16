import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { FILE_RELATION_TYPE } from 'src/shared/constants/file.constant';
import { AbstractTransactionService } from 'src/shared/services/abstract-transaction.service';
import { User } from 'src/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateUserReviewDto } from './dto/create-user-review.dto';
import { GetUserReviewsDto } from './dto/get-user-review.dto';
import { UpdateUserReviewDto } from './dto/update-user-review.dto';
import { UserReview } from './entities/user-review.entity';

@Injectable()
export class UserReviewService extends AbstractTransactionService {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    @InjectRepository(UserReview)
    private userReviewRepository: Repository<UserReview>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super(dataSource);
  }

  async create(createUserReviewDto: CreateUserReviewDto, currentUser: User) {
    return this.executeInTransaction(async (queryRunner, manager) => {
      // Check if reviewed user exists
      const reviewedUser = await manager.findOne(User, {
        where: { id: createUserReviewDto.userId },
      });

      if (!reviewedUser) {
        throw new NotFoundException('User not found');
      }

      // Prevent self-review
      if (createUserReviewDto.userId === currentUser.id) {
        throw new ForbiddenException('You cannot review yourself');
      }

      // Create review
      const review = manager.create(UserReview, {
        ...createUserReviewDto,
        reviewerId: currentUser.id,
      });

      const savedReview = await manager.save(UserReview, review);

      // Calculate and update average rating for the reviewed user
      await this.updateUserAverageRating(createUserReviewDto.userId, manager);

      return plainToInstance(UserReview, savedReview);
    });
  }

  async findAll(query: GetUserReviewsDto) {
    const { page = 1, limit = 10, userId, reviewerId, orderId } = query;

    const queryBuilder = this.userReviewRepository
      .createQueryBuilder('user_reviews')
      .leftJoinAndSelect('user_reviews.user', 'user')
      .leftJoinAndSelect('user_reviews.reviewer', 'reviewer')
      .leftJoinAndSelect(
        'reviewer.fileRelations',
        'reviewerFileRelations',
        'reviewerFileRelations.relatedType = :userFileRelationstType AND reviewerFileRelations.relatedId = reviewer.id',
        {
          userFileRelationstType: FILE_RELATION_TYPE.USER_AVATAR,
        },
      )
      .leftJoinAndSelect('reviewerFileRelations.file', 'reviewerFile')
      .where('user_reviews.isPublic = :isPublic', { isPublic: true })
      .orderBy('user_reviews.createdAt', 'DESC')
      .skip((Number(page) - 1) * Number(limit))
      .take(Number(limit));

    if (userId) {
      queryBuilder.andWhere('user_reviews.userId = :userId', { userId });
    }

    if (reviewerId) {
      queryBuilder.andWhere('user_reviews.reviewerId = :reviewerId', {
        reviewerId,
      });
    }

    if (orderId) {
      queryBuilder.andWhere('user_reviews.orderId = :orderId', { orderId });
    }

    const [reviews, total] = await queryBuilder.getManyAndCount();

    return {
      data: plainToInstance(UserReview, reviews),
      page: Number(page),
      limit: Number(limit),
      total,
    };
  }

  async findOne(id: number) {
    const review = await this.userReviewRepository.findOne({
      where: { id },
      relations: ['user', 'reviewer'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return plainToInstance(UserReview, review);
  }

  async update(
    id: number,
    updateUserReviewDto: UpdateUserReviewDto,
    currentUser: User,
  ) {
    return this.executeInTransaction(async (queryRunner, manager) => {
      const review = await manager.findOne(UserReview, {
        where: { id },
      });

      if (!review) {
        throw new NotFoundException('Review not found');
      }

      // Only the reviewer can update their own review
      if (review.reviewerId !== currentUser.id) {
        throw new ForbiddenException('You can only update your own reviews');
      }

      // Update review
      await manager.update(UserReview, id, updateUserReviewDto);

      // If rating was updated, recalculate average
      if (updateUserReviewDto.rating !== undefined) {
        await this.updateUserAverageRating(review.userId, manager);
      }

      const updatedReview = await manager.findOne(UserReview, {
        where: { id },
        relations: ['user', 'reviewer'],
      });

      return plainToInstance(UserReview, updatedReview);
    });
  }

  async remove(id: number, currentUser: User) {
    return this.executeInTransaction(async (queryRunner, manager) => {
      const review = await manager.findOne(UserReview, {
        where: { id },
      });

      if (!review) {
        throw new NotFoundException('Review not found');
      }

      // Only the reviewer can delete their own review
      if (review.reviewerId !== currentUser.id) {
        throw new ForbiddenException('You can only delete your own reviews');
      }

      const userId = review.userId;

      // Soft delete the review
      await manager.softDelete(UserReview, id);

      // Recalculate average rating after deletion
      await this.updateUserAverageRating(userId, manager);

      return { message: 'Review deleted successfully' };
    });
  }

  /**
   * Calculate and update the average rating for a user
   */
  private async updateUserAverageRating(
    userId: number,
    manager: any,
  ): Promise<void> {
    const result = await manager
      .createQueryBuilder(UserReview, 'user_reviews')
      .select('AVG(user_reviews.rating)', 'avgRating')
      .where('user_reviews.userId = :userId', { userId })
      .andWhere('user_reviews.deletedAt IS NULL')
      .getRawOne();

    const avgRating = result?.avgRating
      ? parseFloat(parseFloat(result.avgRating).toFixed(2))
      : null;

    await manager.update(User, userId, { avgRating });
  }

  /**
   * Get user statistics including average rating and review count
   */
  async getUserReviewStats(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const stats = await this.userReviewRepository
      .createQueryBuilder('user_reviews')
      .select('COUNT(*)', 'totalReviews')
      .addSelect('AVG(user_reviews.rating)', 'avgRating')
      .addSelect(
        'SUM(CASE WHEN user_reviews.rating = 5 THEN 1 ELSE 0 END)',
        'fiveStars',
      )
      .addSelect(
        'SUM(CASE WHEN user_reviews.rating = 4 THEN 1 ELSE 0 END)',
        'fourStars',
      )
      .addSelect(
        'SUM(CASE WHEN user_reviews.rating = 3 THEN 1 ELSE 0 END)',
        'threeStars',
      )
      .addSelect(
        'SUM(CASE WHEN user_reviews.rating = 2 THEN 1 ELSE 0 END)',
        'twoStars',
      )
      .addSelect(
        'SUM(CASE WHEN user_reviews.rating = 1 THEN 1 ELSE 0 END)',
        'oneStar',
      )
      .where('user_reviews.userId = :userId', { userId })
      .andWhere('user_reviews.isPublic = :isPublic', { isPublic: true })
      .getRawOne();

    return {
      userId,
      avgRating: stats.avgRating
        ? parseFloat(parseFloat(stats.avgRating).toFixed(2))
        : 0,
      totalReviews: parseInt(stats.totalReviews) || 0,
      ratingDistribution: {
        5: parseInt(stats.fiveStars) || 0,
        4: parseInt(stats.fourStars) || 0,
        3: parseInt(stats.threeStars) || 0,
        2: parseInt(stats.twoStars) || 0,
        1: parseInt(stats.oneStar) || 0,
      },
    };
  }
}
