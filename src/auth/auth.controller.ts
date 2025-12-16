import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CreateClientUserDto } from 'src/auth/dto/create-client-user.dto';
import { ResetPasswordDto } from 'src/auth/dto/reset-password-dto.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/user/entities/user.entity';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  @ApiOperation({ summary: 'Create a new client user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async createUser(@Body() createUserDto: CreateClientUserDto) {
    const newUser = await this.authService.createPartner(createUserDto);
    return { data: newUser };
  }

  @Post('/login')
  @ApiOperation({ summary: 'Login to get access token' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('/disavow/login')
  @ApiOperation({ summary: 'Disavow login to get access token' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async disavowLogin(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('/reset-password')
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
