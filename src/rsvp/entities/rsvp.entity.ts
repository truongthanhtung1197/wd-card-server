import { Expose } from 'class-transformer';
import { BaseEntity } from 'src/shared/baseEntity.entity';
import { Wedding } from 'src/wedding/entities/wedding.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

export enum RSVP_ATTENDANCE {
  YES = 'YES',
  NO = 'NO',
  MAYBE = 'MAYBE',
}

@Entity('rsvps')
export class Rsvp extends BaseEntity {
  @Expose()
  @Column({ name: 'wedding_id', type: 'bigint' })
  weddingId: number;

  @Expose()
  @Column({ name: 'guest_name', type: 'varchar', length: 255 })
  guestName: string;

  @Expose()
  @Column({
    type: 'enum',
    enum: RSVP_ATTENDANCE,
    default: RSVP_ATTENDANCE.MAYBE,
  })
  attendance: RSVP_ATTENDANCE;

  @Expose()
  @Column({ type: 'text', nullable: true })
  message: string | null;

  @ManyToOne(() => Wedding)
  @JoinColumn({ name: 'wedding_id' })
  wedding: Wedding;
}

