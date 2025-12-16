import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ORDER_HISTORY_TYPE } from 'src/shared/constants/order.constant';

export class CreateOrderHistoryDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  orderId: number;

  @ApiProperty({
    example: ORDER_HISTORY_TYPE.CHANGE_STATUS,
    enum: ORDER_HISTORY_TYPE,
    description: 'Order history type',
  })
  @IsEnum(ORDER_HISTORY_TYPE)
  @IsNotEmpty()
  type: ORDER_HISTORY_TYPE;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiPropertyOptional({
    example: { previousStatus: 'PENDING', newStatus: 'CONFIRMED' },
    description: 'Additional metadata for the history record',
  })
  @IsOptional()
  metadata?: any;
}
