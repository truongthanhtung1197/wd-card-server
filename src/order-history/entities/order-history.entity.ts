import { Expose } from 'class-transformer';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Order } from 'src/order/entities/order.entity';
import { BaseEntity } from 'src/shared/baseEntity.entity';
import { ORDER_HISTORY_TYPE } from 'src/shared/constants/order.constant';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('order_histories')
export class OrderHistory extends BaseEntity {
  @Expose()
  @Column({ name: 'order_id', type: 'bigint' })
  orderId: number;

  @Expose()
  @Column({
    type: 'enum',
    enum: ORDER_HISTORY_TYPE,
    name: 'type',
  })
  @IsEnum(ORDER_HISTORY_TYPE)
  @IsNotEmpty()
  type: ORDER_HISTORY_TYPE;

  @Expose()
  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Expose()
  @Column({ name: 'metadata', type: 'json', nullable: true })
  metadata: any;

  @Expose()
  @ManyToOne(() => Order, (order) => order.id)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Expose()
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
