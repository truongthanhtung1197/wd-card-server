import { BaseEntity } from 'src/shared/baseEntity.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { Expose } from 'class-transformer';
import { DomainOrder } from 'src/domain-order/entities/domain-order.entity';
import {
  DOMAIN_STATUS,
  DOMAIN_TYPE,
} from 'src/shared/constants/domain.constant';
import { Team } from 'src/team/entities/team.entity';
import { UserDomain } from 'src/user-domain/entities/user-domain.entity';
import { User } from 'src/user/entities/user.entity';
@Entity('domains')
export class Domain extends BaseEntity {
  @Expose()
  @Column({ nullable: false })
  name: string;

  @Expose()
  @Column({
    type: 'enum',
    enum: DOMAIN_STATUS,
    default: DOMAIN_STATUS.SEOING,
  })
  status: DOMAIN_STATUS;

  @Column({ name: 'domain_order_id', nullable: true, default: null })
  domainOrderId: number | null;

  @Expose()
  @Column({
    type: 'enum',
    enum: DOMAIN_TYPE,
    nullable: false,
  })
  type: DOMAIN_TYPE;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number; // giá của domain khi mua

  @Column({ type: 'decimal', precision: 13, scale: 2, default: 0 })
  budget: number; // ngân sách

  @Expose()
  @Column({
    name: 'spent_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  spentAmount: number; // số tiền đã chi cho seo

  @Expose()
  @Column({ name: 'team_id', nullable: true, default: null })
  teamId: number | null;

  @Expose()
  @ManyToOne(() => Team, (team) => team.domains)
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @Expose()
  @Column({ name: 'user_id', nullable: true, default: null })
  userId: number | null;

  @Expose()
  @ManyToOne(() => User, (user) => user.domains)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Expose()
  @OneToMany(() => UserDomain, (userDomain) => userDomain.domain)
  userDomains: UserDomain[];

  @Expose()
  @ManyToOne(() => DomainOrder, (domainOrder) => domainOrder.domains)
  @JoinColumn({ name: 'domain_order_id' })
  domainOrder: DomainOrder;
}
