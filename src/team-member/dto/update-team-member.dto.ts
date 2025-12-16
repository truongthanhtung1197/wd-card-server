import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { TEAM_MEMBER_ROLE } from 'src/shared/constants/team.constant';

export class UpdateTeamMemberDto {
  @ApiProperty({ example: 'Team Member Role' })
  @IsEnum(TEAM_MEMBER_ROLE)
  @IsNotEmpty()
  role: TEAM_MEMBER_ROLE;
}

export class RemoveTeamMemberDto {
  @ApiProperty({ example: 'Team ID' })
  @IsNumber()
  @IsNotEmpty()
  teamId: number;
}
