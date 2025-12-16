import {
  ApiPropertyOptional,
  IntersectionType,
  OmitType,
} from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ORDER_STATUS } from 'src/shared/constants/order.constant';
import { SERVICE_TYPE } from 'src/shared/constants/service.constant';
import { PaginationQueryDto } from 'src/shared/dto/paginationQueryDto.dto';

export class GetOrdersDto extends IntersectionType(PaginationQueryDto) {
  @ApiPropertyOptional({
    description: 'Filter order by status',
    enum: ORDER_STATUS,
    type: [ORDER_STATUS],
    enumName: 'ORDER_STATUS',
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  @IsEnum(ORDER_STATUS, { each: true })
  status?: ORDER_STATUS[];

  @ApiPropertyOptional({
    description: 'Filter order by user id',
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  userId?: number;

  @ApiPropertyOptional({
    description: 'Filter order by team id',
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  teamId?: string;

  @ApiPropertyOptional({
    description: 'Filter order by domain id',
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  domainId?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  serviceId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Filter order by order code',
  })
  orderCode?: string;

  @ApiPropertyOptional({
    description: 'Filter order by service type',
    enum: SERVICE_TYPE,
    type: [SERVICE_TYPE],
    enumName: 'SERVICE_TYPE',
  })
  @IsOptional()
  @IsEnum(SERVICE_TYPE, { each: true })
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  serviceType?: SERVICE_TYPE[];

  @ApiPropertyOptional({
    description: 'Time begin update order',
    example: '2024/04/01 00:00:00',
  })
  @IsOptional()
  @IsString()
  timeBegin?: string;

  @ApiPropertyOptional({
    description: 'Time end update order',
    example: '2027/04/01 23:59:59',
  })
  @IsOptional()
  @IsString()
  timeEnd?: string;
}

export class GetMyOrdersDto extends OmitType(GetOrdersDto, [
  'userId',
] as const) {}
