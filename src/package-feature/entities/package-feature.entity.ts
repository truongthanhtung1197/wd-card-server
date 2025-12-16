import { Expose } from 'class-transformer';
import { BaseEntity } from 'src/shared/baseEntity.entity';
import { Package } from 'src/package/entities/package.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('package_features')
export class PackageFeature extends BaseEntity {
  @Expose()
  @Column({ name: 'package_id', type: 'bigint' })
  packageId: number;

  @Expose()
  @Column({ name: 'feature_key', type: 'varchar', length: 255 })
  featureKey: string;

  @Expose()
  @Column({ name: 'feature_value', type: 'varchar', length: 255 })
  featureValue: string;

  @ManyToOne(() => Package, (pkg) => pkg.features)
  @JoinColumn({ name: 'package_id' })
  package: Package;
}


