import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { UserDomain } from './entities/user-domain.entity';
import { UserDomainController } from './user-domain.controller';
import { UserDomainService } from './user-domain.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserDomain, User])],
  controllers: [UserDomainController],
  providers: [UserDomainService],
  exports: [UserDomainService],
})
export class UserDomainModule {}
