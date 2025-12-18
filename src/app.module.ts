import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { CustomerModule } from './customer/customer.module';
import { DbModule } from './db/db.module';
import { MediaModule } from './media/media.module';
import { OrderModule } from './order/order.module';
import { PackageFeatureModule } from './package-feature/package-feature.module';
import { PackageModule } from './package/package.module';
import { RsvpModule } from './rsvp/rsvp.module';
import { SalesModule } from './sales/sales.module';
import { UserRoleModule } from './user-role/user-role.module';
import { UserModule } from './user/user.module';
import { WeddingFriendModule } from './wedding-friend/wedding-friend.module';
import { WeddingModule } from './wedding/wedding.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DbModule,
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
    CustomerModule,
    PackageModule,
    PackageFeatureModule,
    SalesModule,
    OrderModule,
    UserRoleModule,
    WeddingModule,
    WeddingFriendModule,
    RsvpModule,
    MediaModule,
  ],
  controllers: [],
  // providers: [TelegramService],
})
export class AppModule {}
