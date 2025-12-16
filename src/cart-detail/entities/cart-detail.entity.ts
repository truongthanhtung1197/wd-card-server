import { Cart } from 'src/cart/entities/cart.entity';
import { Service } from 'src/service/entities/service.entity';
import { BaseEntity } from 'src/shared/baseEntity.entity';
import { SERVICE_TYPE } from 'src/shared/constants/service.constant';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
@Entity('cart_details')
export class CartDetail extends BaseEntity {
  @Column({ name: 'cart_id' })
  cartId: number;

  @Column({ name: 'service_id' })
  serviceId: number;

  @Column({ name: 'service_type', type: 'enum', enum: SERVICE_TYPE })
  serviceType: SERVICE_TYPE;

  @Column({ name: 'quantity', nullable: false, default: 1 })
  quantity: number;

  @OneToOne(() => Service, (service) => service.id)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @ManyToOne(() => Cart, (cart) => cart.id)
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;
}
