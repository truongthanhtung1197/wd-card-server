import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { DOMAIN_ORDER_STATUS } from 'src/shared/constants/domain-order.constant';
import { DOMAIN_STATUS } from 'src/shared/constants/domain.constant';

export class UpdateDomainOrderPriceDto {
  @ApiProperty({ example: 100000 })
  @IsNumber()
  @IsNotEmpty()
  price: number;
}

export class UpdateDomainOrderDto {
  @ApiPropertyOptional({ example: DOMAIN_ORDER_STATUS.BUYING })
  @IsEnum(DOMAIN_ORDER_STATUS)
  @IsOptional()
  status: DOMAIN_ORDER_STATUS;

  @ApiPropertyOptional({ example: 100000 })
  @IsNumber()
  @IsOptional()
  price: number;

  @ApiPropertyOptional({ example: 'description' })
  @IsString()
  @IsOptional()
  description: string;

  @ApiPropertyOptional({ example: 'mã đề xuất thanh toán' })
  @IsString()
  @IsOptional()
  proposeCode: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  teamId?: number;
}

export class UpdateDomainOrderDetailDto {
  @ApiPropertyOptional({
    example: 'SEOING',
    enum: DOMAIN_STATUS,
    default: DOMAIN_STATUS.SEOING,
  })
  @IsEnum(DOMAIN_STATUS)
  @IsOptional()
  status: DOMAIN_STATUS;

  @ApiPropertyOptional({ example: 1000 })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value) || 0)
  price?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  teamId?: number;
}

export class UpdateDomainOrderStatusDto {
  @ApiProperty({ example: DOMAIN_ORDER_STATUS.BUYING })
  @IsEnum(DOMAIN_ORDER_STATUS)
  @IsNotEmpty()
  status: DOMAIN_ORDER_STATUS;
}

export class UpdateDomainDetailStatusDto {
  @ApiProperty({ example: DOMAIN_STATUS.BUYING, enum: DOMAIN_STATUS })
  @IsEnum(DOMAIN_STATUS)
  @IsNotEmpty()
  status: DOMAIN_STATUS;
}

export class UpdateDomainPriceByTldDto {
  @IsString()
  @IsNotEmpty()
  tld!: string;

  @IsNumber()
  @IsNotEmpty()
  price!: number;

  @IsOptional()
  @IsBoolean()
  onlyWhenZero?: boolean;

  @ApiPropertyOptional({ example: DOMAIN_STATUS.BUYING, enum: DOMAIN_STATUS })
  @IsEnum(DOMAIN_STATUS)
  @IsOptional()
  status?: DOMAIN_STATUS;
}

export class UpdateDomainStatusByTldDto {
  @ApiProperty({ example: '.com' })
  @IsString()
  @IsNotEmpty()
  tld!: string;

  @ApiProperty({ example: DOMAIN_STATUS.BUYING, enum: DOMAIN_STATUS })
  @IsEnum(DOMAIN_STATUS)
  @IsNotEmpty()
  status!: DOMAIN_STATUS;
}
