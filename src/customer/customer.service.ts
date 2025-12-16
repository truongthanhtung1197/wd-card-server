import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { AbstractTransactionService } from 'src/shared/services/abstract-transaction.service';
import { Sales } from 'src/sales/entities/sales.entity';
import { User } from 'src/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './entities/customer.entity';

@Injectable()
export class CustomerService extends AbstractTransactionService {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Sales)
    private readonly salesRepository: Repository<Sales>,
  ) {
    super(dataSource);
  }

  async create(dto: CreateCustomerDto) {
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.saleId) {
      const sale = await this.salesRepository.findOne({
        where: { id: dto.saleId },
      });
      if (!sale) {
        throw new NotFoundException('Sales not found');
      }
    }

    const entity = this.customerRepository.create({
      userId: dto.userId,
      saleId: dto.saleId ?? null,
      fullName: dto.fullName,
      phone: dto.phone,
    });
    return this.customerRepository.save(entity);
  }

  async findAll({ page = 1, limit = 10 }: QueryCustomerDto) {
    const [items, total] = await this.customerRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['user', 'sale'],
    });

    return { items, total, page, limit };
  }

  async findOne(id: number) {
    const item = await this.customerRepository.findOne({
      where: { id },
      relations: ['user', 'sale'],
    });
    if (!item) {
      throw new NotFoundException('Customer not found');
    }
    return item;
  }

  async update(id: number, dto: UpdateCustomerDto) {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (dto.userId) {
      const user = await this.userRepository.findOne({
        where: { id: dto.userId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      customer.userId = dto.userId;
    }

    if (dto.saleId !== undefined) {
      if (dto.saleId === null) {
        customer.saleId = null;
      } else {
        const sale = await this.salesRepository.findOne({
          where: { id: dto.saleId },
        });
        if (!sale) {
          throw new NotFoundException('Sales not found');
        }
        customer.saleId = dto.saleId;
      }
    }

    if (dto.fullName !== undefined) {
      customer.fullName = dto.fullName;
    }

    if (dto.phone !== undefined) {
      customer.phone = dto.phone;
    }

    return this.customerRepository.save(customer);
  }

  async remove(id: number) {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    await this.customerRepository.softDelete(id);
    return { success: true };
  }
}


