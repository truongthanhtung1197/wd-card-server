import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { AbstractTransactionService } from 'src/shared/services/abstract-transaction.service';
import { DataSource, Repository } from 'typeorm';
import { CreatePackageFeatureDto } from './dto/create-package-feature.dto';
import { QueryPackageFeatureDto } from './dto/query-package-feature.dto';
import { UpdatePackageFeatureDto } from './dto/update-package-feature.dto';
import { PackageFeature } from './entities/package-feature.entity';
import { Package } from 'src/package/entities/package.entity';

@Injectable()
export class PackageFeatureService extends AbstractTransactionService {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    @InjectRepository(PackageFeature)
    private readonly featureRepository: Repository<PackageFeature>,
    @InjectRepository(Package)
    private readonly packageRepository: Repository<Package>,
  ) {
    super(dataSource);
  }

  async create(dto: CreatePackageFeatureDto) {
    const pkg = await this.packageRepository.findOne({
      where: { id: dto.packageId },
    });
    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    const entity = this.featureRepository.create({
      packageId: dto.packageId,
      featureKey: dto.featureKey,
      featureValue: dto.featureValue,
    });
    return this.featureRepository.save(entity);
  }

  async findAll({ page = 1, limit = 10 }: QueryPackageFeatureDto) {
    const [items, total] = await this.featureRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['package'],
    });

    return { items, total, page, limit };
  }

  async findOne(id: number) {
    const item = await this.featureRepository.findOne({
      where: { id },
      relations: ['package'],
    });
    if (!item) {
      throw new NotFoundException('Package feature not found');
    }
    return item;
  }

  async update(id: number, dto: UpdatePackageFeatureDto) {
    const feature = await this.featureRepository.findOne({ where: { id } });
    if (!feature) {
      throw new NotFoundException('Package feature not found');
    }

    if (dto.packageId) {
      const pkg = await this.packageRepository.findOne({
        where: { id: dto.packageId },
      });
      if (!pkg) {
        throw new NotFoundException('Package not found');
      }
      feature.packageId = dto.packageId;
    }

    if (dto.featureKey !== undefined) {
      feature.featureKey = dto.featureKey;
    }

    if (dto.featureValue !== undefined) {
      feature.featureValue = dto.featureValue;
    }

    return this.featureRepository.save(feature);
  }

  async remove(id: number) {
    const feature = await this.featureRepository.findOne({ where: { id } });
    if (!feature) {
      throw new NotFoundException('Package feature not found');
    }

    await this.featureRepository.softDelete(id);
    return { success: true };
  }
}


