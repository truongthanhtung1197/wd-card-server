import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateClientUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: 1,
    description: 'Role ID from roles table',
  })
  @IsNumber()
  @IsNotEmpty()
  roleId: number;

  // Fields for CUSTOMER role (optional, will be validated in service based on roleId)
  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({ example: '1234567890', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  // Fields for SALES role (optional, will be validated in service based on roleId)
  @ApiProperty({ example: 10.5, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  commissionPercent?: number;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  salesFullName?: string;

  @ApiProperty({ example: 'Bank of America', required: false })
  @IsString()
  @IsOptional()
  bankName?: string;

  @ApiProperty({ example: '1234567890', required: false })
  @IsString()
  @IsOptional()
  bankNumber?: string;

  @ApiProperty({ example: '1234567890', required: false })
  @IsString()
  @IsOptional()
  salesPhone?: string;
}
