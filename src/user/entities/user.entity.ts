import { Exclude, Expose, Type } from 'class-transformer';
import { Cart } from 'src/cart/entities/cart.entity';
import { Domain } from 'src/domain/entities/domain.entity';
import { FileRelation } from 'src/file-relation/entities/file-relation.entity';
import { Order } from 'src/order/entities/order.entity';
import { Role } from 'src/role/entities/role.entity';
import { Service } from 'src/service/entities/service.entity';
import { BaseEntity } from 'src/shared/baseEntity.entity';
import { BANK_NAME } from 'src/shared/constants/common.constants';
import { UserDomain } from 'src/user-domain/entities/user-domain.entity';
import { UserReview } from 'src/user-review/entities/user-review.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity('users')
export class User extends BaseEntity {
  @Expose()
  @Column({ unique: true })
  username: string;

  @Expose()
  @Column({ nullable: true, default: null, name: 'display_name' })
  displayName: string;

  @Expose()
  @Column({
    nullable: true,
    default: null,
    name: 'locked_at',
    type: 'timestamp',
  })
  lockedAt: Date | null;

  @Expose()
  @Column({
    nullable: true,
    default: null,
    name: 'locked_by',
    type: 'bigint',
  })
  lockedBy: number;

  @Expose()
  @Column({ nullable: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Expose()
  @Column({ nullable: false, name: 'role_id' })
  roleId: number;

  @Expose()
  @Column({ nullable: true, default: null, name: 'telegram_username' })
  telegramUsername: string;

  @Expose()
  @Column({ nullable: true, default: null, name: 'phone' })
  phone: string;

  @Expose()
  @Column({ nullable: true, default: null, name: 'bank_name_in_card' })
  bankNameInCard: string;

  @Expose()
  @Column({ nullable: true, default: null, name: 'bank_number' })
  bankNumber: string;

  @Expose()
  @Column({
    nullable: true,
    default: null,
    name: 'bank_name',
    type: 'enum',
    enum: BANK_NAME,
  })
  bankName: BANK_NAME;

  @Column({ nullable: true, default: null, name: 'usdt' })
  usdt: string;

  @Expose()
  @Column({
    name: 'avg_rating',
    type: 'decimal',
    precision: 3,
    scale: 2,
    nullable: true,
    default: null,
  })
  @Type(() => Number)
  avgRating: number;

  @Expose()
  @OneToMany(() => Service, (service) => service.user)
  services: Service[];

  @Expose()
  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @Expose()
  @OneToMany(() => Cart, (cart) => cart.user)
  carts: Cart[];

  @Expose()
  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role?: Role;

  @Expose()
  @OneToMany(() => FileRelation, (relation) => relation.user)
  fileRelations: FileRelation[];

  @Expose()
  @OneToMany(() => Domain, (domain) => domain.user)
  domains: Domain[];

  @Expose()
  @OneToMany(() => UserDomain, (userDomain) => userDomain.user)
  userDomains: UserDomain[];

  @Expose()
  @OneToMany(() => UserReview, (review) => review.user)
  reviewsReceived: UserReview[];

  @Expose()
  @OneToMany(() => UserReview, (review) => review.reviewer)
  reviewsGiven: UserReview[];
}
