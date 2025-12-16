import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { CreateClientUserDto } from 'src/auth/dto/create-client-user.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (!user) {
      throw new UnauthorizedException('Tài khoản không chính xác');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Mật khẩu không chính xác');
    }

    return user;
  }

  async login(body: { username: string; password: string }) {
    const { username, password } = body;
    // Tạm coi username là email để tương thích với DTO cũ
    const user = await this.validateUser(username, password);
    const payload = {
      sub: user.id,
      email: user.email,
    };

    return {
      data: user,
      access_token: this.jwtService.sign(payload),
    };
  }

  async resetPassword({
    username,
    newPassword,
  }: {
    username: string;
    newPassword: string;
    requesterId: number;
  }) {
    const user = await this.userRepository.findOne({
      where: { email: username },
    });
    if (!user) {
      throw new BadRequestException('Tài khoản không tồn tại');
    }
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(user.id, {
      passwordHash: newPasswordHash,
    });
    return {
      message: 'Mật khẩu đã được cập nhật thành công',
    };
  }

  async createUser(createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  async createPartner(createUserDto: CreateClientUserDto) {
    const dto: CreateUserDto = {
      email: createUserDto.email,
      password: createUserDto.password,
      status: undefined,
    };
    return this.userService.create(dto);
  }

  async getMe(requester: User) {
    const user = await this.userService.findOne(requester?.id);
    return plainToInstance(User, user, {
      excludeExtraneousValues: true,
    });
  }
}
