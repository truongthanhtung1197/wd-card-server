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
import { QueryTeamDto } from 'src/team/dto/query-team.dto';
import {
  AddMemberToTeamDto,
  UpdateTeamDto,
} from 'src/team/dto/update-team.dto';
import { User } from 'src/user/entities/user.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { TeamService } from './team.service';

@ApiTags('Teams')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new team' })
  @ApiResponse({ status: 201, description: 'Team created successfully' })
  async create(
    @Body() createTeamDto: CreateTeamDto,
    @CurrentUser() user: User,
  ) {
    return await this.teamService.create(createTeamDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all teams' })
  @ApiResponse({ status: 200, description: 'List of teams' })
  async findAll(@Query() query: QueryTeamDto) {
    return await this.teamService.findWithPagination({ ...query });
  }

  @Get('/lead-by-me')
  @ApiOperation({ summary: 'Get all teams that I lead' })
  @ApiResponse({ status: 200, description: 'List of teams that I lead' })
  async findMyTeams(@Query() query: QueryTeamDto, @CurrentUser() user: User) {
    return await this.teamService.findMyTeams({ ...query, userId: user.id });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get team by ID' })
  @ApiResponse({ status: 200, description: 'Team detail' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  async findOne(@Param('id') id: string) {
    return await this.teamService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update team by ID' })
  async update(
    @Param('id') id: string,
    @Body() updateTeamDto: UpdateTeamDto,
    @CurrentUser() user: User,
  ) {
    return await this.teamService.update(+id, updateTeamDto, user);
  }

  @Patch(':id/add-member')
  @ApiOperation({ summary: 'Add member to team by ID' })
  async addMember(
    @Param('id') id: string,
    @Body() addMemberToTeamDto: AddMemberToTeamDto,
    @CurrentUser() user: User,
  ) {
    return await this.teamService.addMember(+id, addMemberToTeamDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete team by ID' })
  delete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.teamService.remove(+id, user);
  }

  @Delete(':id/remove-member/:memberId')
  @ApiOperation({ summary: 'Remove member from team by ID' })
  async removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: User,
  ) {
    return await this.teamService.removeMember(+id, +memberId, user);
  }
}
