import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/shared/dto/paginationQueryDto.dto';
import { BaseQueryDto } from 'src/shared/dto/paginationQueryDto.dto';
import { ROLE } from 'src/role/role.constant';
import { Transform } from 'class-transformer';

export class QueryUserDto extends IntersectionType(
  PaginationQueryDto,
  BaseQueryDto,
) {
  @ApiPropertyOptional({
    description: 'Filter user by role',
    enum: ROLE,
    type: [ROLE],
    enumName: 'ROLE',
  })
  @IsOptional()
  @IsEnum(ROLE, { each: true })
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  role?: ROLE[];
}
