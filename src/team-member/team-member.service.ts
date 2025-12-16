import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { ROLE } from 'src/role/role.constant';
import { AbstractTransactionService } from 'src/shared/services/abstract-transaction.service';
import { CreateTeamMemberDto } from 'src/team-member/dto/create-team-member.dto';
import { QueryTeamMemberDto } from 'src/team-member/dto/query-team-member.dto';
import {
  RemoveTeamMemberDto,
  UpdateTeamMemberDto,
} from 'src/team-member/dto/update-team-member.dto';
import { TeamMember } from 'src/team-member/entities/team-member.entity';
import { Team } from 'src/team/entities/team.entity';
import { User } from 'src/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class TeamMemberService extends AbstractTransactionService {
  private readonly editTeamMemberRoles = [ROLE.MANAGER, ROLE.SUPER_ADMIN];

  constructor(
    @InjectDataSource() dataSource: DataSource,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(TeamMember)
    private teamMemberRepository: Repository<TeamMember>,
  ) {
    super(dataSource);
  }
  async findWithPagination({
    page = 1,
    limit = 10,
    search,
    teamId,
    sortBy = 'createdAt',
    sortOrder = 'DESC',
  }: QueryTeamMemberDto) {
    const queryBuilder = this.teamMemberRepository
      .createQueryBuilder('team_members')
      .leftJoinAndSelect('team_members.user', 'user')
      .leftJoinAndSelect('team_members.team', 'team')
      .where('team_members.team_id = :teamId', { teamId })
      .orderBy(`team_members.${sortBy}`, sortOrder)
      .skip((Number(page) - 1) * Number(limit))
      .take(Number(limit));

    if (search) {
      queryBuilder.andWhere(`LOWER(user.username) LIKE LOWER(:search)`, {
        search: `%${search}%`,
      });
    }
    const [data, total] = await queryBuilder.getManyAndCount();
    const _data = plainToInstance(TeamMember, data);
    return {
      data: _data,
      total,
      limit: Number(limit),
      page: Number(page),
    };
  }

  async create(createTeamMemberDto: CreateTeamMemberDto, currentUser: User) {
    return this.executeInTransaction(async (queryRunner, manager) => {
      const user = await manager.findOne(User, {
        where: { id: currentUser.id },
        relations: ['role'],
      });
      if (!this.editTeamMemberRoles.includes(user?.role?.roleName as ROLE)) {
        throw new ForbiddenException(
          'Bạn không có quyền thêm thành viên vào team',
        );
      }

      const teamMember = await manager.findOne(TeamMember, {
        where: {
          team: { id: createTeamMemberDto.teamId },
          user: { id: createTeamMemberDto.userId },
        },
      });

      if (teamMember) {
        throw new BadRequestException('Thành viên đã tồn tại trong team');
      }

      const team = await manager.findOne(Team, {
        where: { id: createTeamMemberDto.teamId },
      });

      if (!team) {
        throw new NotFoundException('Team không tồn tại');
      }

      const newTeamMember = manager.create(TeamMember, createTeamMemberDto);
      return await manager.save(newTeamMember);
    });
  }

  async update(
    id: number,
    updateTeamMemberDto: UpdateTeamMemberDto,
    currentUser: User,
  ) {
    return this.executeInTransaction(async (queryRunner, manager) => {
      const user = await manager.findOne(User, {
        where: { id: currentUser.id },
        relations: ['role'],
      });
      if (!this.editTeamMemberRoles.includes(user?.role?.roleName as ROLE)) {
        throw new ForbiddenException(
          'Bạn không có quyền cập nhật thành viên trong team',
        );
      }

      const teamMember = await manager.findOne(TeamMember, {
        where: { id },
      });

      if (!teamMember) {
        throw new NotFoundException('Thành viên trong team không tồn tại');
      }

      manager.merge(TeamMember, teamMember, {
        role: updateTeamMemberDto.role,
      });
      return await manager.save(teamMember);
    });
  }

  async remove(
    id: number,
    removeTeamMemberDto: RemoveTeamMemberDto,
    currentUser: User,
  ) {
    return this.executeInTransaction(async (queryRunner, manager) => {
      const user = await manager.findOne(User, {
        where: { id: currentUser.id },
        relations: ['role'],
      });
      if (!this.editTeamMemberRoles.includes(user?.role?.roleName as ROLE)) {
        throw new ForbiddenException(
          'Bạn không có quyền xóa thành viên trong team',
        );
      }

      const team = await manager.findOne(Team, {
        where: { id: removeTeamMemberDto.teamId },
      });

      if (!team) {
        throw new NotFoundException('Team không tồn tại');
      }

      return await manager.delete(TeamMember, {
        id,
        team: { id: removeTeamMemberDto.teamId },
      });
    });
  }
}
