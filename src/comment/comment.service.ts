import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { CreateCommentDto } from 'src/comment/dto/create-comment.dto';
import { FileRelation } from 'src/file-relation/entities/file-relation.entity';
import { File } from 'src/file/entities/file.entity';
import { Notification } from 'src/notification/entities/notification.entity';
import { NOTIFICATION_TYPE } from 'src/notification/notification.constant';
import { Order } from 'src/order/entities/order.entity';
import { ROLE } from 'src/role/role.constant';
import { FILE_RELATION_TYPE } from 'src/shared/constants/file.constant';
import { AbstractTransactionService } from 'src/shared/services/abstract-transaction.service';
import { User } from 'src/user/entities/user.entity';
import { DataSource, In, Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
@Injectable()
export class CommentService extends AbstractTransactionService {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    @InjectRepository(FileRelation)
    private fileRelationRepository: Repository<FileRelation>,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super(dataSource);
  }

  async findAllOrderComments(orderId?: number) {
    const comments = await this.commentRepository
      .createQueryBuilder('comment')
      .where('comment.orderId = :orderId', { orderId })
      .orderBy('comment.createdAt', 'DESC')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect(
        'user.fileRelations',
        'userFileRelations',
        'userFileRelations.relatedType = :userFileRelationstType AND userFileRelations.relatedId = comment.userId',
        {
          userFileRelationstType: FILE_RELATION_TYPE.USER_AVATAR,
        },
      )
      .leftJoinAndSelect('userFileRelations.file', 'userFile')
      .leftJoinAndSelect(
        'comment.fileRelations',
        'commentFileRelations',
        'commentFileRelations.relatedType = :type AND commentFileRelations.relatedId = comment.id',
        {
          type: FILE_RELATION_TYPE.ORDER_COMMENT,
        },
      )
      .leftJoinAndSelect('commentFileRelations.file', 'file')
      .getMany();

    return plainToInstance(Comment, comments);
  }

  detectTaggedUsers(comment: string): string[] {
    const regex = /@([a-zA-Z0-9_]+)/g;
    const matches: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(comment)) !== null) {
      matches.push(match[0]); // match[0] = "@username"
    }

    return matches;
  }

  async createOderComment(
    createCommentDto: CreateCommentDto,
    currentUser: User,
    orderId: number,
  ) {
    return this.executeInTransaction(async (queryRunner, manager) => {
      const order = await manager.findOne(Order, {
        where: { id: orderId },
      });
      if (!order) {
        throw new NotFoundException('Order not found');
      }

      const comment = await manager.save(Comment, {
        ...createCommentDto,
        userId: currentUser.id,
        orderId: orderId,
      });

      const telegramUser = this.detectTaggedUsers(createCommentDto.content);

      // get user by telegram_username
      const taggedUsers = await manager.find(User, {
        select: ['id', 'telegramUsername'],
        where: { telegramUsername: In(telegramUser) },
      });

      const newNotifications = taggedUsers.map((user) => {
        return manager.create(Notification, {
          receiverId: user.id,
          type: NOTIFICATION_TYPE.MENTION,
          message: '-',
          senderId: currentUser.id,
          metadata: {
            orderId: orderId,
            commentId: comment.id,
          },
        });
      });

      const savedNotifications = await manager.save(
        Notification,
        newNotifications,
      );

      const fileId = createCommentDto.fileId;

      if (fileId) {
        const file = await manager.findOne(File, {
          where: { id: fileId },
        });
        if (!file) {
          throw new NotFoundException('File không tồn tại');
        }

        const fileRelation = await manager.findOne(FileRelation, {
          where: {
            fileId,
            relatedId: comment.id,
            relatedType: FILE_RELATION_TYPE.ORDER_COMMENT,
          },
        });
        if (fileRelation) {
          await manager.delete(FileRelation, fileRelation.id);
        }

        const newFileRelation = manager.create(FileRelation, {
          fileId,
          relatedId: comment.id,
          relatedType: FILE_RELATION_TYPE.ORDER_COMMENT,
        });
        await manager.save(FileRelation, newFileRelation);
      }

      const queryBuilder = manager
        .createQueryBuilder(Comment, 'comment')
        .where('comment.id = :id', { id: comment.id });
      queryBuilder.leftJoinAndSelect(
        'comment.fileRelations',
        'fileRelations',
        'fileRelations.relatedType = :type AND fileRelations.relatedId = comment.id',
        {
          type: FILE_RELATION_TYPE.ORDER_COMMENT,
        },
      );
      queryBuilder.leftJoinAndSelect('fileRelations.file', 'file');

      const result = await queryBuilder.getOne();

      // Emit để Gateway đẩy realtime tới FE
      for (const n of savedNotifications) {
        const res = this.eventEmitter.emit('notification.created', n);
      }
      return result;
    });
  }

  async remove(id: number, user: User) {
    return this.executeInTransaction(async (queryRunner, manager) => {
      const requester = await manager.findOne(User, {
        where: { id: user.id },
        relations: ['role'],
      });
      if (
        !requester ||
        ![ROLE.MANAGER, ROLE.ASSISTANT, ROLE.SUPER_ADMIN].includes(
          requester?.role?.roleName as ROLE,
        )
      ) {
        throw new NotFoundException(
          'You do not have permission to delete this comment',
        );
      }
      const comment = await manager.findOne(Comment, {
        where: { id },
      });
      if (!comment) {
        throw new NotFoundException('Comment not found');
      }
      await manager.softDelete(Comment, id);
    });
  }
}
