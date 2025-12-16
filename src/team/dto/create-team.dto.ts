import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { TEAM_MEMBER_ROLE } from 'src/shared/constants/team.constant';
import { TeamMember } from 'src/team-member/entities/team-member.entity';

export class CreateTeamDto {
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

export class TeamMemberDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ example: TEAM_MEMBER_ROLE.MEMBER })
  @IsEnum(TEAM_MEMBER_ROLE)
  @IsNotEmpty()
  role: TEAM_MEMBER_ROLE;
}
