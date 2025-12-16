import { Exclude, Expose } from 'class-transformer';
import { BaseEntity } from 'src/shared/baseEntity.entity';
import { USER_STATUS } from 'src/shared/constants/user.constant';
import { Column, Entity } from 'typeorm';

@Entity('users')
export class User extends BaseEntity {
  @Expose()
  @Column({ unique: true })
  email: string;

  @Expose()
  @Column({ name: 'name' })
  name: string;

  @Expose()
  @Column({ name: 'bank_name' })
  bankName: string;

  @Expose()
  @Column({ name: 'bank_number' })
  bankNumber: string;

  @Expose()
  @Exclude()
  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Expose()
  @Column({
    type: 'enum',
    enum: USER_STATUS,
    default: USER_STATUS.ACTIVE,
  })
  status: USER_STATUS;
}
