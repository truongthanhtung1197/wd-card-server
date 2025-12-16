import { Expose } from 'class-transformer';
import { BaseEntity } from 'src/shared/baseEntity.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { ROLE } from '../role.constant';
@Entity('roles')
export class Role extends BaseEntity {
  @Expose()
  @Column({ name: 'role_name', unique: true, type: 'enum', enum: ROLE })
  roleName: ROLE;

  @Expose()
  @OneToMany(() => User, (user) => user.roleId)
  users: User[];
}
