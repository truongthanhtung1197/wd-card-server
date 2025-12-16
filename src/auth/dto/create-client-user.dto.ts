import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateClientUserDto {
  @ApiProperty({ example: 'John_Doe' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  displayName: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: '@zorro' })
  @IsString()
  @IsOptional()
  telegramUsername: string;

  @ApiProperty({ example: '0909090909' })
  @IsString()
  @IsOptional()
  phone: string;

  @ApiProperty({ example: 'Trung Tuyen' })
  @IsString()
  @IsOptional()
  bankNameInCard: string;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  @IsOptional()
  bankNumber: string;

  @ApiProperty({ example: '' })
  @IsString()
  @IsOptional()
  usdt: string;
}
