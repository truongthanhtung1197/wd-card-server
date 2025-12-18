import { Expose } from 'class-transformer';
import { Sales } from 'src/sales/entities/sales.entity';
import { BaseEntity } from 'src/shared/baseEntity.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

export enum ORDER_STATUS {
  OPEN = 'OPEN',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

@Entity('orders')
export class Order extends BaseEntity {
  @Expose()
  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Expose()
  @Column({ name: 'package_id', type: 'bigint' })
  packageId: number;

  @Expose()
  @Column({ name: 'sale_id', type: 'bigint', nullable: true, default: null })
  saleId: number | null;

  @Expose()
  @Column({
    name: 'commission_percent_snapshot',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  commissionPercentSnapshot: number | null;

  @Expose()
  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalAmount: number;

  @Expose()
  @Column({ name: 'start_at', type: 'date' })
  startAt: string;

  @Expose()
  @Column({ name: 'end_at', type: 'date' })
  endAt: string;

  @Expose()
  @Column({
    type: 'enum',
    enum: ORDER_STATUS,
    default: ORDER_STATUS.OPEN,
  })
  status: ORDER_STATUS;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Sales, { nullable: true })
  @JoinColumn({ name: 'sale_id' })
  sale: Sales | null;
}
