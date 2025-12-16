import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { SERVICE_TYPE } from 'src/shared/constants/service.constant';

export class CreateCartDetailDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  serviceId: number;

  @ApiPropertyOptional({
    example: SERVICE_TYPE.GP,
    enum: SERVICE_TYPE,
    description: 'Service type',
    nullable: false,
  })
  @IsOptional()
  @IsEnum(SERVICE_TYPE)
  serviceType: SERVICE_TYPE;

  @ApiProperty({ example: 1 })
  @IsNumber()
  quantity: number;
}
