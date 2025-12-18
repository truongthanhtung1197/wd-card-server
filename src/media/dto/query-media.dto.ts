import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsPositive, IsString } from 'class-validator';
import { MEDIA_TYPE } from '../entities/media.entity';

export class QueryMediaDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  limit?: number = 10;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  weddingId?: number;

  @ApiPropertyOptional({ example: MEDIA_TYPE.IMAGE, enum: MEDIA_TYPE })
  @IsEnum(MEDIA_TYPE)
  @IsOptional()
  mediaType?: MEDIA_TYPE;

  @ApiPropertyOptional({ example: 'WeddingFriend' })
  @IsString()
  @IsOptional()
  ownerType?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  ownerId?: number;
}

