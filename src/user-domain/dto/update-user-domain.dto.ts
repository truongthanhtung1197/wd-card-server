import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateUserDomainDto {
  @ApiProperty({ example: 'User ID' })
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
