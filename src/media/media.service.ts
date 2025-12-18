import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { AbstractTransactionService } from 'src/shared/services/abstract-transaction.service';
import { Wedding } from 'src/wedding/entities/wedding.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateMediaDto } from './dto/create-media.dto';
import { QueryMediaDto } from './dto/query-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { Media } from './entities/media.entity';

@Injectable()
export class MediaService extends AbstractTransactionService {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    @InjectRepository(Wedding)
    private readonly weddingRepository: Repository<Wedding>,
  ) {
    super(dataSource);
  }

  async create(dto: CreateMediaDto) {
    const wedding = await this.weddingRepository.findOne({
      where: { id: dto.weddingId },
    });
    if (!wedding) {
      throw new NotFoundException('Wedding not found');
    }

    const entity = this.mediaRepository.create({
      weddingId: dto.weddingId,
      ownerType: dto.ownerType,
      ownerId: dto.ownerId,
      mediaType: dto.mediaType,
      url: dto.url,
      thumbUrl: dto.thumbUrl ?? null,
      metadata: dto.metadata ?? null,
    });

    return this.mediaRepository.save(entity);
  }

  async findAll(query: QueryMediaDto) {
    const { page = 1, limit = 10, weddingId, mediaType, ownerType, ownerId } =
      query;

    const queryBuilder = this.mediaRepository
      .createQueryBuilder('media')
      .leftJoinAndSelect('media.wedding', 'wedding')
      .orderBy('media.createdAt', 'DESC');

    if (weddingId) {
      queryBuilder.where('media.weddingId = :weddingId', { weddingId });
    }

    if (mediaType) {
      queryBuilder.andWhere('media.mediaType = :mediaType', { mediaType });
    }

    if (ownerType) {
      queryBuilder.andWhere('media.ownerType = :ownerType', { ownerType });
    }

    if (ownerId) {
      queryBuilder.andWhere('media.ownerId = :ownerId', { ownerId });
    }

    const [items, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total, page, limit };
  }

  async findOne(id: number) {
    const item = await this.mediaRepository.findOne({
      where: { id },
      relations: ['wedding'],
    });
    if (!item) {
      throw new NotFoundException('Media not found');
    }
    return item;
  }

  async update(id: number, dto: UpdateMediaDto) {
    const media = await this.mediaRepository.findOne({ where: { id } });
    if (!media) {
      throw new NotFoundException('Media not found');
    }

    if (dto.weddingId) {
      const wedding = await this.weddingRepository.findOne({
        where: { id: dto.weddingId },
      });
      if (!wedding) {
        throw new NotFoundException('Wedding not found');
      }
      media.weddingId = dto.weddingId;
    }

    if (dto.ownerType !== undefined) {
      media.ownerType = dto.ownerType;
    }

    if (dto.ownerId !== undefined) {
      media.ownerId = dto.ownerId;
    }

    if (dto.mediaType !== undefined) {
      media.mediaType = dto.mediaType;
    }

    if (dto.url !== undefined) {
      media.url = dto.url;
    }

    if (dto.thumbUrl !== undefined) {
      media.thumbUrl = dto.thumbUrl ?? null;
    }

    if (dto.metadata !== undefined) {
      media.metadata = dto.metadata ?? null;
    }

    return this.mediaRepository.save(media);
  }

  async remove(id: number) {
    const media = await this.mediaRepository.findOne({ where: { id } });
    if (!media) {
      throw new NotFoundException('Media not found');
    }

    await this.mediaRepository.softDelete(id);
    return { success: true };
  }
}

