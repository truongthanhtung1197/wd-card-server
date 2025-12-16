import { Expose } from 'class-transformer';
import { FileRelation } from 'src/file-relation/entities/file-relation.entity';
import { BaseEntity } from 'src/shared/baseEntity.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('files')
export class File extends BaseEntity {
  @Expose()
  @Column({ nullable: true, default: null })
  user_id: number;

  @Column({ nullable: false })
  path: string;

  @Expose()
  @Column({ nullable: true, default: null })
  name: string;

  @Expose()
  @Column({ nullable: true, default: null })
  description: string;

  @Expose()
  @OneToMany(() => FileRelation, (relation) => relation.file)
  relations: FileRelation[];
}
