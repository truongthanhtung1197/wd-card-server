import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { User } from 'src/user/entities/user.entity';
import { UserRole } from 'src/user-role/entities/user-role.entity';
import { Wedding } from 'src/wedding/entities/wedding.entity';
import { Media } from './entities/media.entity';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

@Module({
  imports: [TypeOrmModule.forFeature([Media, Wedding, User, UserRole])],
  controllers: [MediaController],
  providers: [MediaService, RolesGuard],
  exports: [MediaService],
})
export class MediaModule {}

