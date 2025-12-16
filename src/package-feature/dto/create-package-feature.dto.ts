import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePackageFeatureDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  packageId: number;

  @ApiProperty({ example: 'max_guests' })
  @IsString()
  @IsNotEmpty()
  featureKey: string;

  @ApiProperty({ example: '500' })
  @IsString()
  @IsNotEmpty()
  featureValue: string;
}


