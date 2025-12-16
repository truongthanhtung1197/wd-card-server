import { Expose } from 'class-transformer';
import { Domain } from 'src/domain/entities/domain.entity';
import { BaseEntity } from 'src/shared/baseEntity.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('user_domains')
export class UserDomain extends BaseEntity {
  @Expose()
  @Column({ nullable: false, type: 'bigint', name: 'domain_id' })
  domainId: number;

  @Expose()
  @Column({ nullable: false, type: 'bigint', name: 'user_id' })
  userId: number;

  @Expose()
  @ManyToOne(() => User, (user) => user.userDomains)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Expose()
  @ManyToOne(() => Domain, (domain) => domain.userDomains)
  @JoinColumn({ name: 'domain_id' })
  domain: Domain;
}
