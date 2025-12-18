import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { AbstractTransactionService } from 'src/shared/services/abstract-transaction.service';
import { DataSource, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserRoleService } from 'src/user-role/user-role.service';
import { SalesService } from 'src/sales/sales.service';
import { CustomerService } from 'src/customer/customer.service';
import { UserRole } from 'src/user-role/entities/user-role.entity';
import { Sales } from 'src/sales/entities/sales.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { USER_ROLE } from 'src/role/role.constant';
import { SALES_STATUS } from 'src/sales/entities/sales.entity';

@Injectable()
export class UserService extends AbstractTransactionService {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(Sales)
    private readonly salesRepository: Repository<Sales>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly userRoleService: UserRoleService,
    private readonly salesService: SalesService,
    private readonly customerService: CustomerService,
  ) {
    super(dataSource);
  }

  async create(dto: CreateUserDto) {
    const existed = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existed) {
      throw new Error('Email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      email: dto.email,
      passwordHash,
      status: dto.status,
    });
    return this.userRepository.save(user);
  }

  async findWithPagination({ page = 1, limit = 10 }: QueryUserDto) {
    const [items, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: number, dto: UpdateUserDto, currentUserRoles: USER_ROLE[]) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isAdminOrManager =
      currentUserRoles.includes(USER_ROLE.SUPER_ADMIN) ||
      currentUserRoles.includes(USER_ROLE.MANAGER);

    // Check permission for sensitive fields
    if (
      (dto.role !== undefined ||
        dto.commissionPercent !== undefined ||
        dto.salesStatus !== undefined ||
        dto.customerSaleId !== undefined) &&
      !isAdminOrManager
    ) {
      throw new ForbiddenException(
        'Only SUPER_ADMIN and MANAGER can update role, commissionPercent, salesStatus, and customerSaleId',
      );
    }

    // Update basic user fields
    if (dto.email !== undefined) {
      user.email = dto.email;
    }

    if (dto.password !== undefined) {
      user.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    if (dto.status !== undefined) {
      user.status = dto.status;
    }

    await this.userRepository.save(user);

    // Update role if provided (dto.role is now roleId)
    if (dto.role !== undefined && isAdminOrManager) {
      // Find existing user role
      const existingUserRole = await this.userRoleRepository.findOne({
        where: { userId: id },
      });

      if (existingUserRole) {
        existingUserRole.roleId = dto.role as number;
        await this.userRoleRepository.save(existingUserRole);
      } else {
        await this.userRoleService.create({
          userId: id,
          roleId: dto.role as number,
        });
      }
    }

    // Update sales if commissionPercent or salesStatus provided
    if (
      (dto.commissionPercent !== undefined || dto.salesStatus !== undefined) &&
      isAdminOrManager
    ) {
      // Find sales by userId
      const sales = await this.salesRepository.findOne({
        where: { userId: id },
      });

      if (sales) {
        if (dto.commissionPercent !== undefined) {
          sales.commissionPercent = dto.commissionPercent;
        }
        if (dto.salesStatus !== undefined) {
          sales.status = dto.salesStatus as SALES_STATUS;
        }
        await this.salesRepository.save(sales);
      }
    }

    // Update customer saleId if provided
    if (dto.customerSaleId !== undefined && isAdminOrManager) {
      // Find customer by userId
      const customer = await this.customerRepository.findOne({
        where: { userId: id },
      });

      if (customer) {
        customer.saleId = dto.customerSaleId;
        await this.customerRepository.save(customer);
      }
    }

    return user;
  }

  async remove(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.softDelete(id);
    return { success: true };
  }
}
