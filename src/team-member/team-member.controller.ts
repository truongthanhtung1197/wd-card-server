import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateTeamMemberDto } from 'src/team-member/dto/create-team-member.dto';
import { QueryTeamMemberDto } from 'src/team-member/dto/query-team-member.dto';
import {
  RemoveTeamMemberDto,
  UpdateTeamMemberDto,
} from 'src/team-member/dto/update-team-member.dto';
import { TeamMemberService } from 'src/team-member/team-member.service';
import { User } from 'src/user/entities/user.entity';

@ApiTags('Team Members')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('team-members')
export class TeamMemberController {
  constructor(private readonly teamMemberService: TeamMemberService) {}
  @Post()
  @ApiOperation({ summary: 'Create a new team' })
  @ApiResponse({ status: 201, description: 'Team created successfully' })
  async create(
    @Body() createTeamMemberDto: CreateTeamMemberDto,
    @CurrentUser() user: User,
  ) {
    return await this.teamMemberService.create(createTeamMemberDto, user);
  }
  @Get()
  @ApiOperation({ summary: 'Get all team members' })
  @ApiResponse({ status: 200, description: 'List of team members' })
  async findAll(@Query() query: QueryTeamMemberDto) {
    return await this.teamMemberService.findWithPagination({ ...query });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update team by ID' })
  async update(
    @Param('id') id: string,
    @Body() updateTeamMemberDto: UpdateTeamMemberDto,
    @CurrentUser() user: User,
  ) {
    return await this.teamMemberService.update(+id, updateTeamMemberDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete team by ID' })
  async delete(
    @Param('id') id: string,
    @Body() removeTeamMemberDto: RemoveTeamMemberDto,
    @CurrentUser() user: User,
  ) {
    return await this.teamMemberService.remove(+id, removeTeamMemberDto, user);
  }
}
