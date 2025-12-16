import { Expose, Type } from 'class-transformer';
import { nanoid } from 'nanoid';
import { Domain } from 'src/domain/entities/domain.entity';
import { BaseEntity } from 'src/shared/baseEntity.entity';
import { DOMAIN_ORDER_STATUS } from 'src/shared/constants/domain-order.constant';
import { User } from 'src/user/entities/user.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity('domains_orders')
export class DomainOrder extends BaseEntity {
  @Expose()
  @Column({ name: 'order_by_id' })
  orderByUserId: number;

  @Expose()
  @Column({
    type: 'enum',
    enum: DOMAIN_ORDER_STATUS,
    default: DOMAIN_ORDER_STATUS.REQUESTED,
  })
  status: DOMAIN_ORDER_STATUS;

  @Expose()
  @Column({ name: 'order_code', nullable: false, unique: true })
  orderCode?: string;

  @Expose()
  @Column({ name: 'propose_code', nullable: true })
  proposeCode?: string;

  @Expose()
  @Column({ name: 'description', nullable: true })
  description?: string;

  @Expose()
  @Column({
    name: 'price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  @Type(() => Number)
  price: number;

  @Expose()
  domainsCount?: number;

  @Expose()
  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'order_by_id' })
  user: User;

  @Expose()
  @BeforeInsert()
  generateOrderCode() {
    const id = nanoid(10).toUpperCase();
    this.orderCode = `ODR-${id}`;
  }

  @Expose()
  @OneToMany(() => Domain, (domain) => domain.domainOrder)
  domains: Domain[];
}
