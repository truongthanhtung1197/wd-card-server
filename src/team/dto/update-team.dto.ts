import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { TEAM_MEMBER_ROLE } from 'src/shared/constants/team.constant';
import { TeamMember } from 'src/team-member/entities/team-member.entity';
import { TeamMemberDto } from 'src/team/dto/create-team.dto';
export class UpdateTeamDto {
  @ApiProperty({ example: 'Team Name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Team Description' })
  @IsString()
  @IsOptional()
  description: string;

  @ApiPropertyOptional({
    example: '123456789',
    description: 'Telegram user ID',
  })
  @IsString()
  @IsOptional()
  telegramId?: string;
}

export class AddMemberToTeamDto {
  @ApiPropertyOptional({
    type: [TeamMember],
    example: [
      {
        userId: 1,
        role: TEAM_MEMBER_ROLE.MEMBER,
      },
    ],
  })
  @ValidateNested({ each: true })
  @Type(() => TeamMemberDto)
  teamMembers: TeamMemberDto[];
}
