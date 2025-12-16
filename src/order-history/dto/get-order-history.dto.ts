import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumberString, IsOptional } from 'class-validator';
import { ORDER_HISTORY_TYPE } from 'src/shared/constants/order.constant';
import { PaginationQueryDto } from 'src/shared/dto/paginationQueryDto.dto';

export class GetOrderHistoriesDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsNumberString()
  @IsOptional()
  orderId?: number;

  @ApiPropertyOptional({
    enum: ORDER_HISTORY_TYPE,
    example: ORDER_HISTORY_TYPE.CHANGE_STATUS,
  })
  @IsEnum(ORDER_HISTORY_TYPE)
  @IsOptional()
  type?: ORDER_HISTORY_TYPE;
}
