import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import * as ExcelJS from 'exceljs';
import { uniq } from 'lodash';
import moment from 'moment';
import { CartDetail } from 'src/cart-detail/entities/cart-detail.entity';
import { Domain } from 'src/domain/entities/domain.entity';
import { OrderDetail } from 'src/order-detail/entities/order-detail.entity';
import { OrderHistory } from 'src/order-history/entities/order-history.entity';
import {
  UpdateBillPaymentLinkDto,
  UpdateLinkDriveDto,
  UpdatePriceAdjustmentDto,
  UpdatePriceDto,
} from 'src/order/dto/update-order.dto';
import { ROLE } from 'src/role/role.constant';
import { Service } from 'src/service/entities/service.entity';
import {
  ORDER_HISTORY_TYPE,
  ORDER_STATUS,
} from 'src/shared/constants/order.constant';
import {
  SERVICE_STATUS,
  SERVICE_TYPE,
} from 'src/shared/constants/service.constant';
import { TEAM_MEMBER_ROLE } from 'src/shared/constants/team.constant';
import { AbstractTransactionService } from 'src/shared/services/abstract-transaction.service';
import {
  checkPermissionChangeStatusOrder,
  getOrderStatusLabel,
  getPriceAndDiscountService,
  rolePermissions,
} from 'src/shared/utils';
import { TeamMember } from 'src/team-member/entities/team-member.entity';
import { Team } from 'src/team/entities/team.entity';
import { UserReview } from 'src/user-review/entities/user-review.entity';
import { User } from 'src/user/entities/user.entity';
import {
  DataSource,
  EntityManager,
  In,
  IsNull,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import {
  CreateOrderItemDto,
  CreateOrderListDto,
  OrderGroup,
} from './dto/create-order.dto';
import { GetOrdersDto } from './dto/get-order.dto';
import { Order } from './entities/order.entity';
@Injectable()
export class OrderService extends AbstractTransactionService {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Service)
    private cartDetailRepository: Repository<CartDetail>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(TeamMember)
    private teamMembersRepository: Repository<TeamMember>,
    @InjectRepository(OrderDetail)
    private orderDetailRepository: Repository<OrderDetail>,
  ) {
    super(dataSource);
  }

  baseGetAllQueryBuilder({
    page = 1,
    limit = 10,
    serviceId, // ??
    status,
    timeBegin,
    timeEnd,
    orderCode,
    sortBy = 'createdAt',
    sortOrder = 'DESC',
    serviceType,
  }: GetOrdersDto) {
    const queryBuilder = this.orderRepository.createQueryBuilder('orders');
    queryBuilder.leftJoinAndSelect('orders.orderDetails', 'orderDetails');
    queryBuilder.leftJoinAndSelect('orderDetails.service', 'service');
    queryBuilder.leftJoinAndSelect('service.user', 'user_service');
    queryBuilder.leftJoinAndSelect('orders.user', 'user_order');
    queryBuilder.leftJoinAndSelect('orders.domain', 'domain');
    queryBuilder.leftJoinAndSelect('orders.team', 'team');
    queryBuilder.orderBy(`orders.${sortBy}`, sortOrder);
    queryBuilder.skip((Number(page) - 1) * Number(limit));
    queryBuilder.take(limit);

    if (status) {
      queryBuilder.andWhere('orders.status IN (:...status)', { status });
    }

    if (serviceType) {
      queryBuilder.andWhere('orderDetails.serviceType IN (:...serviceType)', {
        serviceType,
      });
    }

    if (orderCode) {
      queryBuilder.andWhere('orders.orderCode = :orderCode', { orderCode });
    }

    if (timeBegin) {
      queryBuilder
        .andWhere('orders.updateStatusAt >= :timeBegin', {
          timeBegin: moment(timeBegin).startOf('day').toDate(),
        })
        .andWhere('orders.updateStatusAt IS NOT NULL');
    }
    if (timeEnd) {
      queryBuilder
        .andWhere('orders.updateStatusAt <= :timeEnd', {
          timeEnd: moment(timeEnd).endOf('day').toDate(),
        })
        .andWhere('orders.updateStatusAt IS NOT NULL');
    }

    return queryBuilder;
  }

  async findWithPagination(
    params: GetOrdersDto & {
      isPartnerManage?: boolean;
      teamMemberRoleById?: number; // lấy thông tin role của người dùng hiện tại trong team để kiểm tra ở FE có được quyền thay đổi status order hay không? cho trường hợp nếu là manager được add vào role leader or vice leader thì sẽ được quyền thay đổi status của leader or vice leader
    },
  ) {
    const {
      userId,
      isPartnerManage,
      teamMemberRoleById,
      teamId,
      domainId,
      ...rest
    } = params;

    const queryBuilder = this.baseGetAllQueryBuilder(rest);

    if (teamId) {
      queryBuilder.andWhere('orders.teamId = :teamId', { teamId });
    }
    if (userId && !params.isPartnerManage) {
      queryBuilder.andWhere('orders.userId = :userId', { userId });
    }
    if (teamMemberRoleById) {
      // chỉ “bổ sung dữ liệu” (không lọc): join team.teamMembers theo userId = requesterId để đưa vào kết quả thông tin membership của người đang gọi API trong team của từng order.
      // Mục đích: phía FE biết requester giữ vai trò gì trong team của order (LEADER/VICE_LEADER/...) để quyết định quyền hiển thị/hành động (vd: cho phép đổi trạng thái).
      // Nếu requester không thuộc team đó, teamMember sẽ null; kết quả danh sách order không bị thay đổi.
      queryBuilder.leftJoinAndSelect(
        'team.teamMembers',
        'teamMember',
        'teamMember.userId = :requesterId',
        { requesterId: teamMemberRoleById },
      );
    }
    if (params.isPartnerManage) {
      queryBuilder.andWhere('service.userId = :userId', { userId });
    }

    if (params.domainId) {
      queryBuilder.andWhere('orders.domainId = :domainId', { domainId });
    }

    const [orders, total] = await queryBuilder.getManyAndCount();

    return {
      data: orders,
      total,
      limit: params.limit,
      page: params.page,
    };
  }

  async getAllForExport(
    params: GetOrdersDto & {
      isPartnerManage?: boolean;
      teamMemberRoleById?: number; // requester id
    },
  ) {
    const {
      userId,
      isPartnerManage,
      teamMemberRoleById,
      teamId,
      domainId,
      ...rest
    } = params;

    const queryBuilder = this.orderRepository.createQueryBuilder('orders');
    queryBuilder.leftJoinAndSelect('orders.orderDetails', 'orderDetails');
    queryBuilder.leftJoinAndSelect('orderDetails.service', 'service');
    queryBuilder.leftJoinAndSelect('service.user', 'user_service');
    queryBuilder.leftJoinAndSelect('orders.user', 'user_order');
    queryBuilder.leftJoinAndSelect('orders.domain', 'domain');
    queryBuilder.leftJoinAndSelect('orders.team', 'team');

    // sort
    queryBuilder.orderBy(
      `orders.${rest?.sortBy || 'createdAt'}`,
      (rest?.sortOrder as 'ASC' | 'DESC') || 'DESC',
    );

    // common filters
    this.applyCommonFilters(queryBuilder, rest as GetOrdersDto);

    if (teamId) {
      queryBuilder.andWhere('orders.teamId = :teamId', { teamId });
    }
    // Nếu requester là leader/vice và không truyền teamId, chỉ lấy các order thuộc team họ quản lý

    const requester = await this.userRepository.findOne({
      where: {
        id: Number(teamMemberRoleById),
      },
      relations: ['role'],
    });

    if (
      [ROLE.TEAM_LEADER, ROLE.VICE_TEAM_LEADER].includes(
        requester?.role?.roleName as ROLE,
      )
    ) {
      const teamsOfLeader = await this.teamMembersRepository.find({
        where: {
          userId: Number(teamMemberRoleById),
          role: In([TEAM_MEMBER_ROLE.LEADER, TEAM_MEMBER_ROLE.VICE_LEADER]),
        },
        select: ['teamId'],
      });
      const teamIds = teamsOfLeader.map((m) => m.teamId);
      if (teamIds.length) {
        queryBuilder.andWhere('orders.teamId IN (:...teamIds)', { teamIds });
      } else {
        // Không quản lý team nào thì trả rỗng
        queryBuilder.andWhere('1 = 0');
      }
    }
    if (userId && !isPartnerManage) {
      queryBuilder.andWhere('orders.userId = :userId', { userId });
    }
    // Giữ join để FE có thể biết role của requester trong team nếu cần
    if (teamMemberRoleById) {
      queryBuilder.leftJoinAndSelect(
        'team.teamMembers',
        'teamMember',
        'teamMember.userId = :requesterId',
        { requesterId: teamMemberRoleById },
      );
    }
    if (isPartnerManage) {
      queryBuilder.andWhere('service.userId = :userId', { userId });
    }

    if (domainId) {
      queryBuilder.andWhere('orders.domainId = :domainId', { domainId });
    }

    const orders = await queryBuilder.getMany();
    return orders;
  }

  async exportOrdersCsv(
    params: GetOrdersDto & {
      isPartnerManage?: boolean;
      teamMemberRoleById?: number;
    },
  ) {
    const orders = await this.getAllForExport(params);

    const headers = [
      'Mã đơn hàng',
      'Người đặt hàng',
      'Tên dịch vụ',
      'Giá',
      'Chiết khấu',
      'Điều chỉnh giá',
      'Tổng tiền sau giảm giá',
      'Tên miền',
      'Team',
      'Trạng thái',
    ];

    const escape = (val: any) => {
      const s = val === undefined || val === null ? '' : String(val);
      if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    };

    const rows = orders.map((o) => {
      const orderCode = (o as any)?.orderCode || (o as any)?.id;
      const userName =
        (o as any)?.user?.username || (o as any)?.user?.displayName || '';
      const serviceNames = ((o as any)?.orderDetails || [])
        .map((d: any) => d?.service?.name)
        .filter(Boolean)
        .join(' | ');
      const price = Number((o as any)?.price || 0);
      const discount = Number((o as any)?.discount || 0);
      const adjustment = Number((o as any)?.priceAdjustment || 0);
      const totalAfter = price - discount + adjustment;
      const domainName = (o as any)?.domain?.name || '';
      const teamName = (o as any)?.team?.name || '';
      const status = getOrderStatusLabel((o as any)?.status);
      return [
        orderCode,
        userName,
        serviceNames,
        price,
        discount,
        adjustment,
        totalAfter,
        domainName,
        teamName,
        status,
      ]
        .map(escape)
        .join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const filename = `orders_${new Date()
      .toISOString()
      .replace(/[-:T]/g, '')
      .slice(0, 15)}.csv`;
    return { filename, csv };
  }

  async exportOrdersExcel(
    params: GetOrdersDto & {
      isPartnerManage?: boolean;
      teamMemberRoleById?: number;
    },
  ) {
    const orders = await this.getAllForExport(params);

    const headers = [
      'Mã đơn hàng',
      'Người đặt hàng',
      'Tên dịch vụ',
      'Giá',
      'Chiết khấu',
      'Điều chỉnh giá',
      'Tổng tiền sau giảm giá',
      'Tên miền',
      'Team',
      'Trạng thái',
    ];

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Orders');

    sheet.columns = [
      { header: headers[0], key: 'orderCode' },
      { header: headers[1], key: 'userName' },
      { header: headers[2], key: 'serviceNames' },
      { header: headers[3], key: 'price' },
      { header: headers[4], key: 'discount' },
      { header: headers[5], key: 'adjustment' },
      { header: headers[6], key: 'totalAfter' },
      { header: headers[7], key: 'domainName' },
      { header: headers[8], key: 'teamName' },
      { header: headers[9], key: 'status' },
    ];

    const headerRow = sheet.getRow(1);
    headerRow.height = 22;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1F4B99' },
      } as any;
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        right: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      };
    });

    const currencyFormat = '#,##0';
    orders.forEach((o) => {
      const orderCode = (o as any)?.orderCode || (o as any)?.id;
      const userName =
        (o as any)?.user?.username || (o as any)?.user?.displayName || '';
      const serviceNames = ((o as any)?.orderDetails || [])
        .map((d: any) => d?.service?.name)
        .filter(Boolean)
        .join(' | ');
      const price = Number((o as any)?.price || 0);
      const discount = Number((o as any)?.discount || 0);
      const adjustment = Number((o as any)?.priceAdjustment || 0);
      const totalAfter = price - discount + adjustment;
      const domainName = (o as any)?.domain?.name || '';
      const teamName = (o as any)?.team?.name || '';
      const status = getOrderStatusLabel((o as any)?.status);

      const row = sheet.addRow({
        orderCode,
        userName,
        serviceNames,
        price,
        discount,
        adjustment,
        totalAfter,
        domainName,
        teamName,
        status,
      });

      row.getCell('price').numFmt = currencyFormat;
      row.getCell('discount').numFmt = currencyFormat;
      row.getCell('adjustment').numFmt = currencyFormat;
      row.getCell('totalAfter').numFmt = currencyFormat;

      row.eachCell((cell, colNumber) => {
        cell.alignment = {
          vertical: 'middle',
          horizontal: colNumber <= 3 || colNumber >= 8 ? 'left' : 'right',
          wrapText: true,
        } as any;
        cell.border = {
          top: { style: 'hair', color: { argb: 'FFE6E6E6' } },
          left: { style: 'hair', color: { argb: 'FFE6E6E6' } },
          bottom: { style: 'hair', color: { argb: 'FFE6E6E6' } },
          right: { style: 'hair', color: { argb: 'FFE6E6E6' } },
        };
      });
    });

    sheet.columns.forEach((col) => {
      const maxLen = Math.min(
        60,
        Math.max(
          (col.header ? String(col.header).length : 10) + 2,
          ...sheet
            .getColumn(col.key as string)
            .values.filter((v) => v != null)
            .map((v) => {
              const val: unknown = v as unknown;
              if (
                typeof val === 'string' ||
                typeof val === 'number' ||
                typeof val === 'boolean'
              ) {
                return String(val).length + 2;
              }
              return 12;
            }),
        ),
      );
      col.width = Math.max(12, maxLen);
    });

    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1 + orders.length, column: headers.length },
    } as any;

    const buffer = await workbook.xlsx.writeBuffer();
    const filename = `orders_${new Date()
      .toISOString()
      .replace(/[-:T]/g, '')
      .slice(0, 15)}.xlsx`;
    return { filename, buffer };
  }

  // Get orders by domain:
  // All allowed roles (SUPER_ADMIN, TEAM_LEADER, VICE_TEAM_LEADER, MANAGER, ASSISTANT)
  // can see all orders of the specified domain (no team scoping).
  async findOrdersByDomainWithRoleScope(
    params: GetOrdersDto & { teamMemberRoleById?: number },
  ) {
    const { teamMemberRoleById, domainId, ...rest } = params;
    return this.findWithPagination({
      ...rest,
      teamMemberRoleById,
      domainId,
    });
  }

  // api cho leader get những order trong team
  async findOrdersOfMyTeam(params: GetOrdersDto & { userId?: number }) {
    const { userId, teamId, ...rest } = params;

    // Lấy teamIds của leader/vice
    const teamsOfLeader = await this.teamMembersRepository.find({
      where: {
        userId: Number(userId),
        role: In([TEAM_MEMBER_ROLE.LEADER, TEAM_MEMBER_ROLE.VICE_LEADER]),
      },
      select: ['teamId'],
    });
    const teamIds = teamsOfLeader.map((m) => m.teamId);

    // 1) Lấy orderIds theo filter (KHÔNG JOIN)
    const idsQB = this.orderRepository.createQueryBuilder('orders');
    this.applyCommonFilters(idsQB, rest);
    if (teamId) idsQB.andWhere('orders.teamId = :teamId', { teamId });
    else idsQB.andWhere('orders.teamId IN (:...teamIds)', { teamIds });

    idsQB
      .select('orders.id', 'id')
      .orderBy(
        `orders.${rest?.sortBy || 'createdAt'}`,
        rest?.sortOrder || 'DESC',
      )
      .skip((Number(rest.page || 1) - 1) * Number(rest.limit || 10))
      .take(Number(rest.limit || 10));

    const idRows = await idsQB.getRawMany<{ id: number }>();
    const orderIds = idRows.map((r) => r.id);

    // 2) Đếm tổng đơn – COUNT DISTINCT
    const countQB = this.orderRepository.createQueryBuilder('orders');
    this.applyCommonFilters(countQB, rest);
    if (teamId) countQB.andWhere('orders.teamId = :teamId', { teamId });
    else countQB.andWhere('orders.teamId IN (:...teamIds)', { teamIds });

    const total = await countQB
      .select('COUNT(DISTINCT orders.id)', 'cnt')
      .getRawOne()
      .then((r) => Number(r?.cnt || 0));

    let orders: Order[] = [];
    if (orderIds.length) {
      const dataQB = this.orderRepository
        .createQueryBuilder('orders')
        .leftJoinAndSelect('orders.orderDetails', 'orderDetails')
        .leftJoinAndSelect('orderDetails.service', 'service')
        .leftJoinAndSelect('service.user', 'user_service')
        .leftJoinAndSelect('orders.user', 'user_order')
        .leftJoinAndSelect('orders.domain', 'domain')
        .leftJoinAndSelect('orders.team', 'team')
        .where('orders.id IN (:...ids)', { ids: orderIds })
        .orderBy(`FIELD(orders.id, ${orderIds.join(',')})`);
      orders = await dataQB.getMany();
    }

    // 4) Tính totalAmount – KHÔNG JOIN, dùng EXISTS cho serviceType
    let totalAmount: number | null = null;
    if (rest?.timeBegin && rest?.timeEnd && rest.status) {
      const sumQB = this.orderRepository.createQueryBuilder('orders');
      this.applyCommonFilters(sumQB, rest);
      if (teamId) sumQB.andWhere('orders.teamId = :teamId', { teamId });
      else sumQB.andWhere('orders.teamId IN (:...teamIds)', { teamIds });

      sumQB.select(
        `
          SUM(
            CAST(COALESCE(orders.price, 0) AS DECIMAL(18,2))
            - CAST(COALESCE(orders.discount, 0) AS DECIMAL(18,2))
            + CAST(COALESCE(orders.priceAdjustment, 0) AS DECIMAL(18,2))
          )
      `,
        'total',
      );

      const res = await sumQB.getRawOne<{ total: string }>();
      totalAmount = Number(res?.total || 0);
    }

    return {
      data: orders,
      total,
      limit: Number(rest.limit || 10),
      page: Number(rest.page || 1),
      totalAmount,
    };
  }

  applyCommonFilters(qb: SelectQueryBuilder<Order>, rest: GetOrdersDto) {
    const { status, serviceType, orderCode, timeBegin, timeEnd } = rest;
    if (status?.length) {
      qb.andWhere('orders.status IN (:...status)', { status });
    }

    if (orderCode) {
      qb.andWhere('orders.orderCode = :orderCode', { orderCode });
    }

    if (timeBegin) {
      qb.andWhere('orders.updateStatusAt >= :timeBegin', {
        timeBegin: moment(timeBegin).startOf('day').toDate(),
      });
      qb.andWhere('orders.updateStatusAt IS NOT NULL');
    }
    if (timeEnd) {
      qb.andWhere('orders.updateStatusAt <= :timeEnd', {
        timeEnd: moment(timeEnd).endOf('day').toDate(),
      });
      qb.andWhere('orders.updateStatusAt IS NOT NULL');
    }

    // QUAN TRỌNG: lọc serviceType bằng EXISTS để tránh nhân dòng
    if (serviceType?.length) {
      qb.andWhere(
        `EXISTS (
           SELECT 1 FROM order_details od
           WHERE od.order_id = orders.id
             AND od.service_type IN (:...serviceType)
         )`,
        { serviceType },
      );
    }

    return qb;
  }

  async create(createOrderDto: CreateOrderListDto, currentUser: User) {
    return this.executeInTransaction(async (queryRunner, manager) => {
      const user = await manager.findOne(User, {
        where: { id: currentUser.id },
        relations: ['role'],
      });
      if (user?.role?.roleName !== ROLE.SEOER) {
        throw new UnauthorizedException('Chỉ SEOer với được order!');
      }

      const uniqueServiceIds = uniq(
        createOrderDto?.orderItems?.map((order) => order.serviceId),
      );
      const services = await manager
        .createQueryBuilder(Service, 'service')
        .leftJoinAndSelect('service.user', 'user')
        .where('service.id IN (:...ids)', {
          ids: uniqueServiceIds,
        })
        .andWhere('user.lockedAt IS NULL')
        .andWhere('service.deletedAt IS NULL')
        .andWhere('service.status = :status', {
          status: SERVICE_STATUS.APPROVED,
        })
        .getMany();

      if (services.length !== uniqueServiceIds.length) {
        throw new NotFoundException({
          status: 404,
          message: 'Một số dịch vụ có thể đã bị sửa đổi hoặc không tồn tại',
          key: 'INVALID_SERVICES',
        });
      }
      //  acc + (price - discount) * item.quantity;
      const { totalPrice, totalDiscount } =
        createOrderDto?.orderItems?.reduce(
          (acc, item) => {
            const service = services.find(
              (service) => service.id === item.serviceId,
            );
            const { price, discount } = getPriceAndDiscountService(
              item?.serviceType,
              service,
            );
            return {
              totalPrice: acc.totalPrice + price * item.quantity,
              totalDiscount: acc.totalDiscount + discount * item.quantity,
            };
          },
          {
            totalPrice: 0,
            totalDiscount: 0,
          },
        ) || {};

      if (totalPrice - totalDiscount !== Number(createOrderDto.totalPrice)) {
        throw new NotFoundException({
          status: 404,
          message: 'Một số dịch vụ có thể đã bị sửa đổi hoặc không tồn tại',
          key: 'INVALID_SERVICES',
        });
      }

      const domainQueryBuilder = manager.createQueryBuilder(Domain, 'domain');
      domainQueryBuilder.innerJoinAndSelect(
        'domain.userDomains',
        'userDomains',
      );
      domainQueryBuilder
        .andWhere('userDomains.userId = :userId', {
          userId: currentUser.id,
        })
        .andWhere('domain.id = :domainId', {
          domainId: createOrderDto.domainId,
        });
      const domain = await domainQueryBuilder.getOne();

      if (!domain) {
        throw new NotFoundException('Domain không hợp lệ');
      }

      await this.validateBuggetDoamin({
        domainId: createOrderDto.domainId,
        price: totalPrice - totalDiscount,
        manager,
      });

      const teamOfUser = await manager.findOne(TeamMember, {
        where: {
          userId: currentUser.id,
          deletedAt: IsNull(),
        },
        select: ['teamId'],
      });

      const teamId = teamOfUser?.teamId;

      // gom order có cùng partner và service type = GP, TEXTLINK
      const ordersGroup = this.groupOrders(createOrderDto.orderItems);
      const _newOrdersPromises = (ordersGroup ?? []).map(async (orderGroup) => {
        const {
          totalPrice: totalPriceOfOrder,
          totalDiscount: totalDiscountOfOrder,
        } =
          orderGroup?.orders?.reduce(
            (acc, item) => {
              const service = services.find(
                (service) => service.id === item.serviceId,
              );
              const { price, discount } = getPriceAndDiscountService(
                item?.serviceType,
                service,
              );
              return {
                totalPrice: acc.totalPrice + price * item.quantity,
                totalDiscount: acc.totalDiscount + discount * item.quantity,
              };
            },
            {
              totalPrice: 0,
              totalDiscount: 0,
            },
          ) || {};

        const newOrder = manager.create(Order, {
          teamId: teamId || undefined,
          userId: currentUser.id,
          domainId: createOrderDto.domainId,
          status: ORDER_STATUS.SEOER_ORDER,
          orderAt: new Date(),
          discount: totalDiscountOfOrder,
          price: totalPriceOfOrder,
          updateStatusAt: new Date(),
        });

        const savedNewOrder = await manager.save(newOrder);

        const orderDetailPromises = orderGroup.orders.map(async (order) => {
          const service = services.find(
            (service) => service.id === order.serviceId,
          );
          const { price, discount } = getPriceAndDiscountService(
            order?.serviceType,
            service,
          );
          const newOrderDetail = manager.create(OrderDetail, {
            ...order,
            domainId: createOrderDto.domainId,
            status: ORDER_STATUS.SEOER_ORDER,
            userId: currentUser.id,
            price: Number(price) * Number(order.quantity),
            discount: Number(discount || 0) * Number(order.quantity),
            orderId: savedNewOrder.id,
            serviceMetadata: plainToInstance(Service, service),
          });
          if (order.cartDetailId) {
            await this.cartDetailRepository.delete(order.cartDetailId);
          }
          return await manager.save(newOrderDetail);
        });

        await Promise.all(orderDetailPromises);

        const order = await manager.find(Order, {
          where: { id: savedNewOrder.id },
          relations: ['orderDetails', 'orderDetails.service', 'user', 'domain'],
        });

        const orderHistory = manager.create(OrderHistory, {
          orderId: savedNewOrder.id,
          type: ORDER_HISTORY_TYPE.CREATE_ORDER,
          userId: currentUser.id,
          metadata: JSON.stringify({
            newOrder: order,
          }),
        });

        await manager.save(orderHistory);
        await this.notifyNewOrder(manager, savedNewOrder.id);
      });
      await Promise.all(_newOrdersPromises);

      return {
        message: 'Order created successfully',
        status: true,
      };
    });
  }

  async validateBuggetDoamin({
    domainId,
    price,
    manager,
    message = 'Vượt quá ngân sách domain',
  }: {
    domainId: number;
    price: number;
    manager: EntityManager;
    message?: string;
  }) {
    const domain = await manager.findOne(Domain, {
      where: { id: domainId },
    });
    if (!domain) {
      throw new NotFoundException('Domain không tồn tại');
    }

    const totalAmount = await manager
      .createQueryBuilder(Order, 'order')
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
      .where('order.domainId = :domainId', {
        domainId,
      })
      .andWhere('order.status NOT IN (:...status)', {
        status: [
          ORDER_STATUS.REJECTED_BY_TEAM_LEADER,
          ORDER_STATUS.CANCELLED_BY_SEOER,
          ORDER_STATUS.CANCELLED_BY_MANAGER,
        ],
      })
      .getRawOne();

    const newBugget = Number(totalAmount?.total || 0) + Number(price || 0);

    if (newBugget > Number(domain.budget || 0)) {
      throw new NotFoundException(message);
    }
  }

  groupOrders(orderItems: CreateOrderItemDto[]): OrderGroup[] {
    const groupedOrders: OrderGroup[] = [];
    const groupedByPartner = {};

    orderItems.forEach((order) => {
      // Nếu serviceType là GP hoặc TEXTLINK, gộp theo partnerId
      if (
        [SERVICE_TYPE.GP, SERVICE_TYPE.TEXTLINK].includes(order.serviceType)
      ) {
        const key = order.partnerId;
        if (!groupedByPartner[key]) {
          groupedByPartner[key] = {
            partnerId: order.partnerId,
            serviceType: 'GP_TEXTLINK', // Gộp chung GP và TEXTLINK
            orders: [],
          };
        }
        groupedByPartner[key].orders.push(order);
      } else {
        // Các serviceType khác giữ nguyên, không gộp
        groupedOrders.push({
          partnerId: order.partnerId,
          serviceType: order.serviceType,
          orders: [order],
        });
      }
    });

    // Thêm các nhóm GP/TEXTLINK vào kết quả
    Object.values(groupedByPartner).forEach((group: OrderGroup) => {
      groupedOrders.push(group);
    });

    return groupedOrders;
  }

  private async getTeamTelegramId(
    manager: EntityManager,
    teamId?: number,
  ): Promise<string | null> {
    if (!teamId) return null;
    const team = await manager.findOne(Team, { where: { id: teamId } });
    const chatId = team?.telegramId || null;
    return chatId || null;
  }

  private async sendTelegramMessage(chatId: string, text: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token || !chatId || !text) return;
    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
      });
    } catch (e) {
      // best-effort notification; ignore errors
    }
  }

  private buildNewOrderMessage(order: Order): string {
    const code = order?.orderCode ? `#${order.orderCode}` : `#${order.id}`;
    const domain = order?.domain?.name || '';
    const by =
      order?.user?.displayName ||
      order?.user?.username ||
      `User ${order?.userId}`;

    return [
      `🎉 Một đơn hàng mới đã được tạo!`,
      '',
      `🧾 Mã đơn: ${code}`,
      '',
      domain ? `🌐 Liên quan đến: ${domain}` : '',
      '',
      `👤 Tạo bởi: ${by}`,
    ]
      .filter(Boolean)
      .join('\n');
  }

  private buildStatusChangeMessage({
    order,
    domainName,
    before,
    after,
  }: {
    order: Order;
    domainName: string;
    before: ORDER_STATUS;
    after: ORDER_STATUS;
  }): string {
    const code = order?.orderCode ? `#${order.orderCode}` : `#${order.id}`;
    const domain = domainName;
    const teleName = order?.user?.telegramUsername
      ? `@${order.user.telegramUsername}`
      : 'seoer';
    return [
      `📦 Đơn hàng ${code} vừa được cập nhật!`,
      '',
      domain ? `🌐 Domain: ${domain}` : '',
      '',
      `Trước đó: ${getOrderStatusLabel(before)}`,
      '',
      `➡️Hiện tại: ${getOrderStatusLabel(after)}`,
      '',
      after === ORDER_STATUS.COMPLETED_BY_PARTNER
        ? `Hey, ${teleName} vào kiểm tra đơn hàng ok chưa, xác nhận thanh toán cho người ta nha!`
        : '',
    ]
      .filter(Boolean)
      .join('\n');
  }

  private async notifyNewOrder(manager: EntityManager, orderId: number) {
    try {
      const order = await manager.findOne(Order, {
        where: { id: orderId },
        relations: ['user', 'domain', 'team'],
      });
      if (!order) return;
      const chatId = await this.getTeamTelegramId(manager, order.teamId);
      if (!chatId) return;
      const text = this.buildNewOrderMessage(order);
      await this.sendTelegramMessage(chatId, text);
    } catch (e) {
      // best-effort notification; ignore errors
    }
  }

  private async notifyStatusChange(
    manager: EntityManager,
    orderId: number,
    before: ORDER_STATUS,
    after: ORDER_STATUS,
  ) {
    try {
      const order = await manager.findOne(Order, {
        where: { id: orderId },
        relations: ['user', 'domain', 'team'],
      });
      if (!order) return;
      const chatId = await this.getTeamTelegramId(manager, order.teamId);
      if (!chatId) return;
      const text = this.buildStatusChangeMessage({
        order,
        before,
        after,
        domainName: order?.domain?.name,
      });
      await this.sendTelegramMessage(chatId, text);
    } catch (e) {
      // best-effort notification; ignore errors
    }
  }

  async updateBillPaymentLink(
    id: number,
    data: UpdateBillPaymentLinkDto,
    requester: User,
  ) {
    return this.executeInTransaction(async (queryRunner, manager) => {
      const { billPaymentLink } = data;
      const order = await manager.findOne(Order, {
        where: { id },
        relations: ['orderDetails', 'orderDetails.service', 'user', 'domain'],
      });
      if (!order) {
        throw new NotFoundException('Đơn hàng không tồn tại');
      }

      if (order.status !== ORDER_STATUS.PAID_BY_MANAGER) {
        throw new ForbiddenException(
          'Đơn hàng phải được thanh toán trước khi dán build',
        );
      }

      const user = await this.userRepository.findOne({
        where: { id: requester.id },
        relations: ['role'],
      });
      if (!user) {
        throw new UnauthorizedException('Danh tính của bạn không hợp lệ');
      }
      if (
        ![ROLE.MANAGER, ROLE.ASSISTANT, ROLE.SUPER_ADMIN].includes(
          user.role?.roleName as ROLE,
        )
      ) {
        throw new ForbiddenException(
          'Bạn không có quyền thực hiện hành động này',
        );
      }

      const updated = manager.merge(Order, order, { billPaymentLink });
      await manager.save(updated);

      return updated;
    });
  }

  async updateStatus(
    id: number,
    status: ORDER_STATUS,
    fileId: number,
    requester: User,
  ) {
    return this.executeInTransaction(async (queryRunner, manager) => {
      const order = await manager.findOne(Order, {
        where: { id },
        relations: ['orderDetails', 'orderDetails.service', 'user', 'domain'],
      });
      if (!order) {
        throw new NotFoundException('Đơn hàng không tồn tại');
      }

      if (status !== ORDER_STATUS.CANCELLED_BY_MANAGER) {
        if (!order?.domain) {
          throw new ForbiddenException(
            'Domain cho đơn hàng này đã bị xóa hoặc không hợp lệ',
          );
        }
        if (
          [
            ORDER_STATUS.SEOER_ORDER,
            ORDER_STATUS.CONFIRMED_BY_TEAM_LEADER,
            ORDER_STATUS.CONFIRMED_BY_PARTNER,
            ORDER_STATUS.COMPLETED_BY_PARTNER,
            ORDER_STATUS.CONFIRMED_COMPLETION_BY_SEOER,
            ORDER_STATUS.PAYMENT_APPROVED_BY_MANAGER,
            ORDER_STATUS.PAID_BY_MANAGER,
          ].includes(status)
        ) {
          await this.validateBuggetDoamin({
            domainId: order.domainId,
            price: 0, // 0 vì chỉ check đơn hiện tại. đơn này đã có rồi
            manager,
          });
        }
      }

      const user = await manager.findOne(User, {
        where: { id: requester.id },
        relations: ['role'],
      });

      if (!user) {
        throw new UnauthorizedException('Danh tính của bạn không hợp lệ!');
      }

      if (user?.role?.roleName === ROLE.PARTNER) {
        const partnerId = order?.orderDetails?.[0]?.service?.userId;
        if (Number(partnerId) !== Number(user.id)) {
          throw new ForbiddenException('Thao tác không hợp lệ!');
        }
      }

      if (user?.role?.roleName === ROLE.SEOER) {
        if (Number(order?.userId) !== Number(user.id)) {
          throw new ForbiddenException('Thao tác không hợp lệ!');
        }
      }

      let userRole: ROLE | undefined = user?.role?.roleName;
      const teamId = order?.teamId;

      if (teamId && userRole !== ROLE.SUPER_ADMIN) {
        const teamMember = await manager.findOne(TeamMember, {
          where: {
            teamId: Number(teamId),
            userId: user.id,
            role: In([TEAM_MEMBER_ROLE.LEADER, TEAM_MEMBER_ROLE.VICE_LEADER]),
          },
        });
        const leaderCurrentAllowedStatuses =
          rolePermissions[ROLE.TEAM_LEADER].currentAllowedStatuses || [];

        const viceLeaderCurrentAllowedStatuses =
          rolePermissions[ROLE.VICE_TEAM_LEADER].currentAllowedStatuses || [];

        if (teamMember) {
          if (
            teamMember.role === TEAM_MEMBER_ROLE.LEADER &&
            leaderCurrentAllowedStatuses.includes(order.status)
          ) {
            userRole = ROLE.TEAM_LEADER;
          } else if (
            teamMember.role === TEAM_MEMBER_ROLE.VICE_LEADER &&
            viceLeaderCurrentAllowedStatuses.includes(order.status)
          ) {
            userRole = ROLE.VICE_TEAM_LEADER;
          }
        }
      }
      const { permissionStatus } = checkPermissionChangeStatusOrder({
        userRole: userRole as ROLE,
        currentStatus: order.status,
        changeToStatus: status,
      });

      if (!permissionStatus) {
        throw new ForbiddenException(
          'Bạn không có quyền thực hiện hành động này',
        );
      }

      // Nếu là SEOER và chuyển trạng thái sang CONFIRMED_COMPLETION_BY_SEOER thì yêu cầu đã review đơn hàng này
      if (
        user?.role?.roleName === ROLE.SEOER &&
        status === ORDER_STATUS.CONFIRMED_COMPLETION_BY_SEOER
      ) {
        const existedReview = await manager.findOne(UserReview, {
          where: { reviewerId: user.id, orderId: order.id },
        });
        if (!existedReview) {
          throw new ForbiddenException(
            'Hãy để lại đánh giá cho đơn hàng này trước khi bạn xác nhận hoàn thành nhé!',
          );
        }
      }

      const orderHistory = manager.create(OrderHistory, {
        orderId: order.id,
        type: ORDER_HISTORY_TYPE.CHANGE_STATUS,
        userId: requester.id,
        metadata: JSON.stringify({
          before: order.status,
          after: status,
          fileId,
        }),
      });

      await manager.save(orderHistory);

      const { domain: _, ...rest } = order;
      const newOrder = plainToInstance(Order, {
        ...rest,
        status,
        domainId: order.domainId,
        updateStatusAt: new Date(),
      });

      await manager.save(newOrder);
      await this.notifyStatusChange(manager, order.id, order.status, status);
      return order;
    });
  }

  async updatePriceAdjustment(
    id: number,
    updatePriceAdjustmentDto: UpdatePriceAdjustmentDto,
    requester: User,
  ) {
    return this.executeInTransaction(async (queryRunner, manager) => {
      const user = await manager.findOne(User, {
        where: { id: requester.id },
        relations: ['role'],
      });
      if (!user) {
        throw new UnauthorizedException('Invalid user');
      }

      const order = await manager.findOne(Order, {
        where: { id },
        relations: ['orderDetails', 'orderDetails.service', 'user', 'domain'],
      });
      if (!order) {
        throw new NotFoundException('Order not found');
      }

      const allowRoles = [ROLE.MANAGER, ROLE.ASSISTANT, ROLE.SUPER_ADMIN];
      const allowStatus = [
        ORDER_STATUS.PAYMENT_APPROVED_BY_MANAGER,
        ORDER_STATUS.PAID_BY_MANAGER,
      ];

      if (
        !allowRoles.includes(user.role?.roleName as ROLE) ||
        allowStatus.includes(order.status)
      ) {
        throw new ForbiddenException(
          'You do not have permission to perform this action',
        );
      }

      const orderHistory = manager.create(OrderHistory, {
        orderId: order.id,
        type: ORDER_HISTORY_TYPE.PRICE_ADJUSTMENT,
        userId: requester.id,
        metadata: JSON.stringify({
          before: order.priceAdjustment,
          after: updatePriceAdjustmentDto.priceAdjustment,
        }),
      });
      await manager.save(orderHistory);

      order.priceAdjustment = updatePriceAdjustmentDto.priceAdjustment;
      await manager.save(order);
      return order;
    });
  }

  async updatePrice(
    id: number,
    updatePriceDto: UpdatePriceDto,
    requester: User,
  ) {
    return this.executeInTransaction(async (queryRunner, manager) => {
      const user = await manager.findOne(User, {
        where: { id: requester.id },
        relations: ['role'],
      });
      if (!user) {
        throw new UnauthorizedException('Invalid user');
      }

      const order = await manager.findOne(Order, {
        where: { id },
        relations: ['orderDetails', 'orderDetails.service', 'user', 'domain'],
      });
      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (user?.role?.roleName === ROLE.PARTNER) {
        if (order?.orderDetails?.[0]?.serviceType !== SERVICE_TYPE.CONTENT) {
          throw new ForbiddenException(
            'You do not have permission to perform this action',
          );
        }
      }

      const orderHistory = manager.create(OrderHistory, {
        orderId: order.id,
        type: ORDER_HISTORY_TYPE.PRICE,
        userId: requester.id,
        metadata: JSON.stringify({
          before: {
            price: order.price,
            discount: order.discount,
          },
          after: {
            price: updatePriceDto.price,
            discount: updatePriceDto.discount,
          },
        }),
      });
      await manager.save(orderHistory);

      order.price = updatePriceDto.price;
      order.discount = updatePriceDto.discount;
      await manager.save(order);
      return order;
    });
  }

  async updateLinkDrive(
    orderDetailId: number,
    updateLinkDriveDto: UpdateLinkDriveDto,
    requester: User,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: requester.id },
      relations: ['role'],
    });
    if (!user || user.role?.roleName !== ROLE.PARTNER) {
      throw new UnauthorizedException('Invalid permission');
    }

    const orderDetail = await this.orderDetailRepository.findOneBy({
      id: orderDetailId,
    });
    if (!orderDetail) {
      throw new NotFoundException('Order detail not found');
    }
    orderDetail.linkDrive = updateLinkDriveDto.linkDrive;
    await this.orderDetailRepository.save(orderDetail);

    return orderDetail;
  }

  async deleteOrderDetail(id: number, requester: User) {
    return this.executeInTransaction(async (queryRunner, manager) => {
      const _orderDetail = await manager.findOne(OrderDetail, {
        where: { id },
      });

      if (!_orderDetail) {
        throw new NotFoundException('Đơn hàng chi tiết không tồn tại');
      }

      const orderDetailCount = await manager.count(OrderDetail, {
        where: { orderId: _orderDetail.orderId },
      });

      if (orderDetailCount === 1) {
        throw new ForbiddenException(
          'Không thể xóa! Đơn hàng phải có tối thiểu 1 dịch vụ',
        );
      }

      const orderDetail = await manager.findOne(OrderDetail, {
        where: { id },
        relations: ['order'],
      });

      if (!orderDetail) {
        throw new NotFoundException('Đơn hàng không tồn tại');
      }

      const orderHistory = manager.create(OrderHistory, {
        orderId: orderDetail.orderId,
        type: ORDER_HISTORY_TYPE.REMOVE_ORDER_DETAIL,
        userId: requester.id,
        metadata: JSON.stringify({
          orderDetailId: id,
          orderDetailRemoved: orderDetail,
        }),
      });
      await manager.save(orderHistory);

      const requesterUser = await manager.findOne(User, {
        where: { id: requester?.id },
        relations: ['role'],
      });
      if (
        ![ROLE.MANAGER, ROLE.ASSISTANT, ROLE.SUPER_ADMIN].includes(
          requesterUser?.role?.roleName as ROLE,
        )
      ) {
        throw new UnauthorizedException(
          'Bạn không có quyền thực hiện hành động này',
        );
      }

      await manager.update(
        Order,
        { id: orderDetail.orderId },
        {
          price: () => `price - ${Number(orderDetail.price) || 0}`,
          discount: () => `discount - ${Number(orderDetail.discount) || 0}`,
        },
      );

      await manager.softDelete(OrderDetail, id);
      return { message: 'Đơn hàng đã được cập nhật', success: true };
    });
  }

  // async remove(id: number) {
  //   const order = await this.orderRepository.findOneBy({ id });
  //   if (!order) {
  //     throw new NotFoundException('Đơn hàng không tồn tại');
  //   }
  //   await this.orderRepository.delete(id);
  //   return { message: 'Đơn hàng đã được xóa thành công' };
  // }

  async findOne(id: number) {
    return this.executeInTransaction(async (queryRunner, manager) => {
      const queryBuilder = manager
        .createQueryBuilder(Order, 'orders')
        .leftJoinAndSelect('orders.user', 'user')
        .leftJoinAndSelect('orders.domain', 'domain')
        .leftJoinAndSelect('orders.orderDetails', 'orderDetails')
        .leftJoinAndSelect('orderDetails.service', 'service')
        .leftJoinAndSelect('service.complimentaries', 'complimentaries')
        .leftJoinAndSelect('service.user', 'service_user');
      queryBuilder.andWhere('orders.id = :id', { id });
      const order = await queryBuilder.getOne();

      const recentChangeStatusHistory = await manager.findOne(OrderHistory, {
        where: { orderId: id, type: ORDER_HISTORY_TYPE.CHANGE_STATUS },
        order: { createdAt: 'DESC' },
      });

      if (!order) {
        throw new NotFoundException('Đơn hàng không tồn tại');
      }
      return {
        ...order,
        recentChangeStatusHistory,
      };
    });
  }

  async checkValidateRole({ userId }: { userId: number }) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });
    if (!user) {
      throw new UnauthorizedException('Danh tính của bạn không hợp lệ');
    }
  }
}
