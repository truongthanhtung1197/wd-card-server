import { Service } from 'src/service/entities/service.entity';
import { BaseEntity } from 'src/shared/baseEntity.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('complimentaries')
export class Complimentary extends BaseEntity {
  @Column({ name: 'name', nullable: false })
  name: string;

  @Column({ name: 'service_id', nullable: false })
  serviceId: number;

  @ManyToOne(() => Service, (service) => service.complimentaries)
  @JoinColumn({ name: 'service_id' })
  service: Service;
}
