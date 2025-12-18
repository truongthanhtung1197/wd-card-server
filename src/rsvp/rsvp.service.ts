import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { AbstractTransactionService } from 'src/shared/services/abstract-transaction.service';
import { Wedding } from 'src/wedding/entities/wedding.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateRsvpDto } from './dto/create-rsvp.dto';
import { QueryRsvpDto } from './dto/query-rsvp.dto';
import { UpdateRsvpDto } from './dto/update-rsvp.dto';
import { Rsvp } from './entities/rsvp.entity';

@Injectable()
export class RsvpService extends AbstractTransactionService {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    @InjectRepository(Rsvp)
    private readonly rsvpRepository: Repository<Rsvp>,
    @InjectRepository(Wedding)
    private readonly weddingRepository: Repository<Wedding>,
  ) {
    super(dataSource);
  }

  async create(dto: CreateRsvpDto) {
    const wedding = await this.weddingRepository.findOne({
      where: { id: dto.weddingId },
    });
    if (!wedding) {
      throw new NotFoundException('Wedding not found');
    }

    const entity = this.rsvpRepository.create({
      weddingId: dto.weddingId,
      guestName: dto.guestName,
      attendance: dto.attendance,
      message: dto.message ?? null,
    });

    return this.rsvpRepository.save(entity);
  }

  async findAll(query: QueryRsvpDto) {
    const { page = 1, limit = 10, weddingId, attendance } = query;

    const queryBuilder = this.rsvpRepository
      .createQueryBuilder('rsvp')
      .leftJoinAndSelect('rsvp.wedding', 'wedding')
      .orderBy('rsvp.createdAt', 'DESC');

    if (weddingId) {
      queryBuilder.where('rsvp.weddingId = :weddingId', { weddingId });
    }

    if (attendance) {
      queryBuilder.andWhere('rsvp.attendance = :attendance', { attendance });
    }

    const [items, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total, page, limit };
  }

  async findOne(id: number) {
    const item = await this.rsvpRepository.findOne({
      where: { id },
      relations: ['wedding'],
    });
    if (!item) {
      throw new NotFoundException('RSVP not found');
    }
    return item;
  }

  async update(id: number, dto: UpdateRsvpDto) {
    const rsvp = await this.rsvpRepository.findOne({ where: { id } });
    if (!rsvp) {
      throw new NotFoundException('RSVP not found');
    }

    if (dto.weddingId) {
      const wedding = await this.weddingRepository.findOne({
        where: { id: dto.weddingId },
      });
      if (!wedding) {
        throw new NotFoundException('Wedding not found');
      }
      rsvp.weddingId = dto.weddingId;
    }

    if (dto.guestName !== undefined) {
      rsvp.guestName = dto.guestName;
    }

    if (dto.attendance !== undefined) {
      rsvp.attendance = dto.attendance;
    }

    if (dto.message !== undefined) {
      rsvp.message = dto.message ?? null;
    }

    return this.rsvpRepository.save(rsvp);
  }

  async remove(id: number) {
    const rsvp = await this.rsvpRepository.findOne({ where: { id } });
    if (!rsvp) {
      throw new NotFoundException('RSVP not found');
    }

    await this.rsvpRepository.softDelete(id);
    return { success: true };
  }
}

