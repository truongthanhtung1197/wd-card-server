import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Domain } from 'src/domain/entities/domain.entity';
import { ROLE } from 'src/role/role.constant';
import { AbstractTransactionService } from 'src/shared/services/abstract-transaction.service';
import { CreateUserDomainDto } from 'src/user-domain/dto/create-user-domain.dto';
import { GetUserDomainsDto } from 'src/user-domain/dto/query-user-domain.dto';
import { UserDomain } from 'src/user-domain/entities/user-domain.entity';
import { User } from 'src/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UserDomainService extends AbstractTransactionService {
  private readonly editUserDomainRoles = [
    ROLE.MANAGER,
    ROLE.SUPER_ADMIN,
    ROLE.ASSISTANT,
    ROLE.TEAM_LEADER,
    ROLE.VICE_TEAM_LEADER,
  ];

  constructor(
    @InjectDataSource() dataSource: DataSource,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserDomain)
    private userDomainRepository: Repository<UserDomain>,
  ) {
    super(dataSource);
  }

  async createUserDomain(
    createUserDomainDto: CreateUserDomainDto,
    requesterId: number,
  ) {
    return this.executeInTransaction(async (queryRunner, manager) => {
      const user = await manager.findOne(User, {
        where: { id: requesterId },
        relations: ['role'],
      });
      if (!this.editUserDomainRoles.includes(user?.role?.roleName as ROLE)) {
        throw new ForbiddenException('Bạn không có quyền cho thao tác này');
      }

      const domain = await manager.findOne(Domain, {
        where: { id: createUserDomainDto.domainId },
      });
      if (!domain) {
        throw new NotFoundException('Domain không tồn tại');
      }

      const existUserDoamin = await manager.findOne(UserDomain, {
        where: {
          domain: { id: createUserDomainDto.domainId },
        },
      });
      if (existUserDoamin) {
        throw new BadRequestException(
          'Domain này đã được gán cho người khác rồi!',
        );
      }

      const assignToUser = await manager.findOne(User, {
        where: { id: createUserDomainDto.userId },
      });
      if (!assignToUser) {
        throw new NotFoundException('User không tồn tại');
      }

      const userDomain = await manager.findOne(UserDomain, {
        where: {
          domain: { id: createUserDomainDto.domainId },
          user: { id: createUserDomainDto.userId },
        },
      });
      if (userDomain) {
        throw new BadRequestException(
          'Domain này đã được gán cho user này trước đó',
        );
      }
      const newUserDomain = manager.create(UserDomain, createUserDomainDto);
      return await manager.save(newUserDomain);
    });
  }

  async findWithPagination({
    page = 1,
    limit = 10,
    search,
    assignedUserId,
    teamId,
    sortBy = 'createdAt',
    sortOrder = 'DESC',
  }: GetUserDomainsDto) {
    const queryBuilder = this.userDomainRepository
      .createQueryBuilder('user_domains')
      .innerJoinAndSelect('user_domains.user', 'user')
      .innerJoinAndSelect('user_domains.domain', 'domain')
      .orderBy(`user_domains.${sortBy}`, sortOrder)
      .skip((Number(page) - 1) * Number(limit))
      .take(Number(limit));
    if (search) {
      queryBuilder.andWhere(`LOWER(user.username) LIKE LOWER(:search)`, {
        search: `%${search}%`,
      });
    }
    if (assignedUserId) {
      queryBuilder.andWhere('user_domains.userId = :assignedUserId', {
        assignedUserId,
      });
    }
    if (teamId) {
      queryBuilder.andWhere('domain.team_id = :teamId', {
        teamId,
      });
    }
    const [data, total] = await queryBuilder.getManyAndCount();

    const _data = plainToInstance(UserDomain, data);
    return {
      data: _data,
      total,
      limit: Number(limit),
      page: Number(page),
    };
  }

  // async update(
  //   id: number,
  //   updateUserDomainDto: UpdateUserDomainDto,
  //   currentUser: User,
  // ) {
  //   return this.executeInTransaction(async (queryRunner, manager) => {
  //     const user = await manager.findOne(User, {
  //       where: { id: currentUser.id },
  //       relations: ['role'],
  //     });
  //     if (!this.editUserDomainRoles.includes(user?.role?.roleName as ROLE)) {
  //       throw new ForbiddenException(
  //         'Bạn không có quyền cập nhật thành viên trong team',
  //       );
  //     }
  //     const userDomain = await manager.findOne(UserDomain, {
  //       where: { id, user: { id: updateUserDomainDto.userId } },
  //     });
  //     if (!userDomain) {
  //       throw new NotFoundException('User domain không tồn tại');
  //     }
  //     manager.merge(UserDomain, userDomain, {
  //       user: { id: updateUserDomainDto.userId },
  //     });
  //     return await manager.save(userDomain);
  //   });
  // }
  async remove(id: number, currentUser: User) {
    return this.executeInTransaction(async (queryRunner, manager) => {
      const user = await manager.findOne(User, {
        where: { id: currentUser.id },
        relations: ['role'],
      });
      if (!this.editUserDomainRoles.includes(user?.role?.roleName as ROLE)) {
        throw new ForbiddenException('Bạn không có quyền xóa user domain');
      }

      const userDomain = await manager.findOne(UserDomain, { where: { id } });
      if (!userDomain) {
        throw new NotFoundException('User domain không tồn tại');
      }

      return await manager.delete(UserDomain, {
        id,
      });
    });
  }
}
