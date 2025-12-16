import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Order } from 'src/order/entities/order.entity';
import { Service } from 'src/service/entities/service.entity';
import { BaseEntity } from 'src/shared/baseEntity.entity';
import { SERVICE_TYPE } from 'src/shared/constants/service.constant';
import { JsonTransformer } from 'src/shared/utils';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
@Entity('order_details')
export class OrderDetail extends BaseEntity {
  @Column({ name: 'order_id', nullable: false })
  orderId: number;

  @Column({ name: 'service_id' })
  serviceId: number;

  @Column({ name: 'quantity', nullable: false, default: 1 })
  quantity: number;

  @Column({
    type: 'enum',
    enum: SERVICE_TYPE,
    name: 'service_type',
  })
  @IsEnum(SERVICE_TYPE)
  @IsNotEmpty()
  serviceType: SERVICE_TYPE;

  @Column({ name: 'anchor_text_1', type: 'varchar', nullable: true })
  anchorText1: string;

  @Column({ name: 'anchor_text_2', type: 'varchar', nullable: true })
  anchorText2: string;

  @Column({ name: 'url_1', type: 'varchar', nullable: true })
  url1: string;

  @Column({ name: 'url_2', type: 'varchar', nullable: true })
  url2: string;

  @Column({ name: 'link_drive', type: 'varchar', nullable: true })
  linkDrive: string;

  @Column({ name: 'expired_at', type: 'datetime', nullable: true })
  expiredAt: Date;

  @Column({ name: 'new_or_renew', type: 'varchar', nullable: true })
  newOrRenew: string;

  @Column({ name: 'warranty_period', type: 'varchar', nullable: true })
  warrantyPeriod: string;

  @Column({
    name: 'discount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  @Type(() => Number)
  discount: number;

  @Column({
    name: 'price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  @Type(() => Number)
  price: number;

  @Column({
    name: 'service_metadata',
    type: 'json',
    nullable: true,
    transformer: JsonTransformer,
  })
  serviceMetadata: any;

  @OneToOne(() => Service, (service) => service.id)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @ManyToOne(() => Order, (order) => order.id)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
