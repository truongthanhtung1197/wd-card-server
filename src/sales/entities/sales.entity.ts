import { Expose } from 'class-transformer';
import { BaseEntity } from 'src/shared/baseEntity.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

export enum SALES_STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
}

@Entity('sales')
export class Sales extends BaseEntity {
  @Expose()
  @Column({ name: 'user_id', type: 'bigint', nullable: true, default: null })
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
  @Column({ name: 'bank_name', type: 'varchar', length: 255, nullable: true })
  bankName: string;

  @Expose()
  @Column({ name: 'bank_number', type: 'varchar', length: 255, nullable: true })
  bankNumber: string;

  @Expose()
  @Column({ name: 'full_name', type: 'varchar', length: 255 })
  fullName: string;

  @Expose()
  @Column({ type: 'enum', enum: SALES_STATUS, default: SALES_STATUS.ACTIVE })
  status: SALES_STATUS;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Expose()
  @Column({ name: 'phone', type: 'varchar', length: 50, nullable: true })
  phone: string;
}
