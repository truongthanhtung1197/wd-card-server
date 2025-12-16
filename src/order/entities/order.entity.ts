import { Expose, Type } from 'class-transformer';
// import { IsEnum, IsNotEmpty } from 'class-validator';
import { nanoid } from 'nanoid';
import { Domain } from 'src/domain/entities/domain.entity';
import { FileRelation } from 'src/file-relation/entities/file-relation.entity';
import { File } from 'src/file/entities/file.entity';
import { OrderDetail } from 'src/order-detail/entities/order-detail.entity';
import { Service } from 'src/service/entities/service.entity';
// import { Service } from 'src/service/entities/service.entity';
import { BaseEntity } from 'src/shared/baseEntity.entity';
import { ORDER_STATUS } from 'src/shared/constants/order.constant';
import { Team } from 'src/team/entities/team.entity';
// import { SERVICE_TYPE } from 'src/shared/constants/service.constant';
import { User } from 'src/user/entities/user.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
@Entity('orders')
export class Order extends BaseEntity {
  @Expose()
  @Column({ name: 'user_id' })
  userId: number;

  // @Expose()
  // @Column({ name: 'service_id' }) // remove
  // serviceId: number;

  @Expose()
  @Column({ name: 'team_id', nullable: true })
  teamId: number;

  // @Expose() // remove
  // @Column({
  //   type: 'enum',
  //   enum: SERVICE_TYPE,
  //   name: 'service_type',
  // })
  // @IsEnum(SERVICE_TYPE)
  // @IsNotEmpty()
  // serviceType: SERVICE_TYPE;

  @Expose()
  @Column({
    type: 'enum',
    enum: ORDER_STATUS,
    default: ORDER_STATUS.SEOER_ORDER,
  })
  status: ORDER_STATUS;

  @Expose()
  @Column({ name: 'domain_id', nullable: false })
  domainId: number;

  @Expose()
  @Column({ name: 'order_code', nullable: false, unique: true })
  orderCode?: string;

  // @Expose()
  // @Column({ name: 'quantity', nullable: false, default: 1 }) // remove
  // quantity: number;

  // @Expose()
  // @Column({ name: 'anchor_text_1', type: 'varchar', nullable: true }) // remove
  // anchorText1: string;

  // @Expose()
  // @Column({ name: 'anchor_text_2', type: 'varchar', nullable: true }) // remove
  // anchorText2: string;

  // @Expose()
  // @Column({ name: 'url_1', type: 'varchar', nullable: true }) // remove
  // url1: string;

  // @Expose()
  // @Column({ name: 'url_2', type: 'varchar', nullable: true }) // remove
  // url2: string;

  // @Expose()
  // @Column({ name: 'link_drive', type: 'varchar', nullable: true }) // remove
  // linkDrive: string;

  @Expose()
  @Column({ name: 'order_at', type: 'datetime', nullable: true })
  orderAt: Date;

  // @Expose()
  // @Column({ name: 'expired_at', type: 'datetime', nullable: true }) // remove
  // expiredAt: Date;

  // @Expose()
  // @Column({ name: 'new_or_renew', type: 'varchar', nullable: true }) // remove
  // newOrRenew: string;

  // @Expose()
  // @Column({ name: 'warranty_period', type: 'varchar', nullable: true }) // remove
  // warrantyPeriod: string;

  @Expose()
  @Column({
    name: 'discount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  @Type(() => Number)
  discount: number;

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
  @Column({ name: 'bill_payment_link', type: 'varchar', nullable: true })
  billPaymentLink: string;

  // @Column({
  //   name: 'special_order_discount', // remove this column
  //   type: 'decimal',
  //   precision: 10,
  //   scale: 2,
  //   default: 0,
  //   nullable: true,
  // })
  // @Type(() => Number)
  // specialOrderDiscount: number;

  @Column({
    name: 'price_adjustment',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  @Type(() => Number)
  priceAdjustment: number;

  @Expose()
  @Column({
    name: 'update_status_at',
    type: 'timestamp',
    nullable: true,
  })
  updateStatusAt: Date;

  @OneToOne(() => Service, (service) => service.id) // remove
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Expose()
  @OneToOne(() => Domain, (domain) => domain.id)
  @JoinColumn({ name: 'domain_id' })
  domain: Domain;

  @Expose()
  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Expose()
  @OneToMany(() => FileRelation, (relation) => relation.order)
  fileRelations: FileRelation[];

  get files(): File[] {
    return this.fileRelations?.map((r) => r.file) || [];
  }

  @Expose()
  @BeforeInsert()
  generateOrderCode() {
    const id = nanoid(10).toUpperCase();
    this.orderCode = `ODR-${id}`;
  }

  @Expose()
  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.order)
  orderDetails: OrderDetail[];

  @Expose()
  @ManyToOne(() => Team, (team) => team.orders)
  @JoinColumn({ name: 'team_id' })
  team: Team;
}
