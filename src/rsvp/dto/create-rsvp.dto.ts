import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { RSVP_ATTENDANCE } from '../entities/rsvp.entity';

export class CreateRsvpDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  weddingId: number;

  @ApiProperty({ example: 'Jane Smith' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  guestName: string;

  @ApiProperty({
    example: RSVP_ATTENDANCE.YES,
    enum: RSVP_ATTENDANCE,
  })
  @IsEnum(RSVP_ATTENDANCE)
  @IsOptional()
  attendance?: RSVP_ATTENDANCE;

  @ApiPropertyOptional({ example: 'Looking forward to celebrating with you!' })
  @IsString()
  @IsOptional()
  message?: string;
}

