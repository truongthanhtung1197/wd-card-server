import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { USER_ROLE } from 'src/role/role.constant';
import { User } from 'src/user/entities/user.entity';
import { UserRoleService } from 'src/user-role/user-role.service';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@ApiTags('Users')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userRoleService: UserRoleService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return { data: user };
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  async findAll(@Query() query: QueryUserDto) {
    return await this.userService.findWithPagination({ ...query });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User detail' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(+id);
    return { data: user };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ) {
    // Get current user roles with role relation
    const userRoles = await this.userRoleService.findAll({ page: 1, limit: 100 });
    const currentUserRoles = userRoles.items
      .filter((ur: any) => ur.userId === currentUser.id)
      .map((ur: any) => ur.role?.roleName)
      .filter((roleName): roleName is USER_ROLE => roleName !== undefined);

    const user = await this.userService.update(
      +id,
      updateUserDto,
      currentUserRoles,
    );
    return { data: user };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID' })
  async delete(@Param('id') id: string) {
    return await this.userService.remove(+id);
  }
}
