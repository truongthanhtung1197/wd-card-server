import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UpdateCartDetailDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  quantity: number;
}
