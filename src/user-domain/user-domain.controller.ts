import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { CreateUserDomainDto } from 'src/user-domain/dto/create-user-domain.dto';
import { GetUserDomainsDto } from 'src/user-domain/dto/query-user-domain.dto';
import { UserDomainService } from 'src/user-domain/user-domain.service';
import { User } from 'src/user/entities/user.entity';

@ApiTags('User Domains')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('user-domains')
export class UserDomainController {
  constructor(private readonly userDomainService: UserDomainService) {}
  @Post('assign-domain')
  @ApiOperation({ summary: 'Gán domain cho user' })
  @ApiResponse({ status: 201, description: 'Gán domain cho user thành công' })
  async createUserDomain(
    @Body() createUserDomainDto: CreateUserDomainDto,
    @CurrentUser() user: User,
  ) {
    return await this.userDomainService.createUserDomain(
      createUserDomainDto,
      user.id,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all user domains' })
  @ApiResponse({ status: 200, description: 'List of user domains' })
  async findAll(@Query() query: GetUserDomainsDto) {
    return await this.userDomainService.findWithPagination({ ...query });
  }

  // @Patch(':id')
  // @ApiOperation({ summary: 'Update team by ID' })
  // async update(
  //   @Param('id') id: string,
  //   @Body() updateTeamMemberDto: UpdateTeamMemberDto,
  //   @CurrentUser() user: User,
  // ) {
  //   return await this.teamMemberService.update(+id, updateTeamMemberDto, user);
  // }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user domain by ID' })
  async delete(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.userDomainService.remove(+id, user);
  }
}
