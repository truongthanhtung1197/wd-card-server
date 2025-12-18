import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { SALES_STATUS } from '../entities/sales.entity';

export class CreateSalesDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ example: 10.5 })
  @IsNumber()
  @IsNotEmpty()
  commissionPercent: number;

  @ApiProperty({ example: SALES_STATUS.ACTIVE, enum: SALES_STATUS })
  @IsEnum(SALES_STATUS)
  status: SALES_STATUS;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({ example: 'Bank of America' })
  @IsString()
  @IsOptional()
  bankName?: string;

  @ApiPropertyOptional({ example: '1234567890' })
  @IsString()
  @IsOptional()
  bankNumber?: string;

  @ApiPropertyOptional({ example: '1234567890' })
  @IsString()
  @IsOptional()
  phone?: string;
}
