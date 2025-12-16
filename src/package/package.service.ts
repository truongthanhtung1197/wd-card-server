import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { AbstractTransactionService } from 'src/shared/services/abstract-transaction.service';
import { DataSource, Repository } from 'typeorm';
import { CreatePackageDto } from './dto/create-package.dto';
import { QueryPackageDto } from './dto/query-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { Package } from './entities/package.entity';

@Injectable()
export class PackageService extends AbstractTransactionService {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    @InjectRepository(Package)
    private readonly packageRepository: Repository<Package>,
  ) {
    super(dataSource);
  }

  async create(dto: CreatePackageDto) {
    const entity = this.packageRepository.create(dto);
    return this.packageRepository.save(entity);
  }

  async findAll({ page = 1, limit = 10 }: QueryPackageDto) {
    const [items, total] = await this.packageRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['features'],
    });

    return { items, total, page, limit };
  }

  async findOne(id: number) {
    const item = await this.packageRepository.findOne({
      where: { id },
      relations: ['features'],
    });
    if (!item) {
      throw new NotFoundException('Package not found');
    }
    return item;
  }

  async update(id: number, dto: UpdatePackageDto) {
    const pkg = await this.packageRepository.findOne({ where: { id } });
    if (!pkg) {
      throw new NotFoundException('Package not found');
    }
    Object.assign(pkg, dto);
    return this.packageRepository.save(pkg);
  }

  async remove(id: number) {
    const pkg = await this.packageRepository.findOne({ where: { id } });
    if (!pkg) {
      throw new NotFoundException('Package not found');
    }
    await this.packageRepository.softDelete(id);
    return { success: true };
  }
}


