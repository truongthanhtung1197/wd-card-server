import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Package } from 'src/package/entities/package.entity';
import { AbstractTransactionService } from 'src/shared/services/abstract-transaction.service';
import { Sales } from 'src/sales/entities/sales.entity';
import { User } from 'src/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderService extends AbstractTransactionService {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Package)
    private readonly packageRepository: Repository<Package>,
    @InjectRepository(Sales)
    private readonly salesRepository: Repository<Sales>,
  ) {
    super(dataSource);
  }

  async create(dto: CreateOrderDto) {
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const pkg = await this.packageRepository.findOne({
      where: { id: dto.packageId },
    });
    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    let sale: Sales | null = null;
    if (dto.saleId) {
      sale = await this.salesRepository.findOne({
        where: { id: dto.saleId },
      });
      if (!sale) {
        throw new NotFoundException('Sales not found');
      }
    }

    const entity = this.orderRepository.create({
      userId: dto.userId,
      packageId: dto.packageId,
      saleId: dto.saleId ?? null,
      commissionPercentSnapshot:
        dto.commissionPercentSnapshot ?? sale?.commissionPercent ?? null,
      startAt: dto.startAt,
      endAt: dto.endAt,
      status: dto.status,
    });

    return this.orderRepository.save(entity);
  }

  async findAll({ page = 1, limit = 10 }: QueryOrderDto) {
    const [items, total] = await this.orderRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['user', 'sale'],
    });

    return { items, total, page, limit };
  }

  async findOne(id: number) {
    const item = await this.orderRepository.findOne({
      where: { id },
      relations: ['user', 'sale'],
    });
    if (!item) {
      throw new NotFoundException('Order not found');
    }
    return item;
  }

  async update(id: number, dto: UpdateOrderDto) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (dto.userId) {
      const user = await this.userRepository.findOne({
        where: { id: dto.userId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      order.userId = dto.userId;
    }

    if (dto.packageId) {
      const pkg = await this.packageRepository.findOne({
        where: { id: dto.packageId },
      });
      if (!pkg) {
        throw new NotFoundException('Package not found');
      }
      order.packageId = dto.packageId;
    }

    if (dto.saleId !== undefined) {
      if (dto.saleId === null) {
        order.saleId = null;
      } else {
        const sale = await this.salesRepository.findOne({
          where: { id: dto.saleId },
        });
        if (!sale) {
          throw new NotFoundException('Sales not found');
        }
        order.saleId = dto.saleId;
      }
    }

    if (dto.commissionPercentSnapshot !== undefined) {
      order.commissionPercentSnapshot = dto.commissionPercentSnapshot;
    }

    if (dto.startAt !== undefined) {
      order.startAt = dto.startAt;
    }

    if (dto.endAt !== undefined) {
      order.endAt = dto.endAt;
    }

    if (dto.status !== undefined) {
      order.status = dto.status;
    }

    return this.orderRepository.save(order);
  }

  async remove(id: number) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.orderRepository.softDelete(id);
    return { success: true };
  }
}


