import { Expose } from 'class-transformer';
import { BaseEntity } from 'src/shared/baseEntity.entity';
import { Column, Entity } from 'typeorm';
import { ROLE } from '../role.constant';

@Entity('roles')
export class Role extends BaseEntity {
  @Expose()
  @Column({ name: 'role_name', unique: true, type: 'enum', enum: ROLE })
  roleName: ROLE;
}
