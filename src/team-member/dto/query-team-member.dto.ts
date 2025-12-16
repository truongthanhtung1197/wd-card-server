import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';
import {
  BaseQueryDto,
  PaginationQueryDto,
} from 'src/shared/dto/paginationQueryDto.dto';

export class QueryTeamMemberDto extends IntersectionType(
  PaginationQueryDto,
  BaseQueryDto,
) {
  @ApiProperty({ example: 'Team ID' })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  teamId: number;
}
