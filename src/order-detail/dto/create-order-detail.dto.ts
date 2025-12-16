import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CartDetail } from 'src/cart-detail/entities/cart-detail.entity';
import { SERVICE_TYPE } from 'src/shared/constants/service.constant';

export class CreateOrderItemDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  serviceId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  cartDetailId: number;

  @ApiProperty({
    example: SERVICE_TYPE.GP,
    enum: SERVICE_TYPE,
    description: 'Service type',
    nullable: false,
  })
  @IsNotEmpty()
  @IsEnum(SERVICE_TYPE)
  serviceType: SERVICE_TYPE;

  @ApiPropertyOptional({ example: 'Anchor Text 1' })
  @IsString()
  @IsOptional()
  anchorText1?: string;

  @ApiPropertyOptional({ example: 'Anchor Text 2' })
  @IsString()
  @IsOptional()
  anchorText2?: string;

  @ApiPropertyOptional({ example: 'URL 1' })
  @IsString()
  @IsOptional()
  url1?: string;

  @ApiPropertyOptional({ example: 'URL 2' })
  @IsString()
  @IsOptional()
  url2?: string;

  @ApiPropertyOptional({ example: 'Link Drive' })
  @IsString()
  @IsOptional()
  linkDrive?: string;

  @ApiPropertyOptional({ example: '2025-01-01' })
  @IsString()
  @IsOptional()
  orderAt?: Date;

  @ApiPropertyOptional({ example: '2025-01-01' })
  @IsString()
  @IsOptional()
  expiredAt?: Date;

  @ApiPropertyOptional({ example: 'New or Renew' })
  @IsString()
  @IsOptional()
  newOrRenew?: string;

  @ApiPropertyOptional({ example: 'Warranty Period' })
  @IsString()
  @IsOptional()
  warrantyPeriod?: string;
}

export class CreateOrderListDto {
  @ApiProperty({
    type: [CartDetail],
    example: [
      {
        serviceId: 1,
        quantity: 10,
        cartDetailId: 1,
        serviceType: SERVICE_TYPE.GP,
        anchorText1: 'Anchor Text 1',
        anchorText2: 'Anchor Text 2',
        url1: 'URL 1',
        url2: 'URL 2',
        linkDrive: 'Link Drive',
        orderAt: new Date(),
        expiredAt: new Date(),
        newOrRenew: 'New',
        warrantyPeriod: '1 year',
      },
    ],
  })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  @ArrayMinSize(1)
  orderItems: CreateOrderItemDto[];

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  domainId: number;

  @ApiProperty({ example: 100000 })
  @IsNumber()
  @IsNotEmpty()
  totalPrice: number;
}
