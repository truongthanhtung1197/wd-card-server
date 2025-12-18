import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { ORDER_STATUS } from '../entities/order.entity';

export class CreateOrderDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  packageId: number;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  saleId?: number;

  @ApiProperty({ example: 10.5, required: false })
  @IsNumber()
  @IsOptional()
  commissionPercentSnapshot?: number;

  @ApiProperty({ example: '2025-01-01' })
  @IsDateString()
  @Type(() => String)
  startAt: string;

  @ApiProperty({ example: '2025-12-31' })
  @IsDateString()
  @Type(() => String)
  endAt: string;

  @ApiProperty({ example: ORDER_STATUS.OPEN, enum: ORDER_STATUS })
  @IsEnum(ORDER_STATUS)
  @IsOptional()
  status?: ORDER_STATUS;
}
