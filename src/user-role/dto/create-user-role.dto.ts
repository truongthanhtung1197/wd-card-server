import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { ROLE } from 'src/role/role.constant';

export class CreateUserRoleDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ example: ROLE.MANAGER, enum: ROLE })
  @IsEnum(ROLE)
  @IsNotEmpty()
  role: ROLE;
}


