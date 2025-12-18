import { Expose } from 'class-transformer';
import {
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class BaseEntity {
  @Expose()
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Expose()
  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Expose()
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;

  @Expose()
  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
  })
  deletedAt: Date;

  @Expose()
  @Column({ name: 'created_by', type: 'bigint', nullable: false })
  createdBy: number;

  @Expose()
  @Column({ name: 'updated_by', type: 'bigint', nullable: false })
  updatedBy: number;

  @Expose()
  @Column({ name: 'deleted_by', type: 'bigint', nullable: true })
  deletedBy: number;
}
