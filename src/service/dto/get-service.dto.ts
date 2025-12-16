import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import {
  SERVICE_FIELD_TYPE,
  SERVICE_STATUS,
  SERVICE_TYPE,
  TYPE_PACK,
} from 'src/shared/constants/service.constant';
import {
  BaseQueryDto,
  PaginationQueryDto,
} from 'src/shared/dto/paginationQueryDto.dto';

export class GetServiceDto extends IntersectionType(
  PaginationQueryDto,
  BaseQueryDto,
) {
  @ApiPropertyOptional({
    description: 'Filter service by status',
    enum: SERVICE_STATUS,
    type: [SERVICE_STATUS],
    enumName: 'SERVICE_STATUS',
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  @IsEnum(SERVICE_STATUS, { each: true })
  status?: SERVICE_STATUS[];

  @ApiPropertyOptional({
    description: 'Filter service by type pack',
    enum: TYPE_PACK,
    type: [TYPE_PACK],
    enumName: 'TYPE_PACK',
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  @IsEnum(TYPE_PACK, { each: true })
  typePack?: TYPE_PACK[];

  @ApiPropertyOptional({
    description: 'Filter service by field type',
    enum: SERVICE_FIELD_TYPE,
    type: [SERVICE_FIELD_TYPE],
    enumName: 'SERVICE_FIELD_TYPE',
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  @IsEnum(SERVICE_FIELD_TYPE, { each: true })
  fieldType?: SERVICE_FIELD_TYPE[];

  @ApiPropertyOptional({
    description: 'Filter service by type',
    enum: SERVICE_TYPE,
    type: [SERVICE_TYPE],
    enumName: 'SERVICE_TYPE',
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  @IsEnum(SERVICE_TYPE, { each: true })
  type?: SERVICE_TYPE[];

  @ApiPropertyOptional({
    description: 'Filter service by is index',
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isIndex?: boolean;

  @ApiPropertyOptional({
    description: 'Filter service by is sale guest post',
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isSaleGuestPost?: boolean;

  @ApiPropertyOptional({
    description: 'Filter service by is show',
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isShow?: boolean;

  @ApiPropertyOptional({
    description: 'Filter service by is sale text link',
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isSaleTextLink?: boolean;

  @ApiPropertyOptional({
    description: 'Filter service by is sale banner',
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isSaleBanner?: boolean;

  @ApiPropertyOptional({
    description: 'Filter service by partner id',
    type: String,
  })
  @IsOptional()
  @IsString()
  partnerId?: string;
}
