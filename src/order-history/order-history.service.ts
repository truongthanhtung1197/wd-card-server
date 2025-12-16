import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetOrderHistoriesDto } from './dto/get-order-history.dto';
import { OrderHistory } from './entities/order-history.entity';

@Injectable()
export class OrderHistoryService {
  constructor(
    @InjectRepository(OrderHistory)
    private orderHistoryRepository: Repository<OrderHistory>,
  ) {}

  async findAll(params: GetOrderHistoriesDto) {
    const {
      page = 1,
      limit = 10,
      orderId,
      type,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = params;

    const queryBuilder =
      this.orderHistoryRepository.createQueryBuilder('order_histories');

    // Join with related entities
    queryBuilder.leftJoinAndSelect('order_histories.order', 'order');
    queryBuilder.leftJoinAndSelect('order_histories.user', 'user');

    // Apply filters
    if (orderId) {
      queryBuilder.andWhere('order_histories.orderId = :orderId', { orderId });
    }

    if (type) {
      queryBuilder.andWhere('order_histories.type = :type', { type });
    }

    // Apply sorting and pagination
    queryBuilder.orderBy(`order_histories.${sortBy}`, sortOrder);
    queryBuilder.skip((Number(page) - 1) * Number(limit));
    queryBuilder.take(Number(limit));

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }
}
