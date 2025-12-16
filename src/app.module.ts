import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CartDetailModule } from 'src/cart-detail/cart-detail.module';
import { CartModule } from 'src/cart/cart.module';
import { CommentModule } from 'src/comment/comment.module';
import { ComplimentaryModule } from 'src/complimentary/complimentary.module';
import { DomainOrderModule } from 'src/domain-order/domain-order.module';
import { OrderDetailModule } from 'src/order-detail/order-detail.module';
import { OrderHistoryModule } from 'src/order-history/order-history.module';
import { TeamMemberModule } from 'src/team-member/team-member.module';
import { TeamModule } from 'src/team/team.module';
import { TelegramService } from 'src/telegram/telegram.service';
import { AuthModule } from './auth/auth.module';
import { DbModule } from './db/db.module';
import { DomainModule } from './domain/domain.module';
import { FileRelationModule } from './file-relation/file-relation.module';
import { FileModule } from './file/file.module';
import { NotificationModule } from './notification/notification.module';
import { OrderModule } from './order/order.module';
import { RoleModule } from './role/role.module';
import { ServiceModule } from './service/service.module';
import { StatisticModule } from './statistic/statistic.module';
import { UserDomainModule } from './user-domain/user-domain.module';
import { UserReviewModule } from './user-review/user-review.module';
import { UserModule } from './user/user.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'src', 'images'),
      serveRoot: '/images',
    }),
    DbModule,
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
    RoleModule,
    OrderModule,
    ServiceModule,
    DomainModule,
    ComplimentaryModule,
    CartModule,
    CartDetailModule,
    FileModule,
    FileRelationModule,
    CommentModule,
    TeamModule,
    TeamMemberModule,
    StatisticModule,
    UserDomainModule,
    UserReviewModule,
    OrderDetailModule,
    OrderHistoryModule,
    NotificationModule,
    DomainOrderModule,
  ],
  controllers: [],
  providers: [TelegramService],
})
export class AppModule {}
