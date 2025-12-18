import { Expose } from 'class-transformer';
import { Package } from 'src/package/entities/package.entity';
import { BaseEntity } from 'src/shared/baseEntity.entity';
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

  @Expose()
  @Column({ name: 'feature_description', type: 'varchar', length: 255 })
  featureDescription: string;

  @ManyToOne(() => Package, (pkg) => pkg.features)
  @JoinColumn({ name: 'package_id' })
  package: Package;
}
