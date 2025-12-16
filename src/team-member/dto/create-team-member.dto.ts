import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { TEAM_MEMBER_ROLE } from 'src/shared/constants/team.constant';

export class CreateTeamMemberDto {
  @ApiProperty({ example: 'Team ID' })
  @IsNumber()
  @IsNotEmpty()
  teamId: number;

  @ApiProperty({ example: 'Team Member Role' })
  @IsEnum(TEAM_MEMBER_ROLE)
  @IsNotEmpty()
  role: TEAM_MEMBER_ROLE;

  @ApiProperty({ example: 'Team Member User ID' })
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
