import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateUserDomainDto {
  @ApiProperty({ example: 'Domain ID' })
  @IsNumber()
  @IsNotEmpty()
  domainId: number;

  @ApiProperty({ example: 'User ID' })
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
