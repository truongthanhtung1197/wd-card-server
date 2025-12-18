import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { AbstractTransactionService } from 'src/shared/services/abstract-transaction.service';
import { Wedding } from 'src/wedding/entities/wedding.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateWeddingFriendDto } from './dto/create-wedding-friend.dto';
import { QueryWeddingFriendDto } from './dto/query-wedding-friend.dto';
import { UpdateWeddingFriendDto } from './dto/update-wedding-friend.dto';
import { WeddingFriend } from './entities/wedding-friend.entity';

@Injectable()
export class WeddingFriendService extends AbstractTransactionService {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    @InjectRepository(WeddingFriend)
    private readonly weddingFriendRepository: Repository<WeddingFriend>,
    @InjectRepository(Wedding)
    private readonly weddingRepository: Repository<Wedding>,
  ) {
    super(dataSource);
  }

  async create(dto: CreateWeddingFriendDto) {
    const wedding = await this.weddingRepository.findOne({
      where: { id: dto.weddingId },
    });
    if (!wedding) {
      throw new NotFoundException('Wedding not found');
    }

    const entity = this.weddingFriendRepository.create({
      weddingId: dto.weddingId,
      friendName: dto.friendName,
      relation: dto.relation,
      personalMessage: dto.personalMessage ?? null,
    });

    return this.weddingFriendRepository.save(entity);
  }

  async findAll(query: QueryWeddingFriendDto) {
    const { page = 1, limit = 10, weddingId } = query;

    const queryBuilder = this.weddingFriendRepository
      .createQueryBuilder('weddingFriend')
      .leftJoinAndSelect('weddingFriend.wedding', 'wedding')
      .orderBy('weddingFriend.createdAt', 'DESC');

    if (weddingId) {
      queryBuilder.where('weddingFriend.weddingId = :weddingId', { weddingId });
    }

    const [items, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total, page, limit };
  }

  async findOne(id: number) {
    const item = await this.weddingFriendRepository.findOne({
      where: { id },
      relations: ['wedding'],
    });
    if (!item) {
      throw new NotFoundException('Wedding friend not found');
    }
    return item;
  }

  async update(id: number, dto: UpdateWeddingFriendDto) {
    const weddingFriend = await this.weddingFriendRepository.findOne({
      where: { id },
    });
    if (!weddingFriend) {
      throw new NotFoundException('Wedding friend not found');
    }

    if (dto.weddingId) {
      const wedding = await this.weddingRepository.findOne({
        where: { id: dto.weddingId },
      });
      if (!wedding) {
        throw new NotFoundException('Wedding not found');
      }
      weddingFriend.weddingId = dto.weddingId;
    }

    if (dto.friendName !== undefined) {
      weddingFriend.friendName = dto.friendName;
    }

    if (dto.relation !== undefined) {
      weddingFriend.relation = dto.relation;
    }

    if (dto.personalMessage !== undefined) {
      weddingFriend.personalMessage = dto.personalMessage ?? null;
    }

    return this.weddingFriendRepository.save(weddingFriend);
  }

  async remove(id: number) {
    const weddingFriend = await this.weddingFriendRepository.findOne({
      where: { id },
    });
    if (!weddingFriend) {
      throw new NotFoundException('Wedding friend not found');
    }

    await this.weddingFriendRepository.softDelete(id);
    return { success: true };
  }
}

