import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { CreateClientUserDto } from 'src/auth/dto/create-client-user.dto';
import { Customer } from 'src/customer/entities/customer.entity';
import { Role } from 'src/role/entities/role.entity';
import { USER_ROLE } from 'src/role/role.constant';
import { Sales, SALES_STATUS } from 'src/sales/entities/sales.entity';
import { USER_STATUS } from 'src/shared/constants/user.constant';
import { AbstractTransactionService } from 'src/shared/services/abstract-transaction.service';
import { UserRole } from 'src/user-role/entities/user-role.entity';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class AuthService extends AbstractTransactionService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    @InjectDataSource()
    dataSource: DataSource,
  ) {
    super(dataSource);
  }

  /**
   * Định nghĩa thứ bậc quyền (số càng nhỏ quyền càng cao).
   */
  private getRolePriority(role: USER_ROLE): number {
    switch (role) {
      case USER_ROLE.SUPER_ADMIN:
        return 1;
      case USER_ROLE.MANAGER:
        return 2;
      case USER_ROLE.SALES:
        return 3;
      case USER_ROLE.CUSTOMER:
        return 4;
      default:
        return 999;
    }
  }

  /**
   * SUPER_ADMIN được gán mọi role.
   * Các role khác chỉ được gán role có cấp thấp hơn hoặc bằng chính mình.
   */
  private canAssignRole(
    requesterRoles: USER_ROLE[],
    targetRole: USER_ROLE,
  ): boolean {
    if (requesterRoles.includes(USER_ROLE.SUPER_ADMIN)) {
      return true;
    }

    if (!requesterRoles.length) return false;

    const requesterBestPriority = Math.min(
      ...requesterRoles.map((r) => this.getRolePriority(r)),
    );
    const targetPriority = this.getRolePriority(targetRole);

    // Chỉ cho gán role có priority lớn hơn hoặc bằng (tức là cấp thấp hơn hoặc ngang bằng)
    return targetPriority >= requesterBestPriority;
  }

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

  async login(body: { email: string; password: string }) {
    const { email, password } = body;
    const user = await this.validateUser(email, password);
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
    requesterId,
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

  async createClientUser(dto: CreateClientUserDto, requester: User) {
    return this.executeInTransaction(async (queryRunner, manager) => {
      // 1. Get role from roleId
      const role = await manager.findOne(Role, {
        where: { id: dto.roleId },
      });

      if (!role) {
        throw new NotFoundException('Role not found');
      }

      // Lấy danh sách role hiện tại của người tạo
      const requesterUserRoles = await manager.find(UserRole, {
        where: { userId: requester.id },
        relations: ['role'],
      });

      if (!requesterUserRoles.length) {
        throw new ForbiddenException('Requester has no role assigned');
      }

      const requesterRoleNames = requesterUserRoles
        .map((ur) => ur.role?.roleName)
        .filter((r): r is USER_ROLE => !!r);

      // check duplicate
      const duplicateUser = await manager.findOne(User, {
        where: { email: dto.email },
      });
      if (duplicateUser) {
        throw new BadRequestException('Email đã tồn tại');
      }

      const roleName = role.roleName;

      // Kiểm tra xem requester có được phép gán role này hay không
      if (!this.canAssignRole(requesterRoleNames, roleName)) {
        throw new ForbiddenException(
          'You are not allowed to assign this role to a new user',
        );
      }

      // 2. Tạo User
      const user = await manager.save(User, {
        email: dto.email,
        password: dto.password,
        status: USER_STATUS.ACTIVE,
        createdBy: requester.id,
      });

      // 3. Tạo UserRole
      await manager.save(UserRole, {
        userId: user.id,
        roleId: dto.roleId,
      });

      // 4. Tạo thông tin bổ sung theo role
      if (roleName === USER_ROLE.CUSTOMER) {
        if (!dto.fullName || !dto.phone) {
          throw new BadRequestException(
            'fullName and phone are required for CUSTOMER role',
          );
        }
        await manager.save(Customer, {
          userId: user.id,
          fullName: dto.fullName,
          phone: dto.phone,
          saleId: requester.id,
        });
      }

      if (roleName === USER_ROLE.SALES) {
        if (!dto.commissionPercent || !dto.salesFullName) {
          throw new BadRequestException(
            'commissionPercent and salesFullName are required for SALES role',
          );
        }
        await manager.save(Sales, {
          userId: user.id,
          commissionPercent: dto.commissionPercent,
          status: SALES_STATUS.ACTIVE,
          fullName: dto.salesFullName,
          bankName: dto.bankName,
          bankNumber: dto.bankNumber,
          phone: dto.salesPhone,
        });
      }

      return user;
    });
  }

  async getMe(requester: User) {
    const user = await this.userRepository.findOne({
      where: { id: requester?.id },
      relations: ['userRoles.role'],
    });
    return user;
  }
}
