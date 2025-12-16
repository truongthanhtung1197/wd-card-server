import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { UpdateDomainDto } from 'src/domain/dto/update-domain.dto';
import { ROLE } from 'src/role/role.constant';
import { AbstractTransactionService } from 'src/shared/services/abstract-transaction.service';
import { Team } from 'src/team/entities/team.entity';
import { User } from 'src/user/entities/user.entity';
import { DataSource, In, Repository } from 'typeorm';
import { CreateDomainDto } from './dto/create-domain.dto';

import { plainToInstance } from 'class-transformer';
import { uniq } from 'lodash';
import { isNotNilOrEmpty } from 'ramda-adjunct';
import { Order } from 'src/order/entities/order.entity';
import { FILE_RELATION_TYPE } from 'src/shared/constants/file.constant';
import { ORDER_STATUS } from 'src/shared/constants/order.constant';
import { TEAM_MEMBER_ROLE } from 'src/shared/constants/team.constant';
import { UserDomain } from 'src/user-domain/entities/user-domain.entity';
import { GetDomainsDto } from './dto/get-domains.dto';
import { Domain } from './entities/domain.entity';
@Injectable()
export class DomainService extends AbstractTransactionService {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    @InjectRepository(Domain)
    private domainRepository: Repository<Domain>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {
    super(dataSource);
  }

  baseGetAllQueryBuilder({
    page = 1,
    limit = 10,
    search,
    status,
    sortBy = 'createdAt',
    sortOrder = 'DESC',
    teamId,
  }: GetDomainsDto) {
    const queryBuilder = this.domainRepository
      .createQueryBuilder('domain')
      .leftJoinAndSelect('domain.team', 'dt');
    if (search) {
      queryBuilder.andWhere('domain.name LIKE :search', {
        search: `%${search?.trim().toLowerCase()}%`,
      });
    }

    if (status && status.length > 0) {
      queryBuilder.andWhere('domain.status IN (:...status)', { status });
    }

    if (teamId) {
      queryBuilder.andWhere('domain.team_id = :teamId', { teamId });
    }

    queryBuilder.orderBy(`domain.${sortBy}`, sortOrder);

    queryBuilder.skip((Number(page) - 1) * Number(limit)).take(Number(limit));

    return queryBuilder;
  }

  async findWithPagination(query: GetDomainsDto) {
    const queryBuilder = this.baseGetAllQueryBuilder(query)
      .leftJoinAndSelect('domain.userDomains', 'userDomain')
      .leftJoinAndSelect('userDomain.user', 'user')
      .leftJoinAndSelect(
        'user.fileRelations',
        'fileRelations',
        'fileRelations.relatedType = :type AND fileRelations.relatedId = user.id',
        {
          type: FILE_RELATION_TYPE.USER_AVATAR,
        },
      )
      .leftJoinAndSelect('fileRelations.file', 'fileRelationsFile');

    if (query.assignedUserId) {
      queryBuilder.andWhere('userDomain.userId = :assignedUserId', {
        assignedUserId: query.assignedUserId,
      });
    }

    const [domains, total] = await queryBuilder.getManyAndCount();
    const data = plainToInstance(Domain, domains);
    return {
      data: data,
      total,
      limit: query.limit,
      page: query.page,
    };
  }

  async findDomainAssignToMeWithPagination(
    query: GetDomainsDto,
    currentUser: User,
  ) {
    const queryBuilder = this.baseGetAllQueryBuilder(query)
      .innerJoinAndSelect('domain.userDomains', 'userDomain')
      .innerJoinAndSelect('userDomain.user', 'user')
      .andWhere('userDomain.userId = :userId', { userId: currentUser.id });

    const [domains, total] = await queryBuilder.getManyAndCount();
    const data = plainToInstance(Domain, domains);
    return {
      data: data,
      total,
      limit: query.limit,
      page: query.page,
    };
  }

  async findAllOfMyTeam(params: GetDomainsDto & { userId: number }) {
    const { userId, ...rest } = params;
    const teamOfMyLeaderQuery = this.teamRepository
      .createQueryBuilder('team')
      .innerJoinAndSelect(
        'team.teamMembers',
        'teamMembers',
        'teamMembers.role IN (:...roles) AND teamMembers.user_id = :userId',
        {
          roles: [TEAM_MEMBER_ROLE.LEADER, TEAM_MEMBER_ROLE.VICE_LEADER],
          userId,
        },
      );

    const teamOfMyLeader = await teamOfMyLeaderQuery.getMany();

    const teamOfMyLeaderIds = teamOfMyLeader.map((team) => team.id);
    const queryBuilder = this.baseGetAllQueryBuilder(rest);

    queryBuilder.andWhere(
      teamOfMyLeaderIds.length > 0
        ? 'domain.team_id IN (:...teamIds)'
        : '1 = 0',
      { teamIds: teamOfMyLeaderIds },
    );

    const [domains, total] = await queryBuilder.getManyAndCount();

    return {
      data: domains,
      total,
      limit: params.limit,
      page: params.page,
    };
  }

  async findOne(id: number) {
    const domain = await this.domainRepository.findOne({
      where: { id },
      relations: {
        user: true,
        team: true,
        userDomains: {
          user: true,
        },
      },
    });

    if (!domain) {
      throw new NotFoundException('Domain not found');
    }

    const totalAmount = await this.orderRepository
      .createQueryBuilder('order')
      .select(
        `
          SUM(
            CAST(COALESCE(order.price, 0) AS DECIMAL(18,2))
            - CAST(COALESCE(order.discount, 0) AS DECIMAL(18,2))
            + CAST(COALESCE(order.priceAdjustment, 0) AS DECIMAL(18,2))
          )
        `,
        'total',
      )
      .where('order.domainId = :domainId', {
        domainId: domain.id,
      })
      .andWhere('order.status NOT IN (:...status)', {
        status: [
          ORDER_STATUS.REJECTED_BY_TEAM_LEADER,
          ORDER_STATUS.CANCELLED_BY_SEOER,
          ORDER_STATUS.CANCELLED_BY_MANAGER,
        ],
      })
      .getRawOne();

    return {
      data: domain,
      totalDomainSpending: Number(totalAmount?.total || 0),
    };
  }

  async create(createDomainDto: CreateDomainDto, currentUser: User) {
    const { teamId, ...rest } = createDomainDto;

    const requester = await this.userRepository.findOne({
      where: { id: currentUser.id },
      relations: {
        role: true,
      },
    });
    this.validateEditDoaminRole(requester?.role?.roleName as ROLE);

    if (teamId) {
      const team = await this.teamRepository.findOne({
        where: { id: Number(teamId) },
      });
      if (!team) {
        throw new NotFoundException('Team không tồn tại');
      }
    }
    await this.isExistDomains([rest.name]);
    return await this.domainRepository.save({
      ...rest,
      name: rest.name?.trim(),
      userId: currentUser.id,
      teamId: teamId,
    });
  }

  async update(id: number, data: UpdateDomainDto, currentUser: User) {
    return this.executeInTransaction(async (queryRunner, manager) => {
      const requester = await manager.findOne(User, {
        where: { id: currentUser.id },
        relations: {
          role: true,
        },
      });

      this.validateEditDoaminRole(requester?.role?.roleName as ROLE);
      const { teamId, ...rest } = data;

      const domain = await manager.findOne(Domain, {
        where: { id },
      });
      if (!domain) {
        throw new NotFoundException('Domain không tồn tại');
      }

      if (teamId) {
        const team = await manager.findOne(Team, {
          where: { id: Number(teamId) },
        });
        if (!team) {
          throw new NotFoundException('Team không tồn tại');
        }
      }

      if (domain.teamId !== teamId) {
        await manager.delete(UserDomain, { domainId: id });
      }
      if (data.name && data.name !== domain.name) {
        await this.isExistDomains([data.name]);
      }
      const updated = manager.merge(Domain, domain, data);
      return manager.save(updated);
    });
  }

  validateEditDoaminRole(userRole: ROLE) {
    const validRoles = [
      ROLE.SUPER_ADMIN,
      ROLE.ASSISTANT,
      ROLE.MANAGER,
      ROLE.TEAM_LEADER,
      ROLE.VICE_TEAM_LEADER,
    ];
    if (!validRoles.includes(userRole)) {
      throw new ForbiddenException(
        'Bạn không có quyền thực hiện hành động này',
      );
    }

    return true;
  }

  async isExistDomains(domainNames: string[]) {
    const domains = await this.domainRepository.find({
      where: { name: In(domainNames) },
    });
    if (isNotNilOrEmpty(domains)) {
      const domainNames = domains.map((domain) => domain.name);
      throw new NotFoundException(
        `Lỗi! ${domainNames.length} domain đã tồn tại trong hệ thống: ${uniq(domainNames).join(', ')}`,
      );
    }
    return true;
  }

  async remove(id: number, requesterId: number) {
    return this.executeInTransaction(async (queryRunner, manager) => {
      const requester = await this.userRepository.findOne({
        where: { id: requesterId },
        relations: {
          role: true,
        },
      });

      this.validateEditDoaminRole(requester?.role?.roleName as ROLE);

      const domain = await manager.findOne(Domain, {
        where: { id },
      });
      if (!domain) {
        throw new NotFoundException('Domain not found');
      }
      await manager.softDelete(UserDomain, { domainId: id });
      await manager.softDelete(Domain, id);
      return { success: true };
    });
  }
}
