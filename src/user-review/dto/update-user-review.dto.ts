import { PartialType } from '@nestjs/swagger';
import { CreateUserReviewDto } from './create-user-review.dto';

export class UpdateUserReviewDto extends PartialType(CreateUserReviewDto) {}
