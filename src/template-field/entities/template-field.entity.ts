import { Expose } from 'class-transformer';
import { BaseEntity } from 'src/shared/baseEntity.entity';
import { Template } from 'src/template/entities/template.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Entity('template_fields')
export class TemplateField extends BaseEntity {
  @Expose()
  @Column({ name: 'template_id', type: 'bigint' })
  templateId: number;

  @Expose()
  @Column({ type: 'varchar', length: 255 })
  key: string;

  @Expose()
  @Column({ type: 'varchar', length: 255 })
  label: string;

  @Expose()
  @Column({ type: 'varchar', length: 100 })
  type: string;

  @Expose()
  @Column({ type: 'boolean', default: false })
  required: boolean;

  @Expose()
  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @ManyToOne(() => Template, (template) => template.fields, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'template_id' })
  template: Template;
}




