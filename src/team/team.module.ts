import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamMember } from 'src/team-member/entities/team-member.entity';
import { User } from 'src/user/entities/user.entity';
import { Team } from './entities/team.entity';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';

@Module({
  imports: [TypeOrmModule.forFeature([Team, User, TeamMember])],
  controllers: [TeamController],
  providers: [TeamService],
  exports: [TeamService],
})
export class TeamModule {}
