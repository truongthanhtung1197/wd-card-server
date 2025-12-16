import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import {
  BaseQueryDto,
  PaginationQueryDto,
} from 'src/shared/dto/paginationQueryDto.dto';

export class GetUserDomainsDto extends IntersectionType(
  PaginationQueryDto,
  BaseQueryDto,
) {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    description: 'Tên domain',
    example: 'example.com',
  })
  domainName?: string;

  @ApiPropertyOptional({
    description: 'Filter domain by assigned to user id',
    type: String,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  assignedUserId?: number; // assigned to user

  @ApiPropertyOptional({
    description: 'Filter user domain by team id',
    type: String,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  teamId?: number;
}
