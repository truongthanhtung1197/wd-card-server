import { Exclude, Expose } from 'class-transformer';
import { BaseEntity } from 'src/shared/baseEntity.entity';
import { USER_STATUS } from 'src/shared/constants/user.constant';
import { UserRole } from 'src/user-role/entities/user-role.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('users')
export class User extends BaseEntity {
  @Expose()
  @Column({ unique: true })
  email: string;

  @Expose()
  @Exclude()
  @Column({ name: 'password_hash', nullable: true })
  passwordHash: string;

  @Expose()
  @Column({
    type: 'enum',
    enum: USER_STATUS,
    default: USER_STATUS.ACTIVE,
  })
  status: USER_STATUS;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];
}
