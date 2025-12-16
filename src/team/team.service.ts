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
import { FILE_RELATION_TYPE } from 'src/shared/constants/file.constant';
import { TEAM_MEMBER_ROLE } from 'src/shared/constants/team.constant';
import { AbstractTransactionService } from 'src/shared/services/abstract-transaction.service';
import { TeamMember } from 'src/team-member/entities/team-member.entity';
import { QueryTeamDto } from 'src/team/dto/query-team.dto';
import {
  AddMemberToTeamDto,
  UpdateTeamDto,
} from 'src/team/dto/update-team.dto';
import { UserDomain } from 'src/user-domain/entities/user-domain.entity';
import { User } from 'src/user/entities/user.entity';
import { DataSource, EntityManager, In, IsNull, Repository } from 'typeorm';
import { CreateTeamDto } from './dto/create-team.dto';
import { Team } from './entities/team.entity';

@Injectable()
export class TeamService extends AbstractTransactionService {
  private readonly editTeamRoles = [
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
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
  ) {
    super(dataSource);
  }

  async create(createTeamDto: CreateTeamDto, currentUser: User) {
    return this.executeInTransaction(async (queryRunner, manager) => {
      const user = await manager.findOne(User, {
        where: { id: currentUser.id },
        relations: ['role'],
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!this.editTeamRoles.includes(user?.role?.roleName as ROLE)) {
        throw new ForbiddenException('Bạn không có quyền tạo team');
      }

      const team = manager.create(Team, {
        name: createTeamDto.name,
        description: createTeamDto.description,
        telegramId: createTeamDto.telegramId,
        owner: user,
      });
      await manager.save(team);

      const userIds = createTeamDto.teamMembers.map((m) => m.userId);
      const isMemberHasOtherTeam = await this.checkMemberHasOtherTeam(
        userIds,
        manager,
      );
      if (isMemberHasOtherTeam) {
        throw new BadRequestException('User đã tồn tại trong team khác');
      }

      const users = await manager.find(User, {
        where: { id: In(userIds) },
        relations: ['role'],
      });
      if (users.length !== userIds.length) {
        throw new BadRequestException('Một số user không hợp lệ');
      } else {
        users.forEach((user) => {
          if ([ROLE.PARTNER].includes(user.role?.roleName as ROLE)) {
            throw new BadRequestException('Không thể thêm partner vào team');
          }
        });
      }

      const teamMembers = createTeamDto.teamMembers.map((member) =>
        manager.create(TeamMember, {
          user: { id: member.userId },
          role: member.role,
          team: team,
        }),
      );
      await manager.save(teamMembers);
      const newTeam = await manager.findOne(Team, {
        where: { id: team.id },
        relations: ['teamMembers', 'teamMembers.user'],
      });
      return plainToInstance(Team, newTeam, {
        excludeExtraneousValues: true,
      });
    });
  }

  baseGetAllQueryBuilder({ page = 1, limit = 10, search }: QueryTeamDto) {
    const queryBuilder = this.teamRepository
      .createQueryBuilder('teams')
      .loadRelationCountAndMap('teams.totalMember', 'teams.teamMembers')
      .leftJoinAndSelect(
        'teams.teamMembers',
        'leaderMember',
        `leaderMember.role IN (:...leaderRole)`,
        { leaderRole: [TEAM_MEMBER_ROLE.LEADER, TEAM_MEMBER_ROLE.VICE_LEADER] },
      )
      .leftJoinAndSelect('leaderMember.user', 'leaderUser')
      .orderBy('teams.createdAt', 'DESC')
      .skip((Number(page) - 1) * Number(limit))
      .take(Number(limit));
    if (search) {
      queryBuilder.andWhere(`LOWER(teams.name) LIKE LOWER(:search)`, {
        search: `%${search}%`,
      });
    }

    return queryBuilder;
  }

  async findWithPagination(params: QueryTeamDto) {
    const queryBuilder = this.baseGetAllQueryBuilder(params);

    const [teams, total] = await queryBuilder.getManyAndCount();

    const result = teams.map((team: Team & { totalMember: number }) => {
      return {
        ...plainToInstance(Team, team, {
          excludeExtraneousValues: true,
        }),
        totalMember: team.totalMember,
        teamLeaders: team.teamMembers,
        teamMembers: undefined,
      };
    });

    return {
      data: result,
      total,
      limit: params.limit,
      page: params.page,
    };
  }

  async findMyTeams(params: QueryTeamDto & { userId: number }) {
    const { userId, ...rest } = params;
    const queryBuilder = this.baseGetAllQueryBuilder(rest);
    queryBuilder.andWhere('leaderUser.id = :userId', { userId });
    const [teams, total] = await queryBuilder.getManyAndCount();
    return {
      data: teams,
      total,
    };
  }

  async findOne(id: number) {
    const team = await this.teamRepository
      .createQueryBuilder('team')
      .leftJoinAndSelect('team.teamMembers', 'teamMember')
      .leftJoinAndSelect('teamMember.user', 'user')
      .leftJoinAndSelect(
        'user.fileRelations',
        'avatarRelation',
        'avatarRelation.relatedType = :avatarType',
        { avatarType: FILE_RELATION_TYPE.USER_AVATAR },
      )
      .leftJoinAndSelect('avatarRelation.file', 'avatarFile')
      .where('team.id = :id', { id })
      .getOne();
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return {
      data: plainToInstance(Team, team, {
        excludeExtraneousValues: true,
      }),
    };
  }

  async addMember(id: number, data: AddMemberToTeamDto, currentUser: User) {
    return this.executeInTransaction(async (queryRunner, manager) => {
      const team = await manager.findOne(Team, {
        where: { id },
      });
      if (!team) {
        throw new NotFoundException('Team not found');
      }
      const user = await manager.findOne(User, {
        where: { id: currentUser.id },
        relations: ['role'],
      });

      if (!this.editTeamRoles.includes(user?.role?.roleName as ROLE)) {
        throw new ForbiddenException(
          'Bạn không có quyền thêm thành viên vào team',
        );
      }

      const userIds = data.teamMembers.map((m) => m.userId);

      const isMemberHasOtherTeam = await this.checkMemberHasOtherTeam(
        userIds,
        manager,
      );
      if (isMemberHasOtherTeam) {
        throw new BadRequestException('User đã tồn tại trong team khác');
      }

      const users = await manager.find(User, {
        where: { id: In(userIds) },
        relations: ['role'],
      });

      if (users.length !== userIds.length) {
        throw new BadRequestException('Một số user không hợp lệ');
      } else {
        users.forEach((user) => {
          if ([ROLE.PARTNER].includes(user.role?.roleName as ROLE)) {
            throw new BadRequestException('Không thể thêm partner vào team');
          }
        });
      }

      const existingTeamMembers = await manager.find(TeamMember, {
        where: { team: { id }, user: { id: In(userIds) } },
      });
      if (existingTeamMembers.length > 0) {
        throw new BadRequestException('Một số user đã tồn tại trong team');
      }

      const promises = data.teamMembers.map(async (member) => {
        const teamMember = manager.create(TeamMember, {
          user: { id: member.userId },
          role: member.role,
          team: team,
          joinAt: new Date(),
        });
        await manager.save(teamMember);
        // them domain cua user vao team moi. để team mới quản lí
        const userDomains = await manager.find(UserDomain, {
          where: { user: { id: member.userId } },
        });
        const domainIds = userDomains.map((d) => d.domainId);
        await manager.update(Domain, { id: In(domainIds) }, { teamId: id });
        return teamMember;
      });

      await Promise.all(promises);

      return {
        success: true,
        message: 'Thêm thành viên vào team thành công',
      };
    });
  }

  async checkMemberHasOtherTeam(userIds: number[], manager: EntityManager) {
    const teamMembers = await manager.find(TeamMember, {
      where: { user: { id: In(userIds) }, deletedAt: IsNull() },
    });
    return teamMembers.length > 0;
  }

  async update(id: number, data: UpdateTeamDto, currentUser: User) {
    return this.executeInTransaction(async (queryRunner, manager) => {
      const team = await manager.findOne(Team, {
        where: { id },
      });

      if (!team) {
        throw new NotFoundException('Team not found');
      }

      const user = await manager.findOne(User, {
        where: { id: currentUser.id },
        relations: ['role'],
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!this.editTeamRoles.includes(user?.role?.roleName as ROLE)) {
        throw new ForbiddenException('Bạn không có quyền cập nhật team');
      }
      const updatedTeam = manager.merge(Team, team, {
        name: data.name,
        description: data.description,
        telegramId: data.telegramId,
      });

      const savedTeam = await manager.save(updatedTeam);

      return {
        data: savedTeam,
      };
    });
  }

  remove(id: number, currentUser: User) {
    // return this.executeInTransaction(async (queryRunner, manager) => {
    //   const team = await manager.findOne(Team, {
    //     where: { id },
    //   });

    //   if (!team) {
    //     throw new NotFoundException('Team not found');
    //   }
    //   const user = await manager.findOne(User, {
    //     where: { id: currentUser.id },
    //     relations: ['role'],
    //   });

    //   if (!this.editTeamRoles.includes(user?.role?.roleName as ROLE)) {
    //     throw new ForbiddenException('Bạn không có quyền xóa team');
    //   }

    //   // set domain teamId = null
    //   await manager.update(Domain, { teamId: id }, { teamId: null });

    //   await manager.delete(TeamMember, { team: { id } });

    //   await manager.delete(Team, id);

    //   return {
    //     success: true,
    //     message: 'Team deleted successfully',
    //   };
    // });
    throw new Error('Tính năng chưa sẵn sàng!');
  }

  async removeMember(id: number, memberId: number, currentUser: User) {
    return this.executeInTransaction(async (queryRunner, manager) => {
      const team = await manager.findOne(Team, {
        where: { id },
      });

      if (!team) {
        throw new NotFoundException('Team không tồn tại');
      }

      const user = await manager.findOne(User, {
        where: { id: currentUser.id },
        relations: ['role'],
      });

      if (!this.editTeamRoles.includes(user?.role?.roleName as ROLE)) {
        throw new ForbiddenException(
          'Bạn không có quyền xóa thành viên khỏi team',
        );
      }

      await manager.delete(TeamMember, {
        team: { id },
        user: { id: memberId },
      });

      // neesu user sở hữu domain thì. xóa doamin đó khỏi team này để khi vào team mới mang theo
      const userDomains = await manager.find(UserDomain, {
        where: { user: { id: memberId }, domain: { teamId: id } },
      });

      const domainIds = userDomains.map((d) => d.domainId);

      await manager.update(
        Domain,
        { teamId: id, id: In(domainIds) },
        { teamId: null },
      );

      return {
        success: true,
        message: 'Xóa thành viên khỏi team thành công',
      };
    });
  }
}
