import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetStatisticDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Thời gian bắt đầu',
    example: '2025-06-01',
  })
  timeBegin: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Thời gian kết thúc',
    example: '2025-06-30',
  })
  timeEnd: string;
}
