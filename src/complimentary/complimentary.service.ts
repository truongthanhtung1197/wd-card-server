import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateComplimentaryDto } from 'src/complimentary/dto/create-complimentary.dto';
import { Repository } from 'typeorm';
import { Complimentary } from './entities/complimentary.entity';
@Injectable()
export class ComplimentaryService {
  constructor(
    @InjectRepository(Complimentary)
    private complimentaryRepository: Repository<Complimentary>,
  ) {}

  findAll() {
    return this.complimentaryRepository.find();
  }

  create(createComplimentaryDto: CreateComplimentaryDto) {
    const { service_id, ...complimentaryData } = createComplimentaryDto;
    const newComplimentary =
      this.complimentaryRepository.create(complimentaryData);
    newComplimentary.serviceId = Number(service_id);
    return this.complimentaryRepository.save(newComplimentary);
  }
}
