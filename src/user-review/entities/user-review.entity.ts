import { Expose } from 'class-transformer';
import { BaseEntity } from 'src/shared/baseEntity.entity';
import { User } from 'src/user/entities/user.entity';
import { Order } from 'src/order/entities/order.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('user_reviews')
export class UserReview extends BaseEntity {
  @Expose()
  @Column({ name: 'reviewer_id', type: 'bigint', nullable: false })
  reviewerId: number;

  @Expose()
  @Column({ name: 'user_id', type: 'bigint', nullable: false })
  userId: number;

  @Expose()
  @Column({ name: 'order_id', type: 'bigint', nullable: true })
  orderId?: number | null;

  @Expose()
  @Column({ type: 'smallint', nullable: false })
  rating: number;

  @Expose()
  @Column({ type: 'text', nullable: true })
  comment: string;

  @Expose()
  @Column({ name: 'is_public', type: 'boolean', default: true })
  isPublic: boolean;

  @Expose()
  @ManyToOne(() => User, (user) => user.reviewsReceived)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Expose()
  @ManyToOne(() => User, (user) => user.reviewsGiven)
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: User;

  @Expose()
  @ManyToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'order_id' })
  order?: Order | null;
}
