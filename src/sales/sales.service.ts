import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { AbstractTransactionService } from 'src/shared/services/abstract-transaction.service';
import { User } from 'src/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateSalesDto } from './dto/create-sales.dto';
import { QuerySalesDto } from './dto/query-sales.dto';
import { UpdateSalesDto } from './dto/update-sales.dto';
import { Sales } from './entities/sales.entity';

@Injectable()
export class SalesService extends AbstractTransactionService {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    @InjectRepository(Sales)
    private readonly salesRepository: Repository<Sales>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super(dataSource);
  }

  async create(dto: CreateSalesDto) {
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const entity = this.salesRepository.create({
      userId: dto.userId,
      commissionPercent: dto.commissionPercent,
      status: dto.status,
      fullName: dto.fullName,
      bankName: dto.bankName,
      bankNumber: dto.bankNumber,
      phone: dto.phone,
    });
    return this.salesRepository.save(entity);
  }

  async findAll({ page = 1, limit = 10 }: QuerySalesDto) {
    const [items, total] = await this.salesRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });

    return { items, total, page, limit };
  }

  async findOne(id: number) {
    const item = await this.salesRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!item) {
      throw new NotFoundException('Sales not found');
    }
    return item;
  }

  async update(id: number, dto: UpdateSalesDto) {
    const sales = await this.salesRepository.findOne({ where: { id } });
    if (!sales) {
      throw new NotFoundException('Sales not found');
    }

    if (dto.userId) {
      const user = await this.userRepository.findOne({
        where: { id: dto.userId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      sales.userId = dto.userId;
    }

    if (dto.commissionPercent !== undefined) {
      sales.commissionPercent = dto.commissionPercent;
    }

    if (dto.status !== undefined) {
      sales.status = dto.status;
    }

    return this.salesRepository.save(sales);
  }

  async remove(id: number) {
    const sales = await this.salesRepository.findOne({ where: { id } });
    if (!sales) {
      throw new NotFoundException('Sales not found');
    }

    await this.salesRepository.softDelete(id);
    return { success: true };
  }
}
