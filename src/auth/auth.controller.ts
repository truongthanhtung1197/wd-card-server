import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CreateClientUserDto } from 'src/auth/dto/create-client-user.dto';
import { ResetPasswordDto } from 'src/auth/dto/reset-password-dto.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Public } from 'src/decorators/is-public';
import { USER_ROLE } from 'src/role/role.constant';
import { User } from 'src/user/entities/user.entity';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(RolesGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  @Roles(USER_ROLE.SUPER_ADMIN, USER_ROLE.MANAGER, USER_ROLE.SALES)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Create a new user with role' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async createUser(
    @Body() createUserDto: CreateClientUserDto,
    @CurrentUser() requester: User,
  ) {
    const newUser = await this.authService.createClientUser(
      createUserDto,
      requester,
    );
    return { data: newUser };
  }

  @Public()
  @Post('/login')
  @ApiOperation({ summary: 'Login to get access token' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('/reset-password')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({ status: 200, description: 'Reset password successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @CurrentUser() user: User,
  ) {
    return this.authService.resetPassword({
      ...resetPasswordDto,
      requesterId: user.id,
    });
  }

  @ApiBearerAuth('jwt')
  @Get('/me')
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({
    status: 200,
    description: 'Current user retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@CurrentUser() user: User) {
    return await this.authService.getMe(user);
  }
}
