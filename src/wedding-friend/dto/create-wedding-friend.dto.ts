import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateWeddingFriendDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  weddingId: number;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  friendName: string;

  @ApiProperty({ example: 'Best Friend' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  relation: string;

  @ApiPropertyOptional({ example: 'Congratulations on your special day!' })
  @IsString()
  @IsOptional()
  personalMessage?: string;
}

