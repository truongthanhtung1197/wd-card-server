import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { User } from 'src/user/entities/user.entity';
import { UserRole } from 'src/user-role/entities/user-role.entity';
import { Wedding } from 'src/wedding/entities/wedding.entity';
import { Rsvp } from './entities/rsvp.entity';
import { RsvpController } from './rsvp.controller';
import { RsvpService } from './rsvp.service';

@Module({
  imports: [TypeOrmModule.forFeature([Rsvp, Wedding, User, UserRole])],
  controllers: [RsvpController],
  providers: [RsvpService, RolesGuard],
  exports: [RsvpService],
})
export class RsvpModule {}

