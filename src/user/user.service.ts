import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { CartDetail } from 'src/cart-detail/entities/cart-detail.entity';
import { Domain } from 'src/domain/entities/domain.entity';
import { FileRelation } from 'src/file-relation/entities/file-relation.entity';
import { File } from 'src/file/entities/file.entity';
import { Order } from 'src/order/entities/order.entity';
import { Role } from 'src/role/entities/role.entity';
import { ROLE } from 'src/role/role.constant';
import { Service } from 'src/service/entities/service.entity';
import { FILE_RELATION_TYPE } from 'src/shared/constants/file.constant';
import {
  ORDER_STATUS,
  ORDER_STATUS_LALID,
} from 'src/shared/constants/order.constant';
import { AbstractTransactionService } from 'src/shared/services/abstract-transaction.service';
import {
  BlockUserDto,
  ChangePasswordDto,
  UpdateUserDto,
} from 'src/user/dto/update-user.dto';
import { DataSource, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { User } from './entities/user.entity';
@Injectable()
export class UserService extends AbstractTransactionService {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Domain)
    private domainRepository: Repository<Domain>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
  ) {
    super(dataSource);
  }

  async findWithPagination({
    page = 1,
    limit = 10,
    search,
    role,
    sortBy = 'createdAt',
    sortOrder = 'DESC',
  }: QueryUserDto) {
    const queryBuilder = this.userRepository
      .createQueryBuilder('users')
      .leftJoinAndSelect(
        'users.fileRelations',
        'fileRelations',
        'fileRelations.relatedType = :type AND fileRelations.relatedId = users.id',
        {
          type: FILE_RELATION_TYPE.USER_AVATAR,
        },
      )
      .leftJoinAndSelect('fileRelations.file', 'file')
      .leftJoinAndSelect('users.role', 'role')
      .addSelect('role.role_name', 'role_name')
      .orderBy(`users.${sortBy}`, sortOrder)
      .skip((Number(page) - 1) * Number(limit))
      .take(Number(limit));

    if (search) {
      queryBuilder.andWhere(
        `LOWER(users.username) LIKE LOWER(:search)
          OR LOWER(users.email) LIKE LOWER(:search)
          OR LOWER(users.displayName) LIKE LOWER(:search)
          OR LOWER(users.telegramUsername) LIKE LOWER(:search)`,
        {
          search: `%${search}%`,
        },
      );
    }

    if (role && role.length > 0) {
      queryBuilder.andWhere('role.role_name IN (:...roles)', {
        roles: role,
      });
    }

    const [users, count] = await queryBuilder.getManyAndCount();

    return {
      data: users,
      total: count,
      limit: Number(limit),
      page: Number(page),
    };
  }

  async findOne(id: number) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect(
        'user.fileRelations',
        'fileRelations',
        'fileRelations.relatedType = :type AND fileRelations.relatedId = user.id',
        {
          type: FILE_RELATION_TYPE.USER_AVATAR,
        },
      )
      .leftJoinAndSelect('fileRelations.file', 'file')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.id = :id', { id })
      .getOne();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const qb = this.domainRepository.createQueryBuilder('domain');
    const res = await qb
      .select(
        `
        SUM(
          CAST(COALESCE(domain.budget, 0) AS DECIMAL(18,2))
        )
      `,
        'total',
      )
      .where(
        `
        EXISTS (
          SELECT 1
          FROM user_domains ud
          WHERE ud.domain_id = domain.id
            AND ud.user_id = :userId
        )
      `,
        { userId: id },
      )
      .getRawOne<{ total: string | null }>();

    const totalBudget = Number(res?.total) || 0;

    const statistic = {
      totalService: 0,
      totalAmountReceived: 0,
      amountOfMoneySeoerSpent: 0,
    };

    if (user?.role?.roleName === ROLE.PARTNER) {
      // change code to promires all
      const [totalAmountReceived, totalService] = await Promise.all([
        this.orderRepository
          .createQueryBuilder('order')
          .select(
            `
              SUM(
                CAST(COALESCE(order.price, 0) AS DECIMAL(18,2))
                - CAST(COALESCE(order.discount, 0) AS DECIMAL(18,2))
                + CAST(COALESCE(order.priceAdjustment, 0) AS DECIMAL(18,2))
              )
              `,
            'total',
          )
          .where(
            `
              EXISTS (
                SELECT 1
                FROM services s
                WHERE s.id = order.service_id
                  AND s.user_id = :userId
              )
            `,
            { userId: id },
          )
          .andWhere('order.status IN (:...status)', {
            status: [ORDER_STATUS.PAID_BY_MANAGER],
          })
          .getRawOne<{ total: string | null }>(),
        this.serviceRepository
          .createQueryBuilder('service')
          .innerJoin('service.user', 'user')
          .where('user.id = :id', { id })
          .getCount(),
      ]);
      statistic.totalService = totalService;

      statistic.totalAmountReceived = Number(totalAmountReceived?.total || 0);
    }
    if (user?.role?.roleName === ROLE.SEOER) {
      const amountOfMoneySeoerSpent = await this.orderRepository
        .createQueryBuilder('order')
        .select(
          `
            SUM(
              CAST(COALESCE(order.price, 0) AS DECIMAL(18,2))
              - CAST(COALESCE(order.discount, 0) AS DECIMAL(18,2))
              + CAST(COALESCE(order.priceAdjustment, 0) AS DECIMAL(18,2))
            )
            `,
          'total',
        )
        .where('order.userId = :userId', { userId: id })
        .andWhere('order.status IN (:...status)', {
          status: ORDER_STATUS_LALID,
        })
        .getRawOne();

      statistic.amountOfMoneySeoerSpent = Number(
        amountOfMoneySeoerSpent?.total || 0,
      );
    }
    return {
      ...user,
      totalBudget: totalBudget,
      statistic: statistic,
    };
  }

  async findByUsername(username: string) {
    const user = await this.userRepository.findOneBy({ username });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
  async findByEmail(email: string) {
    return this.userRepository.findOneBy({ email });
  }

  async create(createUserDto: CreateUserDto, currentUser: User) {
    const currentUserPriority = currentUser.roleId;
    const targetRolePriority = createUserDto.roleId;

    if (targetRolePriority <= currentUserPriority) {
      throw new ForbiddenException(
        'Bạn không thể tạo tài khoản với quyền cao hơn hoặc ngang bằng bạn.',
      );
    }

    const { username } = createUserDto;
    const user = await this.userRepository.findOne({
      where: { username },
      withDeleted: true,
    });

    if (user) {
      throw new BadRequestException(
        'Tài khoản đã tồn tại, vui lòng kiểm tra lại.',
      );
    }

    const newUser = this.userRepository.create(createUserDto);
    newUser.password = await bcrypt.hash(newUser.password, 10);
    return this.userRepository.save(newUser);
  }

  async createClientUser(createUserDto: CreateUserDto) {
    const { username, email, telegramUsername, phone } = createUserDto;
    const user = await this.userRepository.findOne({
      where: { username },
      withDeleted: true,
    });

    if (user) {
      throw new BadRequestException('Tài khoản đã tồn tại');
    }

    const userEmail = await this.userRepository.findOne({
      where: { email },
    });
    if (userEmail) {
      throw new BadRequestException('Email đã tồn tại');
    }

    const userTelegramUsername = await this.userRepository.findOneBy({
      telegramUsername,
    });
    if (userTelegramUsername) {
      throw new BadRequestException('Username Telegram đã tồn tại');
    }

    const userPhone = await this.userRepository.findOneBy({ phone });
    if (userPhone) {
      throw new BadRequestException('Số điện thoại đã tồn tại');
    }

    const newUser = this.userRepository.create(createUserDto);
    newUser.password = await bcrypt.hash(newUser.password, 10);
    return this.userRepository.save(newUser);
  }

  async update(id: number, data: UpdateUserDto, currentUser: User) {
    return this.executeInTransaction(async (queryRunner, manager) => {
      const user = await manager.findOne(User, {
        where: { id },
        relations: ['role'],
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const requesterUser = await manager.findOne(User, {
        where: { id: currentUser.id },
        relations: ['role'],
      });

      if (data?.roleId) {
        const role = await manager.findOne(Role, {
          where: { id: data?.roleId },
        });
        if (!role) {
          throw new NotFoundException('Role not found');
        }

        if (user?.roleId !== role?.id) {
          if (role?.roleName === ROLE.SUPER_ADMIN) {
            throw new ForbiddenException('Không thể cập nhật tài khoản này');
          }

          if (
            ![ROLE.SUPER_ADMIN, ROLE.MANAGER, ROLE.ASSISTANT].includes(
              requesterUser?.role?.roleName as ROLE,
            )
          ) {
            throw new ForbiddenException(
              'Bạn không có quyền thay đổi chức vụ của người khác',
            );
          }

          if (requesterUser?.role?.roleName === role.roleName) {
            throw new ForbiddenException(
              'Bạn không có quyền thay đổi chức vụ của người này',
            );
          }
        }
      }

      const fileId = data?.fileId;

      if (fileId) {
        const file = await manager.findOne(File, {
          where: { id: Number(fileId) || 0 },
        });
        if (!file) {
          throw new NotFoundException('File không tồn tại');
        }

        const fileRelation = await manager.find(FileRelation, {
          where: {
            relatedId: user.id,
            relatedType: FILE_RELATION_TYPE.USER_AVATAR,
          },
        });
        if (fileRelation.length > 0) {
          await manager.delete(FileRelation, fileRelation);
        }

        const newFileRelation = manager.create(FileRelation, {
          fileId: Number(fileId),
          relatedId: user.id,
          relatedType: FILE_RELATION_TYPE.USER_AVATAR,
        });
        await manager.save(FileRelation, newFileRelation);
      }
      user.role = undefined;
      const updated = manager.merge(User, user, data);
      await manager.save(User, updated);

      const newUser = await manager
        .createQueryBuilder(User, 'user')
        .leftJoinAndSelect('user.role', 'role')
        .leftJoinAndSelect(
          'user.fileRelations',
          'fileRelations',
          'fileRelations.relatedType = :type AND fileRelations.relatedId = user.id',
          {
            type: FILE_RELATION_TYPE.USER_AVATAR,
          },
        )
        .leftJoinAndSelect('fileRelations.file', 'file')
        .where('user.id = :id', { id })
        .getOne();

      return {
        success: true,
        message: 'Cập nhật tài khoản thành công',
        data: newUser,
      };
    });
  }

  async changePassword(requesterId: number, data: ChangePasswordDto) {
    const user = await this.userRepository.findOneBy({ id: requesterId });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isMatch = await bcrypt.compare(data.oldPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Mật khẩu cũ không chính xác');
    }
    if (data.newPassword) {
      data.newPassword = await bcrypt.hash(data.newPassword, 10);
    }
    user.password = data.newPassword;
    await this.userRepository.save(user);

    return {
      success: true,
      message: 'Đổi mật khẩu thành công',
    };
  }

  async handleBlockUser(data: BlockUserDto, requester: User) {
    const { userId, isBlocked } = data;
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user?.role?.roleName === ROLE.SUPER_ADMIN) {
      throw new ForbiddenException('Không thể chặn tài khoản này');
    }

    const requesterAdmin = await this.userRepository.findOne({
      where: { id: requester.id },
      relations: ['role'],
    });
    if (!requesterAdmin) {
      throw new NotFoundException('Không xác định được danh tính của bạn');
    }

    if (
      [ROLE.SUPER_ADMIN, ROLE.ASSISTANT, ROLE.MANAGER].includes(
        requesterAdmin?.role?.roleName as ROLE,
      )
    ) {
      user.lockedAt = isBlocked ? new Date() : null;
      user.lockedBy = requester.id;
      await this.userRepository.save(user);
      return {
        success: true,
        message: isBlocked
          ? 'Tài khoản đã được chặn thành công'
          : 'Tài khoản đã được mở khóa',
        data: user,
      };
    }
    throw new ForbiddenException('Bạn không có quyền chặn tài khoản này');
  }

  async deletePartner(id: number) {
    return this.executeInTransaction(async (queryRunner, manager) => {
      const user = await manager.findOne(User, {
        where: { id },
        relations: ['role'],
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (user?.role?.roleName !== ROLE.PARTNER) {
        throw new ForbiddenException('Lỗi thao tác, vui lòng liên hệ admin');
      }

      const cartDetails = await manager
        .createQueryBuilder(CartDetail, 'cartDetail')
        .leftJoinAndSelect('cartDetail.service', 'service')
        .where('service.userId = :id', { id })
        .getMany();

      if (cartDetails.length) {
        // softRemove nhận entity hoặc array entity
        await manager.softDelete(
          CartDetail,
          cartDetails?.map((item) => item.id),
        );
      }

      const services = await manager.find(Service, {
        where: { userId: id },
      });

      if (services.length) {
        // softRemove nhận entity hoặc array entity
        await manager.softDelete(
          Service,
          services?.map((item) => item.id),
        );
      }

      await manager.softDelete(User, id);

      return {
        success: true,
        message: 'Đã xóa tài khoản và dữ liệu liên quan',
      };
    });
  }

  async remove(id: number, requester: User) {
    const requesterUser = await this.userRepository.findOne({
      where: { id: requester.id },
      relations: ['role'],
    });
    if (!requesterUser) {
      throw new ForbiddenException('Không xác định được danh tính của bạn');
    }

    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user?.role?.roleName === ROLE.SUPER_ADMIN) {
      throw new ForbiddenException('!!!');
    }

    this.validatePermissionDeleteUser(
      requesterUser?.role?.roleName as ROLE,
      user?.role?.roleName as ROLE,
    );

    return this.userRepository.softDelete(id);
  }

  validatePermissionDeleteUser(currentRole: ROLE, targetRole: ROLE) {
    if (
      !(
        [ROLE.SUPER_ADMIN, ROLE.MANAGER].includes(currentRole) &&
        [ROLE.SEOER, ROLE.ASSISTANT].includes(targetRole)
      )
    ) {
      throw new ForbiddenException('Bạn không có quyền xóa tài khoản này');
    }
  }

  async getPendingPayment(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (user?.role?.roleName !== ROLE.PARTNER) {
      throw new ForbiddenException('Yêu cầu không hợp lệ');
    }

    const pendingPaymentOrders = await this.orderRepository
      .createQueryBuilder('order')
      .select(
        `
      SUM(
        CAST(COALESCE(order.price, 0) AS DECIMAL(18,2))
        - CAST(COALESCE(order.discount, 0) AS DECIMAL(18,2))
        + CAST(COALESCE(order.priceAdjustment, 0) AS DECIMAL(18,2))
      )
      `,
        'total',
      )
      .where(
        `
      EXISTS (
        SELECT 1
        FROM order_details od
        JOIN services s ON s.id = od.service_id
        WHERE od.order_id = order.id
          AND s.user_id = :userId
      )
      `,
        { userId: id },
      )
      .andWhere('order.status = :status', {
        status: ORDER_STATUS.PAYMENT_APPROVED_BY_MANAGER,
      })
      .getRawOne<{ total: string | null }>();

    return {
      pendingPayment: pendingPaymentOrders?.total || 0,
    };
  }
}
