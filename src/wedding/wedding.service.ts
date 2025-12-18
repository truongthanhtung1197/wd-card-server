import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/customer/entities/customer.entity';
import { Order } from 'src/order/entities/order.entity';
import { AbstractTransactionService } from 'src/shared/services/abstract-transaction.service';
import { Template } from 'src/template/entities/template.entity';
import { User } from 'src/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateWeddingDto } from './dto/create-wedding.dto';
import { QueryWeddingDto } from './dto/query-wedding.dto';
import { UpdateWeddingDto } from './dto/update-wedding.dto';
import { Wedding } from './entities/wedding.entity';

@Injectable()
export class WeddingService extends AbstractTransactionService {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    @InjectRepository(Wedding)
    private readonly weddingRepository: Repository<Wedding>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {
    super(dataSource);
  }

  async create(dto: CreateWeddingDto) {
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const customer = await this.customerRepository.findOne({
      where: { id: dto.customerId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const template = await this.templateRepository.findOne({
      where: { id: dto.templateId },
    });
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    const order = await this.orderRepository.findOne({
      where: { id: dto.orderId },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if slug already exists
    const existingWedding = await this.weddingRepository.findOne({
      where: { slug: dto.slug },
    });
    if (existingWedding) {
      throw new ConflictException('Slug already exists');
    }

    const entity = this.weddingRepository.create({
      userId: dto.userId,
      customerId: dto.customerId,
      templateId: dto.templateId,
      orderId: dto.orderId,
      slug: dto.slug,
    });

    return this.weddingRepository.save(entity);
  }

  async findAll({ page = 1, limit = 10 }: QueryWeddingDto) {
    const [items, total] = await this.weddingRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['user', 'customer', 'template', 'order'],
    });

    return { items, total, page, limit };
  }

  async findOne(id: number) {
    const item = await this.weddingRepository.findOne({
      where: { id },
      relations: ['user', 'customer', 'template', 'order'],
    });
    if (!item) {
      throw new NotFoundException('Wedding not found');
    }
    return item;
  }

  async findBySlug(slug: string) {
    const item = await this.weddingRepository.findOne({
      where: { slug },
      relations: ['user', 'customer', 'template', 'order'],
    });
    if (!item) {
      throw new NotFoundException('Wedding not found');
    }
    return item;
  }

  async update(id: number, dto: UpdateWeddingDto) {
    const wedding = await this.weddingRepository.findOne({ where: { id } });
    if (!wedding) {
      throw new NotFoundException('Wedding not found');
    }

    if (dto.userId) {
      const user = await this.userRepository.findOne({
        where: { id: dto.userId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      wedding.userId = dto.userId;
    }

    if (dto.customerId) {
      const customer = await this.customerRepository.findOne({
        where: { id: dto.customerId },
      });
      if (!customer) {
        throw new NotFoundException('Customer not found');
      }
      wedding.customerId = dto.customerId;
    }

    if (dto.templateId) {
      const template = await this.templateRepository.findOne({
        where: { id: dto.templateId },
      });
      if (!template) {
        throw new NotFoundException('Template not found');
      }
      wedding.templateId = dto.templateId;
    }

    if (dto.orderId) {
      const order = await this.orderRepository.findOne({
        where: { id: dto.orderId },
      });
      if (!order) {
        throw new NotFoundException('Order not found');
      }
      wedding.orderId = dto.orderId;
    }

    if (dto.slug) {
      // Check if slug already exists (excluding current wedding)
      const existingWedding = await this.weddingRepository.findOne({
        where: { slug: dto.slug },
      });
      if (existingWedding && existingWedding.id !== id) {
        throw new ConflictException('Slug already exists');
      }
      wedding.slug = dto.slug;
    }

    return this.weddingRepository.save(wedding);
  }

  async remove(id: number) {
    const wedding = await this.weddingRepository.findOne({ where: { id } });
    if (!wedding) {
      throw new NotFoundException('Wedding not found');
    }

    await this.weddingRepository.softDelete(id);
    return { success: true };
  }
}
