import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  DOMAIN_STATUS,
  DOMAIN_TYPE,
} from 'src/shared/constants/domain.constant';

export class CreateDomainDto {
  @ApiProperty({ example: 'Domain Name' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'SEOING',
    enum: DOMAIN_STATUS,
    default: DOMAIN_STATUS.SEOING,
  })
  @IsEnum(DOMAIN_STATUS)
  status: DOMAIN_STATUS;

  @ApiProperty({ example: 'NORMAL' })
  @IsEnum(DOMAIN_TYPE)
  @IsNotEmpty()
  type: DOMAIN_TYPE;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  budget: number;

  @ApiPropertyOptional({ example: 1000 })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value) || 0)
  price?: number;

  @ApiPropertyOptional({ example: 1, nullable: true, default: null })
  @IsNumber()
  @IsOptional()
  teamId: number | null;
}
