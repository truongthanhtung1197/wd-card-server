import { Expose } from 'class-transformer';
import { BaseEntity } from 'src/shared/baseEntity.entity';
import { Wedding } from 'src/wedding/entities/wedding.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

export enum MEDIA_TYPE {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOCUMENT = 'DOCUMENT',
}

@Entity('media')
export class Media extends BaseEntity {
  @Expose()
  @Column({ name: 'wedding_id', type: 'bigint' })
  weddingId: number;

  @Expose()
  @Column({ name: 'owner_type', type: 'varchar', length: 100 })
  ownerType: string;

  @Expose()
  @Column({ name: 'owner_id', type: 'bigint' })
  ownerId: number;

  @Expose()
  @Column({
    name: 'media_type',
    type: 'enum',
    enum: MEDIA_TYPE,
    default: MEDIA_TYPE.IMAGE,
  })
  mediaType: MEDIA_TYPE;

  @Expose()
  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Expose()
  @Column({ name: 'thumb_url', type: 'varchar', length: 500, nullable: true })
  thumbUrl: string | null;

  @Expose()
  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any> | null;

  @ManyToOne(() => Wedding)
  @JoinColumn({ name: 'wedding_id' })
  wedding: Wedding;
}

