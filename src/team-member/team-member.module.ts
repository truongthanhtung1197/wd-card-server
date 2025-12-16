import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from 'src/team/entities/team.entity';
import { User } from 'src/user/entities/user.entity';
import { TeamMember } from './entities/team-member.entity';
import { TeamMemberController } from './team-member.controller';
import { TeamMemberService } from './team-member.service';

@Module({
  imports: [TypeOrmModule.forFeature([TeamMember, User, Team])],
  controllers: [TeamMemberController],
  providers: [TeamMemberService],
  exports: [TeamMemberService],
})
export class TeamMemberModule {}
