import { Expose } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { BaseEntity } from 'src/shared/baseEntity.entity';
import { TEAM_MEMBER_ROLE } from 'src/shared/constants/team.constant';
import { Team } from 'src/team/entities/team.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('team_members')
export class TeamMember extends BaseEntity {
  @Expose()
  @IsEnum(TEAM_MEMBER_ROLE)
  @Column({ nullable: false, type: 'enum', enum: TEAM_MEMBER_ROLE })
  role: TEAM_MEMBER_ROLE;

  @Expose()
  @Column({ nullable: false, type: 'bigint', name: 'team_id' })
  teamId: number;

  @Expose()
  @Column({ nullable: false, type: 'bigint', name: 'user_id' })
  userId: number;

  @Expose()
  @Column({ nullable: false, type: 'datetime', name: 'join_at' })
  joinAt: Date;

  @Expose()
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Expose()
  @ManyToOne(() => Team, (team) => team.id)
  @JoinColumn({ name: 'team_id' })
  team: Team;
}
