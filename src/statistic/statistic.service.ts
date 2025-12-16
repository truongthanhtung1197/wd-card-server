import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import moment from 'moment';
import { Domain } from 'src/domain/entities/domain.entity';
import { Order } from 'src/order/entities/order.entity';
import { ROLE } from 'src/role/role.constant';
import { Service } from 'src/service/entities/service.entity';
import { DOMAIN_PATTERN } from 'src/shared/constants/domain.constant';
import { ORDER_STATUS } from 'src/shared/constants/order.constant';
import { TEAM_KEY } from 'src/shared/constants/team.constant';
import { GetStatisticDto } from 'src/statistic/dto/get-statistic.dto';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StatisticService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Domain)
    private domainRepository: Repository<Domain>,
  ) {}

  async findAll(getStatisticDto: GetStatisticDto, userId?: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId || 0 },
      relations: ['role'],
    });

    if (user && user?.role?.roleName !== ROLE.SUPER_ADMIN) {
      throw new ForbiddenException('Thao tác không hợp lệ!');
    }

    const { timeBegin, timeEnd } = getStatisticDto;

    const start = moment(timeBegin).startOf('day').toDate();
    const end = moment(timeEnd).endOf('day').toDate();

    const queryBuilderOrder = this.orderRepository
      .createQueryBuilder('orders')
      .select('orders.status', 'status')
      .addSelect('COUNT(*)', 'total')
      .where(
        'orders.updateStatusAt >= :start AND orders.updateStatusAt <= :end',
        {
          start,
          end,
        },
      )
      .groupBy('orders.status');

    const queryBuilderUser = this.userRepository
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.role', 'role')
      .select('role.roleName', 'roleName')
      .addSelect('COUNT(*)', 'total')
      .where('users.created_at >= :start AND users.created_at <= :end', {
        start,
        end,
      })
      .andWhere('role.roleName != :roleName', { roleName: ROLE.SUPER_ADMIN })
      .groupBy('roleName');

    const queryBuilderDomain = this.domainRepository
      .createQueryBuilder('domains')
      .select('domains.status', 'status')
      .addSelect('COUNT(*)', 'total')
      .where('domains.created_at >= :start AND domains.created_at <= :end', {
        start,
        end,
      })
      .groupBy('domains.status');

    const queryBuilderOrderExpense = this.orderRepository
      .createQueryBuilder('order')
      .leftJoin('order.team', 'team')
      .select('order.status', 'status')
      .addSelect('COUNT(*)', 'totalCount')
      .addSelect(
        `
        SUM(
          CAST(COALESCE(order.price, 0) AS DECIMAL(18,2))
          - CAST(COALESCE(order.discount, 0) AS DECIMAL(18,2))
          + CAST(COALESCE(order.priceAdjustment, 0) AS DECIMAL(18,2))
        )
      `,
        'totalAmount',
      )
      .where(
        'order.updateStatusAt >= :start AND order.updateStatusAt <= :end',
        {
          start,
          end,
        },
      )
      // loai bo thong ke cua team có key là TEAM_1_NEW
      .andWhere('team.key NOT IN (:...keys)', { keys: [TEAM_KEY.TEAM_1_NEW] })
      .groupBy('order.status');

    const queryBuilderOrderExpenseTeam1New = this.orderRepository
      .createQueryBuilder('order')
      .leftJoin('order.team', 'team')
      .select('order.status', 'status')
      .addSelect('COUNT(*)', 'totalCount')
      .addSelect(
        `
        SUM(
          CAST(COALESCE(order.price, 0) AS DECIMAL(18,2))
          - CAST(COALESCE(order.discount, 0) AS DECIMAL(18,2))
          + CAST(COALESCE(order.priceAdjustment, 0) AS DECIMAL(18,2))
        )
      `,
        'totalAmount',
      )
      .where(
        'order.updateStatusAt >= :start AND order.updateStatusAt <= :end',
        {
          start,
          end,
        },
      )
      // thong ke cua team có key là TEAM_1_NEW
      .andWhere('team.key = :key', { key: TEAM_KEY.TEAM_1_NEW })
      .groupBy('order.status');

    const teamExpenseBuilder = this.orderRepository
      .createQueryBuilder('order')
      .innerJoin('order.team', 'team')
      .select('team.id', 'teamId')
      .addSelect('team.name', 'teamName')
      .addSelect(
        `
        SUM(
          CAST(COALESCE(order.price, 0) AS DECIMAL(18,2))
          - CAST(COALESCE(order.discount, 0) AS DECIMAL(18,2))
          + CAST(COALESCE(order.priceAdjustment, 0) AS DECIMAL(18,2))
        )
      `,
        'totalAmount',
      )
      .where(
        'order.updateStatusAt >= :start AND order.updateStatusAt <= :end',
        {
          start,
          end,
        },
      )
      .andWhere('order.status IN (:...statuses)', {
        statuses: [
          ORDER_STATUS.SEOER_ORDER,
          ORDER_STATUS.CONFIRMED_BY_TEAM_LEADER,
          ORDER_STATUS.CONFIRMED_BY_PARTNER,
          ORDER_STATUS.COMPLETED_BY_PARTNER,
          ORDER_STATUS.CONFIRMED_COMPLETION_BY_SEOER,
          ORDER_STATUS.PAYMENT_APPROVED_BY_MANAGER,
          ORDER_STATUS.PAID_BY_MANAGER,
        ],
      })
      .groupBy('team.id')
      .addGroupBy('team.name');

    const [
      orderStatus,
      userStatus,
      domainStatus,
      orderExpense,
      orderExpenseTeam1New,
      teamExpense,
    ] = await Promise.all([
      queryBuilderOrder.getRawMany(),
      queryBuilderUser.getRawMany(),
      queryBuilderDomain.getRawMany(),
      queryBuilderOrderExpense.getRawMany(),
      queryBuilderOrderExpenseTeam1New.getRawMany(),
      teamExpenseBuilder.getRawMany(),
    ]);

    return {
      expenseWithOrderStatus: {
        data: orderExpense,
      },
      expenseTeam1NewWithOrderStatus: {
        data: orderExpenseTeam1New,
      },
      order: {
        data: orderStatus,
      },
      user: {
        data: userStatus,
      },
      domain: {
        data: domainStatus,
      },
      teamExpense: {
        data: teamExpense,
      },
    };
  }

  async statistic2(getStatisticDto: GetStatisticDto, userId?: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId || 0 },
      relations: ['role'],
    });

    if (user && user?.role?.roleName !== ROLE.SUPER_ADMIN) {
      throw new ForbiddenException('Thao tác không hợp lệ!');
    }

    const { timeBegin, timeEnd } = getStatisticDto;

    const start = moment(timeBegin).startOf('day').toDate();
    const end = moment(timeEnd).endOf('day').toDate();

    const queryBuilderOrderExpenseByDomainPattern = this.orderRepository
      .createQueryBuilder('order')
      .innerJoin('order.domain', 'domain')
      .select(
        `
        CASE
          WHEN domain.name LIKE :pattern1 THEN :label1
          WHEN domain.name LIKE :pattern2 THEN :label2
          WHEN domain.name LIKE :pattern3 THEN :label3
          ELSE 'OTHER'
        END
      `,
        'patternType',
      )
      .addSelect('COUNT(*)', 'totalCount')
      .addSelect(
        `
        SUM(
          CAST(COALESCE(order.price, 0) AS DECIMAL(18,2))
          - CAST(COALESCE(order.discount, 0) AS DECIMAL(18,2))
          + CAST(COALESCE(order.priceAdjustment, 0) AS DECIMAL(18,2))
        )
      `,
        'totalAmount',
      )
      .where(
        'order.updateStatusAt >= :start AND order.updateStatusAt <= :end',
        {
          start,
          end,
        },
      )
      .andWhere(
        `(
          domain.name LIKE :pattern1 
          OR domain.name LIKE :pattern2 
          OR domain.name LIKE :pattern3
        )`,
        {
          pattern1: `%${DOMAIN_PATTERN.PATTERN_69VN}%`,
          pattern2: `%${DOMAIN_PATTERN.PATTERN_NH88}%`,
          pattern3: `%${DOMAIN_PATTERN.PATTERN_RR99}%`,
          label1: DOMAIN_PATTERN.PATTERN_69VN,
          label2: DOMAIN_PATTERN.PATTERN_NH88,
          label3: DOMAIN_PATTERN.PATTERN_RR99,
        },
      )
      .groupBy(
        `
        CASE
          WHEN domain.name LIKE :pattern1 THEN :label1
          WHEN domain.name LIKE :pattern2 THEN :label2
          WHEN domain.name LIKE :pattern3 THEN :label3
          ELSE 'OTHER'
        END
      `,
      );

    const [orderExpenseByDomainPattern] = await Promise.all([
      queryBuilderOrderExpenseByDomainPattern.getRawMany(),
    ]);

    return {
      expenseByDomainBranch: {
        data: orderExpenseByDomainPattern,
      },
    };
  }
}
