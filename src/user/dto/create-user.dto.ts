import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { USER_STATUS } from 'src/shared/constants/user.constant';

export class CreateUserDto {
  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: USER_STATUS.ACTIVE,
    enum: USER_STATUS,
  })
  @IsEnum(USER_STATUS)
  @IsOptional()
  status?: USER_STATUS;
}
