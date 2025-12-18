import { Expose } from 'class-transformer';
import { BaseEntity } from 'src/shared/baseEntity.entity';
import { Wedding } from 'src/wedding/entities/wedding.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('wedding_friends')
export class WeddingFriend extends BaseEntity {
  @Expose()
  @Column({ name: 'wedding_id', type: 'bigint' })
  weddingId: number;

  @Expose()
  @Column({ name: 'friend_name', type: 'varchar', length: 255 })
  friendName: string;

  @Expose()
  @Column({ type: 'varchar', length: 100 })
  relation: string;

  @Expose()
  @Column({ name: 'personal_message', type: 'text', nullable: true })
  personalMessage: string | null;

  @ManyToOne(() => Wedding)
  @JoinColumn({ name: 'wedding_id' })
  wedding: Wedding;
}

