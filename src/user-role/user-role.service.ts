import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { AbstractTransactionService } from 'src/shared/services/abstract-transaction.service';
import { Role } from 'src/role/entities/role.entity';
import { User } from 'src/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { QueryUserRoleDto } from './dto/query-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UserRole } from './entities/user-role.entity';

@Injectable()
export class UserRoleService extends AbstractTransactionService {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {
    super(dataSource);
  }

  async create(dto: CreateUserRoleDto) {
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const role = await this.roleRepository.findOne({
      where: { id: dto.roleId },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const userRole = this.userRoleRepository.create({
      userId: dto.userId,
      roleId: dto.roleId,
    });
    return this.userRoleRepository.save(userRole);
  }

  async findAll({ page = 1, limit = 10 }: QueryUserRoleDto) {
    const [items, total] = await this.userRoleRepository.findAndCount({
      relations: ['user', 'role'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { items, total, page, limit };
  }

  async findOne(id: number) {
    const userRole = await this.userRoleRepository.findOne({
      where: { id },
      relations: ['user', 'role'],
    });
    if (!userRole) {
      throw new NotFoundException('UserRole not found');
    }
    return userRole;
  }

  async update(id: number, dto: UpdateUserRoleDto) {
    const userRole = await this.userRoleRepository.findOne({ where: { id } });
    if (!userRole) {
      throw new NotFoundException('UserRole not found');
    }

    if (dto.userId) {
      const user = await this.userRepository.findOne({
        where: { id: dto.userId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      userRole.userId = dto.userId;
    }

    if (dto.roleId) {
      const role = await this.roleRepository.findOne({
        where: { id: dto.roleId },
      });
      if (!role) {
        throw new NotFoundException('Role not found');
      }
      userRole.roleId = dto.roleId;
    }

    return this.userRoleRepository.save(userRole);
  }

  async remove(id: number) {
    const userRole = await this.userRoleRepository.findOne({ where: { id } });
    if (!userRole) {
      throw new NotFoundException('UserRole not found');
    }
    await this.userRoleRepository.softDelete(id);
    return { success: true };
  }
}


