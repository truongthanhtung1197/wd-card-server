import { Expose } from 'class-transformer';
import { BaseEntity } from 'src/shared/baseEntity.entity';
import { Sales } from 'src/sales/entities/sales.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('customers')
export class Customer extends BaseEntity {
  @Expose()
  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Expose()
  @Column({ name: 'sale_id', type: 'bigint', nullable: true, default: null })
  saleId: number | null;

  @Expose()
  @Column({ name: 'full_name', type: 'varchar', length: 255 })
  fullName: string;

  @Expose()
  @Column({ name: 'phone', type: 'varchar', length: 50 })
  phone: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Sales, { nullable: true })
  @JoinColumn({ name: 'sale_id' })
  sale: Sales | null;
}


