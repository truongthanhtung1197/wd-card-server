import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { User } from 'src/user/entities/user.entity';
import { UserRole } from 'src/user-role/entities/user-role.entity';
import { Wedding } from 'src/wedding/entities/wedding.entity';
import { WeddingFriend } from './entities/wedding-friend.entity';
import { WeddingFriendController } from './wedding-friend.controller';
import { WeddingFriendService } from './wedding-friend.service';

@Module({
  imports: [TypeOrmModule.forFeature([WeddingFriend, Wedding, User, UserRole])],
  controllers: [WeddingFriendController],
  providers: [WeddingFriendService, RolesGuard],
  exports: [WeddingFriendService],
})
export class WeddingFriendModule {}

