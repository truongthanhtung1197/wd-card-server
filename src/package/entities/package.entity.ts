import { Expose } from 'class-transformer';
import { PackageFeature } from 'src/package-feature/entities/package-feature.entity';
import { BaseEntity } from 'src/shared/baseEntity.entity';
import { Column, Entity, OneToMany } from 'typeorm';

export enum PACKAGE_STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('packages')
export class Package extends BaseEntity {
  @Expose()
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Expose()
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  price: number;

  @Expose()
  @Column({ name: 'duration_days', type: 'int' })
  durationDays: number;

  @Expose()
  @Column({
    type: 'enum',
    enum: PACKAGE_STATUS,
    default: PACKAGE_STATUS.ACTIVE,
  })
  status: PACKAGE_STATUS;

  @OneToMany(() => PackageFeature, (feature) => feature.package)
  features: PackageFeature[];
}
