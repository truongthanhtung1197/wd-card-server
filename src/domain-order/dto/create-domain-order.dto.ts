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
import { DOMAIN_TYPE } from 'src/shared/constants/domain.constant';

export class CreateDomainOrderItemDto {
  @ApiProperty({ example: 'example.com' })
  @IsString()
  @IsNotEmpty()
  domainName: string;

  @ApiProperty({ example: DOMAIN_TYPE.NORMAL, enum: DOMAIN_TYPE })
  @IsString()
  @IsNotEmpty()
  @IsEnum(DOMAIN_TYPE)
  domainType: DOMAIN_TYPE;
}

export class CreateDomainOrderListDto {
  @ApiProperty({
    type: [CreateDomainOrderItemDto],
    example: [
      {
        domainName: 'example.com',
        domainType: DOMAIN_TYPE.NORMAL,
      },
    ],
  })
  @ValidateNested({ each: true })
  @Type(() => CreateDomainOrderItemDto)
  @ArrayMinSize(1)
  orderItems: CreateDomainOrderItemDto[];

  @ApiProperty({ example: 'Description of the order' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  teamId: number;
}
