import { InjectQueue } from '@nestjs/bull';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import * as ExcelJS from 'exceljs';
import { isBoolean } from 'lodash';
import { Complimentary } from 'src/complimentary/entities/complimentary.entity';
import { OrderDetail } from 'src/order-detail/entities/order-detail.entity';
import { GetServiceDto } from 'src/service/dto/get-service.dto';
import { ORDER_STATUS } from 'src/shared/constants/order.constant';
import {
  DOMAIN_BOOLEAN_COLUMNS,
  DOMAIN_NUMBER_COLUMNS,
  domainMapHeaderToKey,
  PACK_BOOLEAN_FIELDS,
  PACK_HEADER_KEY_MAP,
  PACK_NUMBER_FIELDS,
  TYPE_PACK,
} from 'src/shared/constants/service.constant';
import { AbstractTransactionService } from 'src/shared/services/abstract-transaction.service';
import { User } from 'src/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateServiceDto, ImportServiceDto } from './dto/create-service.dto';
import {
  UpdateMultipleServiceStatusDto,
  UpdateServiceDto,
} from './dto/update-service.dto';
import { Service } from './entities/service.entity';
@Injectable()
export class ServiceService extends AbstractTransactionService {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(OrderDetail)
    private orderDetailRepository: Repository<OrderDetail>,
    @InjectQueue('import-queue') private importQueue: Queue,
  ) {
    super(dataSource);
  }

  async findWithPagination({
    page = 1,
    limit = 10,
    search,
    status,
    typePack,
    fieldType,
    type,
    isIndex,
    isSaleGuestPost,
    isSaleTextLink,
    isSaleBanner,
    isMyService,
    currentUser,
    partnerId,
    isShow,
    sortBy = 'createdAt',
    sortOrder = 'DESC',
  }: GetServiceDto & { isMyService?: boolean; currentUser: User }) {
    const queryBuilder = this.serviceRepository
      .createQueryBuilder('service')
      .orderBy(`service.${sortBy}`, sortOrder)
      .leftJoinAndSelect('service.user', 'user')
      .leftJoinAndSelect('service.complimentaries', 'complimentaries')
      .andWhere('user.lockedAt IS NULL')
      .andWhere('user.deletedAt IS NULL');
    if (status) {
      queryBuilder.andWhere('service.status IN (:...status)', { status });
    }

    if (typePack) {
      queryBuilder.andWhere('service.typePack IN (:...typePack)', { typePack });
    }

    if (fieldType) {
      queryBuilder.andWhere('service.fieldType IN (:...fieldType)', {
        fieldType,
      });
    }

    if (type) {
      queryBuilder.andWhere('service.type IN (:...type)', { type });
    }

    if (isBoolean(isIndex)) {
      queryBuilder.andWhere('service.isIndex = :isIndex', { isIndex });
    }

    if (isSaleGuestPost) {
      queryBuilder.andWhere('service.isSaleGuestPost = :isSaleGuestPost', {
        isSaleGuestPost,
      });
    }

    if (isSaleTextLink) {
      queryBuilder.andWhere('service.isSaleTextLink = :isSaleTextLink', {
        isSaleTextLink,
      });
    }

    if (isSaleBanner) {
      queryBuilder.andWhere('service.isSaleBanner = :isSaleBanner', {
        isSaleBanner,
      });
    }

    if (isBoolean(isShow)) {
      queryBuilder.andWhere('service.isShow = :isShow', { isShow });
    }

    if (isMyService) {
      queryBuilder.andWhere('service.userId = :userId', {
        userId: currentUser.id,
      });
    }

    if (partnerId && !!Number(partnerId)) {
      queryBuilder.andWhere('service.userId = :userId', {
        userId: partnerId,
      });
    }

    if (search) {
      queryBuilder.andWhere('service.name LIKE :search', {
        search: `%${search?.trim()}%`,
      });
    }

    queryBuilder.skip((Number(page) - 1) * Number(limit)).take(limit);

    const [services, total] = await queryBuilder.getManyAndCount();

    return {
      data: services,
      total,
      limit,
      page,
    };
  }

  async findOne(id: number) {
    return this.serviceRepository.findOne({
      where: { id },
      relations: ['complimentaries', 'user'],
    });
  }

  async create(createServiceDto: CreateServiceDto, userId: number) {
    return this.executeInTransaction(async (queryRunner, manager) => {
      const { complimentaries, ...serviceData } = createServiceDto;

      if (createServiceDto.typePack === TYPE_PACK.CONTENT) {
        const existingService = await manager.findOneBy(Service, {
          userId: userId,
          typePack: TYPE_PACK.CONTENT,
        });
        if (existingService) {
          throw new BadRequestException('Content Service already exists');
        }
      }
      const newService = manager.create(Service, {
        ...serviceData,
        price: serviceData.price || 0,
      });
      newService.userId = userId;

      const savedService = await manager.save(newService);

      if (complimentaries && complimentaries.length > 0) {
        const complimentaryData = complimentaries.map((complimentary) => ({
          name: complimentary,
          serviceId: savedService.id,
        }));
        await manager.save(Complimentary, complimentaryData);
      }

      return await manager.findOne(Service, {
        where: { id: savedService.id },
        relations: ['complimentaries'],
      });
    });
  }

  async enqueueImportJob(
    services: CreateServiceDto[],
    userId: number,
    body: ImportServiceDto,
  ) {
    try {
      const batchSize = 1000;
      for (let i = 0; i < services.length; i += batchSize) {
        const chunk = services.slice(i, i + batchSize);
        await this.importQueue.add(
          'import-services-job',
          {
            services: chunk,
            userId,
            typePack: body?.typePack,
          },
          {
            attempts: 2,
            backoff: 5000,
            removeOnComplete: true,
            timeout: 30000,
          },
        );
      }

      return { success: true, message: 'JOB_ENQUEUED' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async parseDomainExcel(buffer: Buffer): Promise<CreateServiceDto[]> {
    try {
      const workbook = new ExcelJS.Workbook();

      const nodeBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
      await workbook.xlsx.load(nodeBuffer as any);

      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) {
        throw new Error('Lỗi định dạng file');
      }

      const headerRow = worksheet.getRow(1);
      const headerValues = headerRow.values;

      if (!headerValues) {
        throw new Error('Không tìm thấy dòng tiêu đề trong Excel');
      }

      let headers: string[];
      if (Array.isArray(headerValues)) {
        headers = headerValues
          .slice(1)
          .filter((val): val is string | number => val != null)
          .map((val) => String(val).trim());
      } else {
        throw new Error('Không tìm thấy dòng tiêu đề hợp lệ trong Excel');
      }

      const result: CreateServiceDto[] = [];

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber <= 1) return; // Bỏ qua header

        const rowValues = Array.isArray(row.values) ? row.values.slice(1) : [];
        const rowData: any = {};

        headers.forEach((header, index) => {
          const key = domainMapHeaderToKey(header);
          if (!key) return;

          let value: any = rowValues[index];

          // ✅ Nếu là hyperlink object
          if (
            value &&
            typeof value === 'object' &&
            'text' in value &&
            'hyperlink' in value
          ) {
            value = value.text?.trim();
          }

          // ✅ Nếu là sharedFormula object
          if (value && typeof value === 'object' && 'sharedFormula' in value) {
            value = value.result;
          }

          // ✅ Nếu là cell formula object: { formula: '...', result: ... }
          if (
            value &&
            typeof value === 'object' &&
            'formula' in value &&
            'result' in value
          ) {
            value = value.result;
          }

          // ✅ Nếu vẫn là string → trim
          if (typeof value === 'string') {
            value = value.trim();
          }

          // ✅ Xử lý boolean
          if (DOMAIN_BOOLEAN_COLUMNS.includes(key)) {
            if (typeof value === 'string') value = value.toUpperCase();
            rowData[key] = value === 'TRUE' || value === true;
          }
          // ✅ Xử lý number
          else if (DOMAIN_NUMBER_COLUMNS.includes(key)) {
            rowData[key] =
              value !== '' && value !== undefined ? Number(value) : undefined;
          }
          // ✅ Các loại khác giữ nguyên
          else {
            rowData[key] = value;
          }
        });

        if (rowData.name && rowData.fieldType) {
          result.push(rowData);
        }
      });

      return result;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Lỗi định dạng file');
    }
  }

  async parsePackExcel(buffer: Buffer): Promise<CreateServiceDto[]> {
    try {
      const workbook = new ExcelJS.Workbook();
      const nodeBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
      await workbook.xlsx.load(nodeBuffer as any);

      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) throw new Error('Không tìm thấy sheet đầu tiên');

      const headerRow = worksheet.getRow(1);
      const headerValues = headerRow.values;

      if (!headerValues) {
        throw new Error('Không tìm thấy dòng tiêu đề trong Excel');
      }

      let headers: string[];
      if (Array.isArray(headerValues)) {
        headers = headerValues
          .slice(1)
          .filter((val): val is string | number => val != null)
          .map((val) => String(val).trim());
      } else {
        throw new Error('Không tìm thấy dòng tiêu đề hợp lệ trong Excel');
      }

      const result: CreateServiceDto[] = [];

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber <= 2) return; // Bỏ qua header & dòng hướng dẫn

        const rowValues = Array.isArray(row.values) ? row.values.slice(1) : [];
        const rowData: any = {};

        headers.forEach((headerLabel, index) => {
          const key = PACK_HEADER_KEY_MAP[headerLabel];
          if (!key) return;

          let value: any = rowValues[index];

          // ✅ Nếu là hyperlink object
          if (
            value &&
            typeof value === 'object' &&
            'text' in value &&
            'hyperlink' in value
          ) {
            value = value.text?.trim();
          }

          // ✅ Nếu là sharedFormula object
          if (value && typeof value === 'object' && 'sharedFormula' in value) {
            value = value.result;
          }

          // ✅ Nếu là cell formula object
          if (
            value &&
            typeof value === 'object' &&
            'formula' in value &&
            'result' in value
          ) {
            value = value.result;
          }

          // ✅ Nếu là string → trim
          if (typeof value === 'string') {
            value = value.trim();
          }

          if (PACK_BOOLEAN_FIELDS.includes(key)) {
            if (typeof value === 'string') value = value.toUpperCase();
            rowData[key] = value === 'TRUE' || value === true;
          } else if (PACK_NUMBER_FIELDS.includes(key)) {
            rowData[key] =
              value !== '' && value !== undefined ? Number(value) : 0;
          } else if (key === 'complimentaries') {
            rowData[key] = value
              ? String(value)
                  .split('|')
                  .map((v) => v.trim())
                  .filter(Boolean)
              : undefined;
          } else {
            rowData[key] = value;
          }
        });

        if (rowData.name && rowData.type && rowData.price && rowData.urlDemo) {
          result.push(rowData as CreateServiceDto);
        }
      });
      return result;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Lỗi định dạng file');
    }
  }

  async importService(
    services: CreateServiceDto[],
    userId: number,
    typePack: TYPE_PACK,
  ) {
    for (const service of services) {
      let _newService;

      try {
        const { complimentaries, ...serviceData } = service;
        const newService = this.serviceRepository.create({
          ...serviceData,
          price: service.price || 0,
          userId: userId,
          typePack: typePack,
        });
        _newService = newService;
        await this.serviceRepository.save(newService);
      } catch (error) {
        //
      }
    }
  }

  async update(serviceId: number, updateServiceDto: UpdateServiceDto) {
    return this.executeInTransaction(async (queryRunner, manager) => {
      const { complimentaries, ...serviceData } = updateServiceDto;
      const service = await manager.findOneBy(Service, { id: serviceId });

      if (!service) {
        throw new NotFoundException('Service not found');
      }

      if (complimentaries && complimentaries.length > 0) {
        await manager.delete(Complimentary, { serviceId: serviceId });
        const complimentaryData = complimentaries.map((complimentary) => ({
          name: complimentary,
          serviceId: serviceId,
        }));
        await manager.save(Complimentary, complimentaryData);
      }

      const updated = manager.merge(Service, service, serviceData);
      await manager.save(updated);

      return await manager.findOne(Service, {
        where: { id: serviceId },
        relations: ['complimentaries'],
      });
    });
  }

  async updateMultipleStatus(updateServiceDto: UpdateMultipleServiceStatusDto) {
    const { ids, status } = updateServiceDto;

    return this.executeInTransaction(async (queryRunner, manager) => {
      const result = await manager
        .createQueryBuilder()
        .update(Service)
        .set({ status })
        .whereInIds(ids)
        .execute();

      return {
        success: true,
        affected: result.affected ?? 0,
        message: 'Services status updated successfully',
      };
    });
  }

  async remove(serviceId: number) {
    const service = await this.serviceRepository.findOneBy({ id: serviceId });
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // kiểm tra xem tất cả đơn hàng của dịch vụ này đã được hoàn thành
    const orderDetails = await this.orderDetailRepository.find({
      where: { serviceId: serviceId },
      relations: ['order'],
    });

    // Các trạng thái được coi là đã hoàn tất
    const finalStatuses = [
      ORDER_STATUS.PAID_BY_MANAGER,
      ORDER_STATUS.CANCELLED_BY_MANAGER,
      ORDER_STATUS.CANCELLED_BY_SEOER,
      ORDER_STATUS.REJECTED_BY_TEAM_LEADER,
    ];

    // Kiểm tra xem có orderDetail nào có order chưa ở trạng thái hoàn tất không
    const hasIncompleteOrders = orderDetails.find(
      (orderDetail) => !finalStatuses.includes(orderDetail.order?.status),
    );

    if (hasIncompleteOrders) {
      throw new ForbiddenException(
        `Không thể xóa dịch vụ này vì vẫn còn đơn hàng chưa hoàn thành. Một trong số đó có đơn hàng ${hasIncompleteOrders?.order?.orderCode}`,
      );
    }

    await this.serviceRepository.softDelete({
      id: serviceId,
    });
    return {
      id: serviceId,
      success: true,
      message: 'Service deleted successfully',
    };
  }
}
