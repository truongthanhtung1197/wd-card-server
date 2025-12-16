import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends OmitType(PartialType(CreateUserDto), [
  'password',
  'username',
]) {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'ID của file ảnh đại diện',
    required: false,
  })
  fileId: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty({
    description: 'Mật khẩu cũ',
    required: true,
  })
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty({
    description: 'Mật khẩu mới',
    required: true,
  })
  newPassword: string;
}

export class BlockUserDto {
  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Trạng thái khóa tài khoản',
    required: true,
  })
  isBlocked: boolean;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'ID của tài khoản',
    required: true,
  })
  userId: number;
}
