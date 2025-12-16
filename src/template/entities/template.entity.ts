import { Expose } from 'class-transformer';
import { BaseEntity } from 'src/shared/baseEntity.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { TemplateField } from 'src/template-field/entities/template-field.entity';

export enum TEMPLATE_STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('templates')
export class Template extends BaseEntity {
  @Expose()
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Expose()
  @Column({ name: 'preview_image', type: 'varchar', length: 500 })
  previewImage: string;

  @Expose()
  @Column({
    type: 'enum',
    enum: TEMPLATE_STATUS,
    default: TEMPLATE_STATUS.ACTIVE,
  })
  status: TEMPLATE_STATUS;

  @OneToMany(() => TemplateField, (field) => field.template)
  fields: TemplateField[];
}


