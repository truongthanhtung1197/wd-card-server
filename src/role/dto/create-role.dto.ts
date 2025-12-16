import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
export class CreateRoleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  role_name: string;
}
