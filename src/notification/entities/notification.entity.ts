import { Expose } from 'class-transformer';
import { BaseEntity } from 'src/shared/baseEntity.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('notifications')
export class Notification extends BaseEntity {
  @Expose()
  @Column({ name: 'sender_id', type: 'bigint', nullable: true, default: null })
  senderId: number | null;

  @Expose()
  @Column({ name: 'receiver_id', type: 'bigint', nullable: false })
  receiverId: number;

  @Expose()
  @Column({ name: 'message', type: 'text', nullable: false })
  message: string;

  // Type is a free-form string (no DB-level enum constraint)
  @Expose()
  @Column({ name: 'type', type: 'varchar', length: 255, nullable: true })
  type: string;

  @Expose()
  @Column({ name: 'read_at', type: 'timestamp', nullable: true, default: null })
  readAt: Date | null;

  @Expose()
  @Column({ name: 'metadata', type: 'json', nullable: true, default: null })
  metadata: any;

  @Expose()
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'sender_id' })
  sender: User | null;

  @Expose()
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;
}
