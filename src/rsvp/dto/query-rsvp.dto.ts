import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsPositive } from 'class-validator';
import { RSVP_ATTENDANCE } from '../entities/rsvp.entity';

export class QueryRsvpDto {
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

  @ApiPropertyOptional({ example: RSVP_ATTENDANCE.YES, enum: RSVP_ATTENDANCE })
  @IsEnum(RSVP_ATTENDANCE)
  @IsOptional()
  attendance?: RSVP_ATTENDANCE;
}

