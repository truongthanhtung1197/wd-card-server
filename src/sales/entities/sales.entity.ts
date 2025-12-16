import { Expose } from 'class-transformer';
import { BaseEntity } from 'src/shared/baseEntity.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

export enum SALES_STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('sales')
export class Sales extends BaseEntity {
  @Expose()
  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Expose()
  @Column({
    name: 'commission_percent',
    type: 'decimal',
    precision: 5,
    scale: 2,
  })
  commissionPercent: number;

  @Expose()
  @Column({ type: 'enum', enum: SALES_STATUS, default: SALES_STATUS.ACTIVE })
  status: SALES_STATUS;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
