import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { FILE_RELATION_TYPE } from 'src/shared/constants/file.constant';
import { IsNull, Repository } from 'typeorm';
import { GetNotificationsDto } from './dto/get-notification.dto';
import { Notification } from './entities/notification.entity';
import { NOTIFICATION_TYPE } from './notification.constant';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  baseGetAllQueryBuilder({
    page = 1,
    limit = 50,
    sortBy = 'createdAt',
    sortOrder = 'DESC',
    type,
    search,
  }: GetNotificationsDto) {
    const queryBuilder =
      this.notificationRepository.createQueryBuilder('notifications');

    queryBuilder
      .leftJoinAndSelect('notifications.sender', 'sender')
      .leftJoinAndSelect(
        'sender.fileRelations',
        'senderFileRelations',
        'senderFileRelations.relatedType = :type AND senderFileRelations.relatedId = sender.id',
        {
          type: FILE_RELATION_TYPE.USER_AVATAR,
        },
      )
      .leftJoinAndSelect('senderFileRelations.file', 'senderFile');

    queryBuilder
      .leftJoinAndSelect('notifications.receiver', 'receiver')
      .leftJoinAndSelect(
        'receiver.fileRelations',
        'receiverFileRelations',
        'receiverFileRelations.relatedType = :type AND receiverFileRelations.relatedId = receiver.id',
        {
          type: FILE_RELATION_TYPE.USER_AVATAR,
        },
      )
      .leftJoinAndSelect('receiverFileRelations.file', 'receiverFile');

    queryBuilder.orderBy(`notifications.${sortBy}`, sortOrder);
    queryBuilder.skip((Number(page) - 1) * Number(limit));
    queryBuilder.take(limit);

    if (type) {
      queryBuilder.andWhere('notifications.type = :type', { type });
    }

    if (search) {
      queryBuilder.andWhere('notifications.message LIKE :search', {
        search: `%${search}%`,
      });
    }

    return queryBuilder;
  }

  async findWithPagination(
    params: GetNotificationsDto & { receiverId: number },
  ) {
    const { receiverId, ...rest } = params;

    const queryBuilder = this.baseGetAllQueryBuilder(rest);
    queryBuilder.andWhere('notifications.receiverId = :receiverId', {
      receiverId,
    });

    const [notifications, total] = await queryBuilder.getManyAndCount();

    return {
      data: notifications,
      total,
      limit: params.limit,
      page: params.page,
    };
  }

  async createNotification(dto: {
    senderId?: number | null;
    receiverId: number;
    message: string;
    type?: NOTIFICATION_TYPE | string;
    metadata?: any;
  }) {
    const entity = this.notificationRepository.create({
      senderId: dto.senderId ?? null,
      receiverId: dto.receiverId,
      message: dto.message,
      type: dto.type as any,
      metadata: dto.metadata ?? null,
      readAt: null,
    });
    const saved = await this.notificationRepository.save(entity);
    this.eventEmitter.emit('notification.created', saved);
    return saved;
  }

  async findUnread(userId: number) {
    return this.notificationRepository.find({
      where: { receiverId: userId, readAt: IsNull() },
      order: { createdAt: 'DESC' as const },
    });
  }

  async markAsRead(notificationId: number, userId: number) {
    await this.notificationRepository.update(
      { id: notificationId, receiverId: userId },
      { readAt: new Date() },
    );
  }

  async readAll(params: { receiverId: number }) {
    const { receiverId } = params;
    await this.notificationRepository.update(
      { receiverId },
      { readAt: new Date() },
    );
  }

  async readById(params: { receiverId: number; id: number }) {
    const { receiverId, id } = params;
    await this.notificationRepository.update(
      { receiverId, id },
      { readAt: new Date() },
    );
  }
}
