import { Expose } from 'class-transformer';
import { Customer } from 'src/customer/entities/customer.entity';
import { Order } from 'src/order/entities/order.entity';
import { BaseEntity } from 'src/shared/baseEntity.entity';
import { Template } from 'src/template/entities/template.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

// export enum WEDDING_STATUS {
//   DRAFT = 'DRAFT',
//   ACTIVE = 'ACTIVE',
//   COMPLETED = 'COMPLETED',
//   CANCELLED = 'CANCELLED',
// }

@Entity('weddings')
export class Wedding extends BaseEntity {
  @Expose()
  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Expose()
  @Column({ name: 'customer_id', type: 'bigint' })
  customerId: number;

  @Expose()
  @Column({ name: 'template_id', type: 'bigint' })
  templateId: number;

  @Expose()
  @Column({ name: 'order_id', type: 'bigint' })
  orderId: number;

  @Expose()
  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  // @Expose()
  // @Column({
  //   type: 'enum',
  //   enum: WEDDING_STATUS,
  //   default: WEDDING_STATUS.DRAFT,
  // })
  // status: WEDDING_STATUS;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => Template)
  @JoinColumn({ name: 'template_id' })
  template: Template;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
