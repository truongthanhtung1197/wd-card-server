import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { PACKAGE_STATUS } from '../entities/package.entity';

export class CreatePackageDto {
  @ApiProperty({ example: 'Premium package' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1000000 })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ example: 365 })
  @IsNumber()
  @IsNotEmpty()
  durationDays: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @IsNotEmpty()
  maxWeddings: number;

  @ApiProperty({ example: PACKAGE_STATUS.ACTIVE, enum: PACKAGE_STATUS })
  @IsEnum(PACKAGE_STATUS)
  status: PACKAGE_STATUS;
}


