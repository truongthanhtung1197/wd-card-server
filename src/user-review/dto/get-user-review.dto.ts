import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class GetUserReviewsDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @ApiPropertyOptional({ example: 1, description: 'Filter by user ID' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  userId?: number;

  @ApiPropertyOptional({ example: 1, description: 'Filter by reviewer ID' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  reviewerId?: number;

  @ApiPropertyOptional({ example: 123, description: 'Filter by order ID' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  orderId?: number;
}
