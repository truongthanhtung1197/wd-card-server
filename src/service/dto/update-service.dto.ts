import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty } from 'class-validator';
import { SERVICE_STATUS } from 'src/shared/constants/service.constant';
import { CreateServiceDto } from './create-service.dto';

export class UpdateServiceDto extends PartialType(CreateServiceDto) {}

export class UpdateMultipleServiceStatusDto {
  @ApiProperty({ example: [1, 2, 3] })
  @IsArray()
  @IsNotEmpty()
  ids: number[];

  @ApiProperty({ example: SERVICE_STATUS.APPROVED })
  @IsEnum(SERVICE_STATUS)
  @IsNotEmpty()
  status: SERVICE_STATUS;
}
