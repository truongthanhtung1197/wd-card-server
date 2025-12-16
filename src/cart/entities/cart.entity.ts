import { Expose } from 'class-transformer';
import { BaseEntity } from 'src/shared/baseEntity.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('carts')
export class Cart extends BaseEntity {
  @Expose()
  @Column({ name: 'user_id' })
  userId: number;

  @Expose()
  @ManyToOne(() => User, (user) => user.carts)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
