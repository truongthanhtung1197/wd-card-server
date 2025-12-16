import { Expose } from 'class-transformer';
import { Comment } from 'src/comment/entities/comment.entity';
import { File } from 'src/file/entities/file.entity';
import { Order } from 'src/order/entities/order.entity';
import { BaseEntity } from 'src/shared/baseEntity.entity';
import { FILE_RELATION_TYPE } from 'src/shared/constants/file.constant';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

@Entity('file_relations')
export class FileRelation extends BaseEntity {
  @Expose()
  @Column({ nullable: true, default: null, name: 'file_id' })
  fileId: number;

  @Expose()
  @Column({ nullable: true, default: null, name: 'related_id' })
  relatedId: number;

  @Column({
    nullable: false,
    type: 'enum',
    enum: FILE_RELATION_TYPE,
    name: 'related_type',
  })
  relatedType: FILE_RELATION_TYPE;

  @Expose()
  @ManyToOne(() => File, (file) => file.id)
  @JoinColumn({ name: 'file_id' })
  file: File;

  @Expose()
  @ManyToOne(() => Order, (order) => order.id)
  @JoinColumn({ name: 'related_id' })
  order: Order;

  @Expose()
  @OneToOne(() => Comment, (comment) => comment.id)
  @JoinColumn({ name: 'related_id' })
  comment: Comment;

  @Expose()
  @OneToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'related_id' })
  user: User;
}
