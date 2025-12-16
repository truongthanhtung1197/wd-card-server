import { Expose } from 'class-transformer';
import { User } from 'src/user/entities/user.entity';
import { BaseEntity } from 'src/shared/baseEntity.entity';
import { ROLE } from 'src/role/role.constant';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('user_roles')
export class UserRole extends BaseEntity {
  @Expose()
  @Column({ name: 'user_id' })
  userId: number;

  @Expose()
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Expose()
  @Column({
    type: 'enum',
    enum: ROLE,
  })
  role: ROLE;
}


