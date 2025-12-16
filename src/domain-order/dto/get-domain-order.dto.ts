import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DOMAIN_ORDER_STATUS } from 'src/shared/constants/domain-order.constant';
import {
  BaseQueryDto,
  PaginationQueryDto,
} from 'src/shared/dto/paginationQueryDto.dto';

export class GetDomainOrdersDto extends IntersectionType(
  PaginationQueryDto,
  BaseQueryDto,
) {
  @ApiPropertyOptional({
    description: 'Filter order by status',
    enum: DOMAIN_ORDER_STATUS,
    type: [DOMAIN_ORDER_STATUS],
    enumName: 'DOMAIN_ORDER_STATUS',
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  @IsEnum(DOMAIN_ORDER_STATUS, { each: true })
  status?: DOMAIN_ORDER_STATUS[];

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Filter order by order code',
  })
  orderCode?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Filter order by propose code',
  })
  proposeCode?: string;

  @ApiPropertyOptional({
    description: 'Filter order by time begin order at',
    example: '2024/04/01 00:00:00',
  })
  @IsOptional()
  @IsString()
  timeBegin?: string;

  @ApiPropertyOptional({
    description: 'Filter order by time end order at',
    example: '2027/04/01 23:59:59',
  })
  @IsOptional()
  @IsString()
  timeEnd?: string;
}
