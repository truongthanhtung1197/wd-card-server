import { Expose } from 'class-transformer';
import { Domain } from 'src/domain/entities/domain.entity';
import { Order } from 'src/order/entities/order.entity';
import { BaseEntity } from 'src/shared/baseEntity.entity';
import { TeamMember } from 'src/team-member/entities/team-member.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity('teams')
export class Team extends BaseEntity {
  @Expose()
  @Column({ nullable: false, type: 'varchar' })
  name: string;

  @Expose()
  @Column({ nullable: true, default: null, type: 'varchar' })
  key?: string;

  @Expose()
  @Column({ nullable: true, default: null, type: 'varchar' })
  description: string;

  @Expose()
  @Column({
    nullable: true,
    default: null,
    type: 'varchar',
    name: 'telegram_id',
  })
  telegramId: string;

  @Expose()
  @Column({ nullable: false, type: 'bigint', name: 'owner_id' })
  ownerId: number;

  @Expose()
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Expose()
  @OneToMany(() => TeamMember, (teamMember) => teamMember.team)
  teamMembers: TeamMember[];

  @Expose()
  @OneToMany(() => Domain, (domain) => domain.team)
  domains: Domain[];

  @OneToMany(() => Order, (order) => order.team)
  orders: Order[];
}
