import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { toNumber, uniq } from 'lodash';
import { Domain } from 'src/domain/entities/domain.entity';
import { ROLE } from 'src/role/role.constant';
import { DOMAIN_ORDER_STATUS } from 'src/shared/constants/domain-order.constant';
import { DOMAIN_STATUS } from 'src/shared/constants/domain.constant';
import { AbstractTransactionService } from 'src/shared/services/abstract-transaction.service';
import { TeamMember } from 'src/team-member/entities/team-member.entity';
import { User } from 'src/user/entities/user.entity';
import { parse, parse as parseTld } from 'tldts';
import {
  DataSource,
  EntityManager,
  In,
  IsNull,
  Not,
  Repository,
} from 'typeorm';
import { CreateDomainOrderListDto } from './dto/create-domain-order.dto';
import { GetDomainOrdersDto } from './dto/get-domain-order.dto';
import {
  UpdateDomainDetailStatusDto,
  UpdateDomainOrderDetailDto,
  UpdateDomainOrderDto,
  UpdateDomainOrderPriceDto,
  UpdateDomainOrderStatusDto,
  UpdateDomainPriceByTldDto,
  UpdateDomainStatusByTldDto,
} from './dto/update-domain-order.dto';

import { isNotNilOrEmpty } from 'ramda-adjunct';
import { DomainOrder } from './entities/domain-order.entity';
@Injectable()
export class DomainOrderService extends AbstractTransactionService {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    @InjectRepository(DomainOrder)
    private readonly domainOrderRepo: Repository<DomainOrder>,
    @InjectRepository(Domain)
    private readonly domainRepo: Repository<Domain>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(TeamMember)
    private readonly teamMemberRepo: Repository<TeamMember>,
  ) {
    super(dataSource);
  }

  async isExistDomains(domainNames: string[]) {
    const domains = await this.domainRepo.find({
      where: { name: In(domainNames) },
    });

    if (isNotNilOrEmpty(domains)) {
      const domainNames = domains.map((domain) => domain.name);

      throw new NotFoundException(
        `Lỗi! ${domainNames.length} domain đã tồn tại trong hệ thống: ${uniq(domainNames).join(', ')}`,
      );
    }
    return true;
  }

  async create(createDto: CreateDomainOrderListDto, requester: User) {
    return await this.executeInTransaction(async (queryRunner, manager) => {
      const user = await this.userRepo.findOne({
        where: { id: requester.id },
        relations: ['role'],
      });
      if (!user) throw new NotFoundException('User not found');

      await this.isExistDomains(
        createDto.orderItems.map((item) => item.domainName),
      );

      const order = manager.create(DomainOrder, {
        orderByUserId: requester.id,
        price: 0,
        status: DOMAIN_ORDER_STATUS.REQUESTED,
        description: createDto.description,
      });
      const savedOrder = await manager.save(DomainOrder, order);

      let teamId: any = createDto.teamId;
      if (
        (user?.role?.roleName === ROLE.TEAM_LEADER ||
          user?.role?.roleName === ROLE.VICE_TEAM_LEADER) &&
        !createDto.teamId
      ) {
        // check teamId
        const team = await manager.findOne(TeamMember, {
          where: { userId: user.id, deletedAt: IsNull() },
        });
        if (!team) throw new NotFoundException('Team not found');
        teamId = team.teamId;
      }

      const domains = (createDto.orderItems || []).map((item) =>
        manager.create(Domain, {
          name: item.domainName,
          type: item.domainType,
          status: DOMAIN_STATUS.REQUEST_BUY,
          domainOrderId: savedOrder.id,
          userId: requester.id,
          teamId,
        }),
      );
      await manager.save(Domain, domains);
      try {
        const by =
          user?.displayName || user?.username || `User ${requester?.id}`;
        const text = [
          `📢 Có yêu cầu mua domain mới!`,
          '',
          `🧾 Mã đơn: #${savedOrder.id}`,
          '',
          createDto?.description ? `📝 Mô tả: ${createDto.description}` : '',
          '',
          `👤 Người yêu cầu: ${by}`,
          '',
          `🔢 Số lượng: ${(createDto.orderItems || []).length}`,
        ]
          .filter(Boolean)
          .join('\n');
        await this.sendTelegramMessageForDomainOrder(text);
      } catch (e) {}

      return await manager.findOne(DomainOrder, {
        where: { id: savedOrder.id },
      });
    });
  }

  async findWithPagination(params: GetDomainOrdersDto & { userId?: number }) {
    const {
      page = 1,
      limit = 10,
      status,
      orderCode,
      timeBegin,
      timeEnd,
      userId,
      proposeCode,
      search,
    } = params;

    const qb = this.domainOrderRepo
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.user', 'user')
      .loadRelationCountAndMap('o.domainsCount', 'o.domains')
      .orderBy('o.createdAt', 'DESC')
      .skip((Number(page) - 1) * Number(limit))
      .take(Number(limit));

    if (status?.length) qb.andWhere('o.status IN (:...status)', { status });
    if (orderCode) qb.andWhere('o.orderCode = :orderCode', { orderCode });
    if (timeBegin) qb.andWhere('o.createdAt >= :timeBegin', { timeBegin });
    if (timeEnd) qb.andWhere('o.createdAt <= :timeEnd', { timeEnd });

    if (search) {
      qb.andWhere('o.orderCode LIKE :search OR o.description LIKE :search', {
        search: `%${search}%`,
      });
    }

    if (proposeCode) {
      qb.andWhere('o.proposeCode = :proposeCode', {
        proposeCode: proposeCode,
      });
    }

    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) throw new NotFoundException('User not found');
    if (
      user?.role?.roleName === ROLE.TEAM_LEADER ||
      user?.role?.roleName === ROLE.VICE_TEAM_LEADER
    ) {
      // check team
      const teamMember = await this.teamMemberRepo.findOne({
        where: { userId: user.id, deletedAt: IsNull() },
      });
      if (!teamMember) throw new NotFoundException('Team not found');
      qb.andWhere('o.orderByUserId = :userId', { userId: teamMember.userId });
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data, // mỗi item có thêm field o.domainsCount
      total,
      limit: Number(limit),
      page: Number(page),
    };
  }

  normalizeTld(input: string): string {
    const t = (input || '').trim().toLowerCase();
    return t.startsWith('.') ? t : `.${t}`;
  }

  async updateDomainPriceByTld(
    domainOrderId: string,
    dto: UpdateDomainPriceByTldDto,
  ) {
    return this.executeInTransaction(async (queryRunner, manager) => {
      const targetTld = this.normalizeTld(dto.tld); // ".com" / ".com.vn" ...
      if (!targetTld || targetTld === '.') {
        throw new BadRequestException('Invalid TLD');
      }

      // Lấy các trường cần thiết; bạn có thể thêm điều kiện where theo team/user nếu muốn giới hạn phạm vi
      const candidates = await manager.find(Domain, {
        select: ['id', 'name', 'status', 'price'],
        where: { domainOrderId: +domainOrderId },
      });

      const idsToUpdate: number[] = [];
      for (const d of candidates) {
        if (!d?.name || d.status === DOMAIN_STATUS.CANCEL_BUY) continue;
        const tld = this.extractTldStrict(d.name); // tldts đảm bảo đúng chuẩn IANA/PSL
        if (!tld || tld !== targetTld) continue;

        idsToUpdate.push(d.id);
      }

      if (idsToUpdate.length === 0) {
        return { affected: 0, tld: targetTld, price: dto.price };
      }

      const updateData: Partial<Domain> = { price: dto.price as any };
      if (dto.status !== undefined) {
        (updateData as any).status = dto.status as any;
      }
      await manager.update(Domain, { id: In(idsToUpdate) }, updateData);
      await this.updateDomainOrderPrice(+domainOrderId, manager);

      return {
        status: true,
        message: 'Update domain price by TLD successfully',
      };
    });
  }

  async updateDomainStatusByTld(
    domainOrderId: string,
    dto: UpdateDomainStatusByTldDto,
  ) {
    return this.executeInTransaction(async (queryRunner, manager) => {
      const targetTld = this.normalizeTld(dto.tld);
      if (!targetTld || targetTld === '.') {
        throw new BadRequestException('Invalid TLD');
      }

      const candidates = await manager.find(Domain, {
        select: ['id', 'name', 'status'],
        where: { domainOrderId: +domainOrderId },
      });

      const idsToUpdate: number[] = [];
      for (const d of candidates) {
        if (!d?.name || d.status === DOMAIN_STATUS.CANCEL_BUY) continue;
        const tld = this.extractTldStrict(d.name);
        if (!tld || tld !== targetTld) continue;
        idsToUpdate.push(d.id);
      }

      if (idsToUpdate.length === 0) {
        return { affected: 0, tld: targetTld, status: dto.status };
      }

      await manager.update(
        Domain,
        { id: In(idsToUpdate) },
        { status: dto.status as any },
      );
      await this.updateDomainOrderPrice(+domainOrderId, manager);

      return {
        status: true,
        message: 'Update domain status by TLD successfully',
      };
    });
  }

  extractTldStrict(raw: string): string {
    // Sử dụng allowPrivateDomains: true để coi các private suffix (vd: sa.com, co.com, ...) là hợp lệ
    const parsed = parse(raw, { allowPrivateDomains: true });
    if (
      !parsed ||
      typeof parsed.publicSuffix !== 'string' ||
      parsed.publicSuffix === ''
    ) {
      return '';
    }
    // parsed.publicSuffix như "com", "co.uk", "com.vn", "sa.com" …
    return `.${parsed.publicSuffix.toLowerCase()}`;
  }

  async findOne(id: number) {
    const order = await this.domainOrderRepo.findOne({
      where: { id },
      relations: ['user', 'domains'],
    });
    const summarizeDomains = this.summarizeDomainsByTld(order?.domains || []);

    if (!order) throw new NotFoundException('Domain order not found');

    const quantity =
      order?.domains?.filter((d) => d.status !== DOMAIN_STATUS.CANCEL_BUY)
        .length || 0;
    return {
      ...order,
      domainsCount: quantity,
      summarizeDomains,
    };
  }
  //
  /**
   * Lấy đuôi domain theo PSL (ví dụ ".com", ".com.vn", ".co.uk", ...)
   * - Hỗ trợ cả input là domain thuần hoặc URL đầy đủ (có protocol, path, port)
   * - Trả về chuỗi rỗng nếu không có public suffix (vd: localhost, IP)
   */
  extractTld(hostOrUrl: string): string {
    const input = (hostOrUrl || '').trim();
    if (!input) return '';

    // parse() của tldts nhận cả "example.com" lẫn "http://example.com/path"
    const parsed = parseTld(input, {
      // Nếu bạn muốn coi cả suffix "private" (vd: appspot.com) là hợp lệ thì để true
      allowPrivateDomains: true,
    });

    // parsed.publicSuffix: "com", "com.vn", "co.uk", ...
    const suffix = parsed.publicSuffix || '';
    return suffix ? `.${suffix}` : '';
  }

  /**
   * Giữ nguyên logic gốc:
   * - Bỏ qua domain có status = CANCEL_BUY
   * - Gộp theo TLD, tính quantity & tổng amount (price)
   * - Sắp xếp quantity giảm dần, rồi amount giảm dần
   */
  summarizeDomainsByTld(domains: Domain[]) {
    const agg = new Map<string, { quantity: number; amount: number }>();

    for (const d of domains || []) {
      if (d.status === DOMAIN_STATUS.CANCEL_BUY) continue;
      if (!d?.name) continue;

      const tld = this.extractTld(d.name);
      if (!tld) continue;

      const prev = agg.get(tld) ?? { quantity: 0, amount: 0 };
      prev.quantity += 1;
      prev.amount += toNumber(d.price);
      agg.set(tld, prev);
    }

    const result = Array.from(agg.entries()).map(([type, v]) => ({
      type,
      quantity: v.quantity,
      amount: v.amount,
    }));

    result.sort((a, b) => b.quantity - a.quantity || b.amount - a.amount);
    return result;
  }

  private async sendTelegramMessageForDomainOrder(text: string) {
    const token = '7616716373:AAFOu9YJyLVCVihIcNVM2p9BsRgnW1K_J8c';
    const chatId = '-1002885960648';
    if (!token || !chatId || !text) return;
    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
      });
    } catch (e) {}
  }

  async getDomainsOfDomainOrder(domainOrderId: number) {
    const domains = await this.domainRepo.find({
      where: { domainOrderId: domainOrderId },
    });

    if (!domains) throw new NotFoundException('Domains not found');
    return domains;
  }

  async update(id: number, dto: UpdateDomainOrderDto) {
    return this.executeInTransaction(async (queryRunner, manager) => {
      const order = await manager.findOne(DomainOrder, { where: { id } });
      if (!order) throw new NotFoundException('Domain order not found');

      const newOrder = await manager.merge(DomainOrder, order, dto);
      await manager.save(newOrder);
      await this.updateDomainOrderPrice(id, manager);
      if (dto.teamId) {
        const domain = await manager.findOne(Domain, {
          where: { domainOrderId: id },
        });
        if (!domain) throw new NotFoundException('Domain not found');
        await manager.update(
          Domain,
          { domainOrderId: id },
          { teamId: dto.teamId },
        );
      }
      return this.findOne(id);
    });
  }

  async updateDomainOrderPrice(domainOrderId: number, manager: EntityManager) {
    const order = await manager.findOne(DomainOrder, {
      where: { id: domainOrderId },
    });
    if (!order) throw new NotFoundException('Domain order not found');

    const domains = await manager.find(Domain, {
      where: { domainOrderId, status: Not(DOMAIN_STATUS.CANCEL_BUY) },
    });

    order.price = domains.reduce(
      (total, domain) => total + (Number(domain.price) || 0),
      0,
    );
    await manager.save(order);
    return true;
  }

  async updateDomainDetail(id: number, dto: UpdateDomainOrderDetailDto) {
    return this.executeInTransaction(async (queryRunner, manager) => {
      const domain = await manager.findOne(Domain, { where: { id } });
      if (!domain) throw new NotFoundException('Domain order not found.');

      const updatedDomain = await manager.merge(Domain, domain, {
        ...dto,
        price:
          dto.status === DOMAIN_STATUS.CANCEL_BUY
            ? 0
            : dto.price === undefined
              ? domain.price
              : dto.price,
      });
      await manager.update(Domain, id, updatedDomain);
      if (domain.domainOrderId) {
        await this.updateDomainOrderPrice(domain.domainOrderId, manager);
      }
      return {
        status: true,
      };
    });
  }

  async updateStatus(id: number, dto: UpdateDomainOrderStatusDto) {
    const order = await this.domainOrderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Domain order not found');
    order.status = dto.status;
    await this.domainOrderRepo.save(order);
    return this.findOne(id);
  }

  async updatePrice(id: number, dto: UpdateDomainOrderPriceDto) {
    const order = await this.domainOrderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Domain order not found');
    order.price = Number(dto.price || 0);
    await this.domainOrderRepo.save(order);
    return this.findOne(id);
  }

  async updateDomainDetailStatus(
    orderId: number,
    domainId: number,
    dto: UpdateDomainDetailStatusDto,
  ) {
    const domain = await this.domainRepo.findOne({ where: { id: domainId } });
    if (!domain) throw new NotFoundException('Domain not found');
    if (Number(domain.domainOrderId) !== Number(orderId)) {
      throw new ForbiddenException('Domain does not belong to this order');
    }
    domain.status = dto.status;
    await this.domainRepo.save(domain);
    return await this.findOne(orderId);
  }

  // async deleteDomainDetail(orderId: number, domainId: number) {
  //   const domain = await this.domainRepo.findOne({ where: { id: domainId } });
  //   if (!domain) throw new NotFoundException('Domain not found');
  //   if (Number(domain.domainOrderId) !== Number(orderId)) {
  //     throw new ForbiddenException('Domain does not belong to this order');
  //   }
  //   await this.domainRepo.softDelete(domainId);
  //   return { message: 'Domain removed from order', success: true };
  // }
}
