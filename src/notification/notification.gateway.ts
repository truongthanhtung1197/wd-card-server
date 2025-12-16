import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { Server, Socket } from 'socket.io';
import { NotificationService } from './notification.service';

const NOTIFICATION_NAMESPACE = '/notifications';
const USER_ROOM_PREFIX = 'user_';

@Injectable()
@WebSocketGateway({
  namespace: NOTIFICATION_NAMESPACE,
  cors: true,
  transports: ['websocket'],
})
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly notificationService: NotificationService,
  ) {}

  afterInit(server: Server) {
    // Optional Redis adapter for horizontal scaling
    const redisHost = this.configService.get<string>('REDIS_HOST');
    const redisPort = this.configService.get<number>('REDIS_PORT');
    if (redisHost && redisPort) {
      const pubClient = new Redis({ host: redisHost, port: Number(redisPort) });
      const subClient = pubClient.duplicate();
      server.adapter(createAdapter(pubClient, subClient));
      this.logger.log('Socket.IO Redis adapter enabled');
    } else {
      this.logger.log('Socket.IO running without Redis adapter');
    }
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {
    try {
      const userId = this.authenticateSocket(socket);
      const room = this.getUserRoom(userId);
      socket.join(room);
      socket.data.user = { id: userId };
      this.logger.log(`Client connected and joined room ${room}`);

      // Optionally send initial unread notifications
      try {
        const unread = await this.notificationService.findUnread(userId);
        if (unread.length) {
          socket.emit('notification.init', unread);
        }
      } catch (e) {
        // ignore
      }
    } catch (error) {
      this.logger.warn(`Client connection rejected: ${error?.message}`);
      socket.disconnect(true);
    }
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log('Client disconnected');
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { id: number },
    @ConnectedSocket() socket: Socket,
  ) {
    const userId: number | undefined = socket?.data?.user?.id;
    if (!userId) return;
    if (!data?.id) return;
    await this.notificationService.markAsRead(data.id, userId);
  }

  // Event bridge: when a notification is created, push to the target user's room
  @OnEvent('notification.created', { async: true })
  onNotificationCreated(payload: { receiverId: number; [k: string]: any }) {
    try {
      this.sendToUser(payload.receiverId, payload);
    } catch (e) {
      this.logger.error(
        `Failed to emit notification to user ${payload.receiverId}`,
      );
    }
  }

  sendToUser(userId: number, payload: unknown) {
    const room = this.getUserRoom(userId);
    this.server.to(room).emit('notification', payload);
  }

  private getUserRoom(userId: number) {
    return `${USER_ROOM_PREFIX}${userId}`;
  }

  private authenticateSocket(socket: Socket): number {
    const authToken = (socket.handshake.auth as any)?.token;
    const authHeader = socket.handshake.headers?.authorization;

    let token = authToken;
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring('Bearer '.length);
    }

    if (!token) {
      throw new Error('Missing auth token');
    }

    const secret = this.configService.get<string>('JWT_SECRET_KEY') || '';
    const payload = this.jwtService.verify(token, { secret });
    // Support both payload.sub and payload.id
    const userId = Number(payload?.sub ?? payload?.id);
    if (!userId) throw new Error('Invalid token payload');
    return userId;
  }
}
