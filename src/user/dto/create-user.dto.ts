import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { BANK_NAME } from 'src/shared/constants/common.constants';

export class CreateUserDto {
  @ApiProperty({ example: 'John_Doe' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  displayName: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  roleId: number;

  @ApiPropertyOptional({ example: '@zorro' })
  @IsString()
  @IsOptional()
  telegramUsername: string;

  @ApiPropertyOptional({ example: '0909090909' })
  @IsString()
  @IsOptional()
  phone: string;

  @ApiPropertyOptional({ example: 'Trung Tuyen' })
  @IsString()
  @IsOptional()
  bankNameInCard: string;

  @ApiPropertyOptional({ example: '1234567890' })
  @IsString()
  @IsOptional()
  bankNumber: string;

  @ApiPropertyOptional({ example: BANK_NAME.Vietcombank })
  @IsEnum(BANK_NAME)
  @IsOptional()
  bankName: BANK_NAME;

  @ApiPropertyOptional({ example: '' })
  @IsString()
  @IsOptional()
  usdt: string;
}
