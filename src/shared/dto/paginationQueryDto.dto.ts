import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Page number',
    type: Number,
  })
  @IsOptional()
  page: number;

  @ApiPropertyOptional({
    description: 'Limit number',
    type: Number,
  })
  @IsOptional()
  limit: number;

  @ApiPropertyOptional({
    description: 'Sort by',
    type: String,
  })
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    type: String,
    enumName: 'SORT_ORDER',
  })
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

export class BaseQueryDto {
  @ApiPropertyOptional({
    description: 'Search user',
    type: String,
  })
  @IsOptional()
  search?: string;
}
