import { Expose } from 'class-transformer';
import { Role } from 'src/role/entities/role.entity';
import { BaseEntity } from 'src/shared/baseEntity.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('user_roles')
export class UserRole extends BaseEntity {
  @Expose()
  @Column({ name: 'user_id' })
  userId: number;

  @Expose()
  @Column({ name: 'role_id' })
  roleId: number;

  @Expose()
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
