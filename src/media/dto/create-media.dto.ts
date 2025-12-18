import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { MEDIA_TYPE } from '../entities/media.entity';

export class CreateMediaDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  weddingId: number;

  @ApiProperty({ example: 'WeddingFriend' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  ownerType: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  ownerId: number;

  @ApiProperty({
    example: MEDIA_TYPE.IMAGE,
    enum: MEDIA_TYPE,
  })
  @IsEnum(MEDIA_TYPE)
  @IsOptional()
  mediaType?: MEDIA_TYPE;

  @ApiProperty({ example: 'https://example.com/image.jpg' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  url: string;

  @ApiPropertyOptional({ example: 'https://example.com/thumb.jpg' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  thumbUrl?: string;

  @ApiPropertyOptional({ example: { width: 1920, height: 1080 } })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

