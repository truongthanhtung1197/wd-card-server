import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { DOMAIN_STATUS } from 'src/shared/constants/domain.constant';
import {
  BaseQueryDto,
  PaginationQueryDto,
} from 'src/shared/dto/paginationQueryDto.dto';
export class GetDomainsDto extends IntersectionType(
  PaginationQueryDto,
  BaseQueryDto,
) {
  @ApiPropertyOptional({
    description: 'Filter domain by status',
    enum: DOMAIN_STATUS,
    type: [DOMAIN_STATUS],
    enumName: 'DOMAIN_STATUS',
  })
  @IsOptional()
  @IsEnum(DOMAIN_STATUS, { each: true })
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  status?: DOMAIN_STATUS[];

  @ApiPropertyOptional({
    description: 'Filter domain by user id',
    type: String,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  userId?: number; // owner

  @ApiPropertyOptional({
    description: 'Filter domain by assigned to user id',
    type: String,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  assignedUserId?: number; // assigned to user

  @ApiPropertyOptional({
    description: 'Filter domain by team id',
    type: String,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  teamId?: number;
}
