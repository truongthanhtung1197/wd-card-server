import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ORDER_STATUS } from 'src/shared/constants/order.constant';

export class UpdateOrderDto {
  @ApiProperty({ example: ORDER_STATUS.SEOER_ORDER })
  @IsEnum(ORDER_STATUS)
  @IsNotEmpty()
  status: ORDER_STATUS;

  @ApiProperty({ example: 1 })
  @IsNumber()
  domainId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsOptional()
  fileId: number;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ example: ORDER_STATUS.CONFIRMED_BY_PARTNER })
  @IsEnum(ORDER_STATUS)
  @IsNotEmpty()
  status: ORDER_STATUS;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsOptional()
  fileId: number;
}

export class UpdatePriceAdjustmentDto {
  @ApiProperty({ example: 100000, required: true })
  @IsNumber()
  @IsNotEmpty()
  priceAdjustment: number;
}

export class UpdatePriceDto {
  @ApiProperty({ example: 100000, required: true })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiPropertyOptional({ example: 100000 })
  @IsNumber()
  @IsOptional()
  discount: number;
}

export class UpdateLinkDriveDto {
  @ApiProperty({ example: 'https://example.com', required: true })
  @IsString()
  @IsNotEmpty()
  linkDrive: string;
}

export class UpdateBillPaymentLinkDto {
  @ApiProperty({ example: 'https://example.com', required: true })
  @IsString()
  @IsNotEmpty()
  billPaymentLink: string;
}
