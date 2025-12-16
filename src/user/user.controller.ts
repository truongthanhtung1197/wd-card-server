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
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import {
  BlockUserDto,
  ChangePasswordDto,
  UpdateUserDto,
} from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@ApiTags('Users')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() user: User,
  ) {
    const newUser = await this.userService.create(createUserDto, user);
    return { data: newUser };
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

  @Get('partner/pending-payment')
  @ApiOperation({ summary: 'Get pending payment' })
  @ApiResponse({ status: 200, description: 'Pending payment' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getPendingPayment(@CurrentUser() user: User) {
    return await this.userService.getPendingPayment(user.id);
  }

  @Patch('change-password')
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 403, description: 'User not found' })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() user: User,
  ) {
    return await this.userService.changePassword(user.id, changePasswordDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: User,
  ) {
    return await this.userService.update(+id, updateUserDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID' })
  async delete(@Param('id') id: string, @CurrentUser() user: User) {
    const data = await this.userService.remove(+id, user);
    return { success: true, data };
  }

  @Delete('/partner/:id')
  @ApiOperation({ summary: 'Delete partner by ID' })
  async deletePartner(@Param('id') id: string) {
    return await this.userService.deletePartner(+id);
  }

  @Patch('block')
  @ApiOperation({ summary: 'Block user by ID' })
  @ApiResponse({ status: 200, description: 'User blocked successfully' })
  @ApiResponse({ status: 403, description: 'User not found' })
  async blockUser(
    @Body() blockUserDto: BlockUserDto,
    @CurrentUser() user: User,
  ) {
    return await this.userService.handleBlockUser(blockUserDto, user);
  }
}
