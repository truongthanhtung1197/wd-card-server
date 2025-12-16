import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/shared/dto/paginationQueryDto.dto';

export class GetNotificationsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by type', type: String })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: 'Search by message content',
    type: String,
  })
  @IsOptional()
  @IsString()
  search?: string;
}
