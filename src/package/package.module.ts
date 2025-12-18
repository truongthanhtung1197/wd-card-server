import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PackageFeature } from 'src/package-feature/entities/package-feature.entity';
import { PackageFeatureService } from 'src/package-feature/package-feature.service';
import { User } from 'src/user/entities/user.entity';
import { UserRole } from 'src/user-role/entities/user-role.entity';
import { Package } from './entities/package.entity';
import { PackageController } from './package.controller';
import { PackageService } from './package.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Package, PackageFeature, User, UserRole]),
  ],
  controllers: [PackageController],
  providers: [PackageService, PackageFeatureService, RolesGuard],
  exports: [PackageService, PackageFeatureService],
})
export class PackageModule {}
