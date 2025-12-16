import { Expose } from 'class-transformer';
import { FileRelation } from 'src/file-relation/entities/file-relation.entity';
import { BaseEntity } from 'src/shared/baseEntity.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity('comments')
export class Comment extends BaseEntity {
  @Expose()
  @Column({ nullable: false, name: 'order_id', type: 'bigint' })
  orderId: number;

  @Expose()
  @Column({ nullable: false, name: 'content', type: 'text' })
  content: string;

  @Expose()
  @Column({ name: 'user_id', nullable: true, default: null, type: 'bigint' })
  userId: number | null;

  @Expose()
  @Column({ name: 'parent_id', nullable: true, default: null, type: 'bigint' })
  parentId: number | null;

  @Expose()
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Expose()
  @ManyToOne(() => Comment, (comment) => comment.id)
  @JoinColumn({ name: 'parent_id' })
  parent: Comment;

  @Expose()
  @OneToMany(() => FileRelation, (relation) => relation.comment)
  fileRelations: FileRelation[];

  @Expose()
  @OneToMany(() => Comment, (comment) => comment.parent)
  childrens: Comment[];
}
