import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { CreateClientUserDto } from 'src/auth/dto/create-client-user.dto';
import { Role } from 'src/role/entities/role.entity';
import { ROLE } from 'src/role/role.constant';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.userService.findByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      const userDetail = await this.userService.findOne(user.id);
      const { password, ...result } = userDetail;
      return result;
    }

    if (user && !!user.lockedAt) {
      throw new UnauthorizedException('Tài khoản đã bị khoá');
    }
    throw new UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác');
  }

  async login(body: { username: string; password: string }) {
    const { username, password } = body;
    const user = await this.validateUser(username, password);
    const payload = {
      username: user.username,
      sub: user.id,
      roleId: user.roleId,
    };

    return {
      data: user,
      access_token: this.jwtService.sign(payload),
    };
  }

  async resetPassword({
    username,
    newPassword,
    requesterId,
  }: {
    username: string;
    newPassword: string;
    requesterId: number;
  }) {
    const requester = await this.userRepository.findOne({
      where: { id: requesterId },
      relations: ['role'],
    });
    if (requester?.role?.roleName !== ROLE.SUPER_ADMIN) {
      throw new ForbiddenException(
        'Bạn không có quyền thực hiện hành động này',
      );
    }
    const user = await this.userRepository.findOne({
      where: { username },
    });
    if (!user) {
      throw new BadRequestException('Tài khoản không tồn tại');
    }
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(user.id, { password: newPasswordHash });
    return {
      message: 'Mật khẩu đã được cập nhật thành công',
    };
  }

  async createUser(createUserDto: CreateUserDto) {
    const newUser = await this.userService.createClientUser(createUserDto);
    return newUser;
  }

  async createPartner(createUserDto: CreateClientUserDto) {
    const partnerRole = await this.roleRepository.findOneBy({
      roleName: ROLE.PARTNER,
    });

    if (!partnerRole) {
      throw new BadRequestException('Thao tác thất bại');
    }

    const newUser = await this.userService.createClientUser({
      ...createUserDto,
      roleId: partnerRole.id,
    });
    return newUser;
  }

  async getMe(requester: User) {
    const user = await this.userService.findOne(requester?.id);
    return plainToInstance(User, user, {
      excludeExtraneousValues: true,
    });
  }
}
