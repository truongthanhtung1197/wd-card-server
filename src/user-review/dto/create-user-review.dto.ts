import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateUserReviewDto {
  @ApiProperty({ example: 1, description: 'ID of user being reviewed' })
  @IsNumber()
  userId: number;

  @ApiPropertyOptional({ example: 123, description: 'Related order ID' })
  @IsOptional()
  @IsNumber()
  orderId?: number;

  @ApiProperty({
    example: 5,
    description: 'Rating from 1 to 5',
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({
    example: 'This user provided excellent service...',
    description: 'Detailed review comment',
  })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the review is public',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
